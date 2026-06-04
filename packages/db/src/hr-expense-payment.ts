import { and, eq } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrExpenseAuditEventInTx } from "./hr-expense-audit";
import { HrExpenseCommandError } from "./hr-expense.shared";
import {
  hrExpenseClaims,
  hrExpensePaymentReferences,
} from "./dbx-hr-expense";

export type HrExpensePaymentChannel = "payroll" | "accounts_payable";

function buildEarningsCode(categoryCode: string) {
  const normalized = categoryCode.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
  return `EXP_REIMB_${normalized.slice(0, 24)}`;
}

function formatClaimAmount(value: string | null) {
  if (!value) {
    return "0.00";
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "0.00";
  }
  return amount.toFixed(2);
}

async function loadApprovedClaim(
  db: AfendaTransaction,
  input: { organizationId: string; claimId: string },
) {
  const [claim] = await db
    .select({
      id: hrExpenseClaims.id,
      employeeId: hrExpenseClaims.employeeId,
      claimStatus: hrExpenseClaims.claimStatus,
      claimAmount: hrExpenseClaims.claimAmount,
      approvedAmount: hrExpenseClaims.approvedAmount,
      claimCurrencyCode: hrExpenseClaims.claimCurrencyCode,
      categoryCode: hrExpenseClaims.categoryCode,
    })
    .from(hrExpenseClaims)
    .where(
      and(
        eq(hrExpenseClaims.organizationId, input.organizationId),
        eq(hrExpenseClaims.id, input.claimId),
      ),
    )
    .limit(1);

  if (!claim) {
    throw new HrExpenseCommandError("claim_not_found");
  }

  if (claim.claimStatus !== "approved") {
    throw new HrExpenseCommandError("claim_not_approved");
  }

  const payableAmount = claim.approvedAmount ?? claim.claimAmount;
  const amount = formatClaimAmount(payableAmount);
  if (amount === "0.00") {
    throw new HrExpenseCommandError("claim_not_approved");
  }

  return {
    claim,
    amount,
    currencyCode: claim.claimCurrencyCode,
  };
}

/** HRM-EXP-022 — stage approved reimbursement for Payroll or AP. */
export async function sendHrExpenseClaimToPayrollOrApInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    claimId: string;
    paymentChannel: HrExpensePaymentChannel;
    integrationReference: string;
    actorUserId?: string | null;
    auditAction: string;
  },
): Promise<{
  paymentReferenceId: string;
  integrationReference: string;
  paymentChannel: HrExpensePaymentChannel;
}> {
  if (
    input.paymentChannel !== "payroll" &&
    input.paymentChannel !== "accounts_payable"
  ) {
    throw new HrExpenseCommandError("invalid_payment_channel");
  }

  const { claim, amount, currencyCode } = await loadApprovedClaim(db, input);

  const [existing] = await db
    .select({ id: hrExpensePaymentReferences.id })
    .from(hrExpensePaymentReferences)
    .where(
      and(
        eq(hrExpensePaymentReferences.organizationId, input.organizationId),
        eq(hrExpensePaymentReferences.claimId, input.claimId),
        eq(hrExpensePaymentReferences.active, true),
      ),
    )
    .limit(1);

  if (existing) {
    const [ref] = await db
      .select({
        id: hrExpensePaymentReferences.id,
        integrationReference: hrExpensePaymentReferences.integrationReference,
        paymentChannel: hrExpensePaymentReferences.paymentChannel,
      })
      .from(hrExpensePaymentReferences)
      .where(eq(hrExpensePaymentReferences.id, existing.id))
      .limit(1);
    return {
      paymentReferenceId: ref!.id,
      integrationReference: ref!.integrationReference,
      paymentChannel: ref!.paymentChannel,
    };
  }

  const paymentReferenceId = createEntityId("hr_exp_pay_ref");
  const earningsCode =
    input.paymentChannel === "payroll"
      ? buildEarningsCode(claim.categoryCode)
      : null;

  await db.insert(hrExpensePaymentReferences).values({
    id: paymentReferenceId,
    organizationId: input.organizationId,
    claimId: input.claimId,
    paymentChannel: input.paymentChannel,
    integrationReference: input.integrationReference,
    amount,
    currencyCode,
    earningsCode,
    active: true,
    stagedAt: new Date(),
  });

  await appendHrExpenseAuditEventInTx(db, {
    organizationId: input.organizationId,
    claimId: input.claimId,
    employeeId: claim.employeeId,
    actorUserId: input.actorUserId,
    action: input.auditAction,
    summary:
      input.paymentChannel === "payroll"
        ? "Expense reimbursement staged for Payroll Processing."
        : "Expense reimbursement staged for Accounts Payable.",
    metadata: {
      paymentReferenceId,
      integrationReference: input.integrationReference,
      paymentChannel: input.paymentChannel,
      amount,
      currencyCode,
    },
  });

  return {
    paymentReferenceId,
    integrationReference: input.integrationReference,
    paymentChannel: input.paymentChannel,
  };
}

/** HRM-EXP-023 — record external payment reference after processing. */
export async function recordHrExpensePaymentReferenceInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    claimId: string;
    paymentReference: string;
    paidAt?: Date;
    actorUserId?: string | null;
    auditAction: string;
  },
): Promise<{
  paymentReferenceId: string;
  paymentReference: string;
  claimStatus: "paid";
}> {
  const [ref] = await db
    .select({
      id: hrExpensePaymentReferences.id,
      claimId: hrExpensePaymentReferences.claimId,
    })
    .from(hrExpensePaymentReferences)
    .where(
      and(
        eq(hrExpensePaymentReferences.organizationId, input.organizationId),
        eq(hrExpensePaymentReferences.claimId, input.claimId),
        eq(hrExpensePaymentReferences.active, true),
      ),
    )
    .limit(1);

  if (!ref) {
    throw new HrExpenseCommandError("payment_reference_not_found");
  }

  const paidAt = input.paidAt ?? new Date();

  await db
    .update(hrExpensePaymentReferences)
    .set({
      paymentReference: input.paymentReference,
      paidAt,
      syncedAt: paidAt,
      updatedAt: paidAt,
    })
    .where(eq(hrExpensePaymentReferences.id, ref.id));

  const claim = await db
    .update(hrExpenseClaims)
    .set({
      claimStatus: "paid",
      paidAt,
      updatedAt: paidAt,
    })
    .where(
      and(
        eq(hrExpenseClaims.organizationId, input.organizationId),
        eq(hrExpenseClaims.id, input.claimId),
      ),
    )
    .returning({
      id: hrExpenseClaims.id,
      employeeId: hrExpenseClaims.employeeId,
    })
    .then((rows) => rows[0]);

  await appendHrExpenseAuditEventInTx(db, {
    organizationId: input.organizationId,
    claimId: input.claimId,
    employeeId: claim?.employeeId ?? null,
    actorUserId: input.actorUserId,
    action: input.auditAction,
    summary: "Reimbursement payment reference recorded.",
    metadata: {
      paymentReferenceId: ref.id,
      paymentReference: input.paymentReference,
      paidAt: paidAt.toISOString(),
    },
    occurredAt: paidAt,
  });

  return {
    paymentReferenceId: ref.id,
    paymentReference: input.paymentReference,
    claimStatus: "paid",
  };
}

export async function updateHrExpenseClaimAccountingAllocationInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    claimId: string;
    allocation: {
      legalEntityCode?: string;
      departmentId?: string;
      costCenterCode?: string;
      projectCode?: string;
      glReference?: string;
    };
    actorUserId?: string | null;
    auditAction: string;
  },
): Promise<{ claimId: string }> {
  const [existing] = await db
    .select({ id: hrExpenseClaims.id, employeeId: hrExpenseClaims.employeeId })
    .from(hrExpenseClaims)
    .where(
      and(
        eq(hrExpenseClaims.organizationId, input.organizationId),
        eq(hrExpenseClaims.id, input.claimId),
      ),
    )
    .limit(1);

  if (!existing) {
    throw new HrExpenseCommandError("claim_not_found");
  }

  await db
    .update(hrExpenseClaims)
    .set({
      legalEntityCode: input.allocation.legalEntityCode,
      departmentId: input.allocation.departmentId,
      costCenterCode: input.allocation.costCenterCode,
      projectCode: input.allocation.projectCode,
      glReference: input.allocation.glReference,
      updatedAt: new Date(),
    })
    .where(eq(hrExpenseClaims.id, input.claimId));

  await appendHrExpenseAuditEventInTx(db, {
    organizationId: input.organizationId,
    claimId: input.claimId,
    employeeId: existing.employeeId,
    actorUserId: input.actorUserId,
    action: input.auditAction,
    summary: "Accounting allocation updated for expense claim.",
    metadata: input.allocation,
  });

  return { claimId: input.claimId };
}

export async function sendHrExpenseClaimToPayrollOrAp(input: {
  organizationId: string;
  claimId: string;
  paymentChannel: HrExpensePaymentChannel;
  integrationReference: string;
  actorUserId?: string | null;
  auditAction: string;
}) {
  return runWithOrganizationContext(input.organizationId, (db) =>
    sendHrExpenseClaimToPayrollOrApInTx(db, input),
  );
}

export async function recordHrExpensePaymentReference(input: {
  organizationId: string;
  claimId: string;
  paymentReference: string;
  paidAt?: Date;
  actorUserId?: string | null;
  auditAction: string;
}) {
  return runWithOrganizationContext(input.organizationId, (db) =>
    recordHrExpensePaymentReferenceInTx(db, input),
  );
}

export async function updateHrExpenseClaimAccountingAllocation(input: {
  organizationId: string;
  claimId: string;
  allocation: {
    legalEntityCode?: string;
    departmentId?: string;
    costCenterCode?: string;
    projectCode?: string;
    glReference?: string;
  };
  actorUserId?: string | null;
  auditAction: string;
}) {
  return runWithOrganizationContext(input.organizationId, (db) =>
    updateHrExpenseClaimAccountingAllocationInTx(db, input),
  );
}

