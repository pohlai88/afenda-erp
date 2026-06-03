"use server";

import { revalidatePath } from "next/cache";

import {
  actionFailure,
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";

import { hrPayrollExpenseAuditActions } from "./hr.payroll.expense.event";
import { hrExpenseRoutePaths } from "./hr.payroll.expense-route.contract";
import { calculateReimbursementAmounts } from "./hr.payroll.expense-calculation.shared";
import {
  appendHrExpenseAuditEvent,
  detectDuplicateExpenseClaim,
  getHrExpenseClaimById,
  nextHrExpenseClaimReference,
  upsertHrExpenseClaim,
} from "./hr.payroll.expense-store.shared";
import {
  requireHrExpenseApprove,
  requireHrExpenseWrite,
} from "./hr.payroll.expense-access.policy.server";
import { hrExpenseSubmitClaimSchema } from "./hr.payroll.expense-claim.schema";
import {
  expenseCategoryRequiresReceipt,
  formatExpenseEnumLabel,
} from "./hr.payroll.expense-form.shared";

function revalidateExpenseWorkbench() {
  revalidatePath(hrExpenseRoutePaths.expenses);
}

/** HRM-EXP-001 — create and submit expense claim. */
export async function submitHrExpenseClaimAction(
  _previous:
    | ActionResult<{ claimId: string; claimReference: string }>
    | undefined,
  formData: FormData,
): Promise<ActionResult<{ claimId: string; claimReference: string }>> {
  const { session, organization } = await requireHrExpenseWrite();
  const raw = Object.fromEntries(formData.entries());
  const parsed = hrExpenseSubmitClaimSchema.safeParse({
    expenseDate: raw.expenseDate,
    category: raw.category,
    amount: raw.amount,
    currencyCode: raw.currencyCode,
    description: raw.description,
    receiptReference: raw.receiptReference,
    employeeDisplayName: raw.employeeDisplayName,
    employeeNumber: raw.employeeNumber,
  });

  if (!parsed.success) {
    return zodActionFailure<{ claimId: string; claimReference: string }>(
      parsed.error,
    );
  }

  const receiptMandatory = expenseCategoryRequiresReceipt(parsed.data.category);
  if (receiptMandatory && !parsed.data.receiptReference?.trim()) {
    return actionFailure<{ claimId: string; claimReference: string }>(
      `Receipt is required for ${formatExpenseEnumLabel(parsed.data.category)} claims.`,
    );
  }

  const duplicateFlag = detectDuplicateExpenseClaim({
    organizationId: organization.id,
    expenseDate: parsed.data.expenseDate,
    amount: parsed.data.amount,
    category: parsed.data.category,
    description: parsed.data.description,
  });

  const exceptionRequired =
    parsed.data.amount > 200 || receiptMandatory && !parsed.data.receiptReference;

  const now = new Date().toISOString();
  const claimId = `exp-${organization.id}-${Date.now()}`;
  const claimReference = nextHrExpenseClaimReference(organization.id);
  const totals = await calculateReimbursementAmounts({
    reimbursementCurrencyCode: parsed.data.currencyCode,
    lineItems: [
      {
        lineId: "line-1",
        kind: "standard",
        description: parsed.data.description,
        expenseDate: parsed.data.expenseDate,
        decision: "pending",
        amount: parsed.data.amount,
        currencyCode: parsed.data.currencyCode,
      },
    ],
  });

  const claim = upsertHrExpenseClaim({
    id: claimId,
    organizationId: organization.id,
    claimReference,
    expenseDate: parsed.data.expenseDate,
    category: parsed.data.category,
    amount: parsed.data.amount,
    currencyCode: parsed.data.currencyCode,
    description: parsed.data.description,
    receiptReference: parsed.data.receiptReference,
    status: "submitted",
    employeeId: session.id,
    employeeDisplayName: parsed.data.employeeDisplayName ?? "Employee",
    employeeNumber: parsed.data.employeeNumber ?? "EMP-000",
    submittedAt: now,
    reimbursableAmount: totals.reimbursableAmount,
    approvedAmount: totals.approvedAmount,
    rejectedAmount: totals.rejectedAmount,
    duplicateFlag,
    exceptionRequired,
    lineItems: [],
    createdAt: now,
    updatedAt: now,
  });

  appendHrExpenseAuditEvent({
    organizationId: organization.id,
    claimId: claim.id,
    claimReference: claim.claimReference,
    action: hrPayrollExpenseAuditActions.claim.submitted,
    actorUserId: session.id,
    detail: duplicateFlag
      ? "Submitted with duplicate flag for review"
      : "Claim submitted for approval routing",
    createdAt: now,
  });

  revalidateExpenseWorkbench();
  return actionSuccess({ claimId: claim.id, claimReference: claim.claimReference });
}

export async function approveHrExpenseClaimAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrExpenseApprove();
  const claimId = String(formData.get("claimId") ?? "");
  const claim = getHrExpenseClaimById(organization.id, claimId);
  if (!claim) return actionFailure("Claim not found.");

  const now = new Date().toISOString();
  const totals = await calculateReimbursementAmounts({
    reimbursementCurrencyCode: claim.currencyCode,
    lineItems: [
      {
        lineId: "line-1",
        kind: "standard",
        description: claim.description,
        expenseDate: claim.expenseDate,
        decision: "approved",
        amount: claim.amount,
        currencyCode: claim.currencyCode,
      },
    ],
  });

  upsertHrExpenseClaim({
    ...claim,
    status: "approved",
    reimbursableAmount: totals.reimbursableAmount,
    approvedAmount: totals.approvedAmount,
    rejectedAmount: totals.rejectedAmount,
    updatedAt: now,
  });

  appendHrExpenseAuditEvent({
    organizationId: organization.id,
    claimId,
    claimReference: claim.claimReference,
    action: hrPayrollExpenseAuditActions.claim.approved,
    actorUserId: session.id,
    detail: `Approved reimbursable ${totals.reimbursableAmount.toFixed(2)} ${claim.currencyCode}`,
    createdAt: now,
  });

  revalidateExpenseWorkbench();
  return actionSuccess();
}

export async function rejectHrExpenseClaimAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrExpenseApprove();
  const claimId = String(formData.get("claimId") ?? "");
  const rejectionReason = String(formData.get("rejectionReason") ?? "").trim();
  if (!rejectionReason) {
    return actionFailure("Rejection reason is required (HRM-EXP-019).");
  }

  const claim = getHrExpenseClaimById(organization.id, claimId);
  if (!claim) return actionFailure("Claim not found.");

  const now = new Date().toISOString();
  upsertHrExpenseClaim({
    ...claim,
    status: "rejected",
    reimbursableAmount: 0,
    approvedAmount: 0,
    rejectedAmount: claim.amount,
    updatedAt: now,
  });

  appendHrExpenseAuditEvent({
    organizationId: organization.id,
    claimId,
    claimReference: claim.claimReference,
    action: hrPayrollExpenseAuditActions.claim.rejected,
    actorUserId: session.id,
    detail: rejectionReason,
    createdAt: now,
  });

  revalidateExpenseWorkbench();
  return actionSuccess();
}

export async function returnHrExpenseClaimAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrExpenseApprove();
  const claimId = String(formData.get("claimId") ?? "");
  const returnReason = String(formData.get("returnReason") ?? "").trim();
  if (!returnReason) {
    return actionFailure("Return reason is required.");
  }

  const claim = getHrExpenseClaimById(organization.id, claimId);
  if (!claim) return actionFailure("Claim not found.");

  const now = new Date().toISOString();
  upsertHrExpenseClaim({
    ...claim,
    status: "returned",
    updatedAt: now,
  });

  appendHrExpenseAuditEvent({
    organizationId: organization.id,
    claimId,
    claimReference: claim.claimReference,
    action: hrPayrollExpenseAuditActions.claim.returned,
    actorUserId: session.id,
    detail: returnReason,
    createdAt: now,
  });

  revalidateExpenseWorkbench();
  return actionSuccess();
}

export async function requestHrExpenseClarificationAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrExpenseApprove();
  const claimId = String(formData.get("claimId") ?? "");
  const clarificationNote = String(formData.get("clarificationNote") ?? "").trim();
  if (!clarificationNote) {
    return actionFailure("Clarification note is required.");
  }

  const claim = getHrExpenseClaimById(organization.id, claimId);
  if (!claim) return actionFailure("Claim not found.");

  const now = new Date().toISOString();
  upsertHrExpenseClaim({
    ...claim,
    status: "under_review",
    updatedAt: now,
  });

  appendHrExpenseAuditEvent({
    organizationId: organization.id,
    claimId,
    claimReference: claim.claimReference,
    action: hrPayrollExpenseAuditActions.claim.clarificationRequested,
    actorUserId: session.id,
    detail: clarificationNote,
    createdAt: now,
  });

  revalidateExpenseWorkbench();
  return actionSuccess();
}

/** HRM-EXP-003 — attach receipt reference after upload. */
export async function attachHrExpenseReceiptAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const { session, organization } = await requireHrExpenseWrite();
  const claimId = String(formData.get("claimId") ?? "");
  const receiptReference = String(formData.get("receiptReference") ?? "").trim();
  if (!receiptReference) {
    return actionFailure("Receipt reference is required.");
  }

  const claim = getHrExpenseClaimById(organization.id, claimId);
  if (!claim) return actionFailure("Claim not found.");

  const now = new Date().toISOString();
  upsertHrExpenseClaim({
    ...claim,
    receiptReference,
    updatedAt: now,
  });

  appendHrExpenseAuditEvent({
    organizationId: organization.id,
    claimId,
    claimReference: claim.claimReference,
    action: hrPayrollExpenseAuditActions.claim.receiptUploaded,
    actorUserId: session.id,
    detail: receiptReference,
    createdAt: now,
  });

  revalidateExpenseWorkbench();
  return actionSuccess();
}
