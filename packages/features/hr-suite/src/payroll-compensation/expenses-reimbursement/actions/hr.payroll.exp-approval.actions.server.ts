"use server";

import { decideHrExpenseClaim, decideHrExpenseException } from "@afenda/db";

import { requireHrPayrollExpenseApprove } from "../policies/hr.payroll.exp-access.policy.server";
import {
  expApproveClaimFormSchema,
  expClarificationClaimFormSchema,
  expExceptionApprovalFormSchema,
  expRejectClaimFormSchema,
  expReturnClaimFormSchema,
} from "../schemas/hr.payroll.exp-approval.schema";

/** HRM-EXP-018 — approve pending expense claim (may advance finance/HR stages). */
export async function approveClaimAction(
  _previous: unknown,
  formData: FormData,
) {
  const guard = await requireHrPayrollExpenseApprove();
  const parsed = expApproveClaimFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const result = await decideHrExpenseClaim({
    organizationId: guard.organization.id,
    claimId: parsed.data.claimId,
    decision: "approve",
    actorAuthUserId: guard.session.id,
    actorCanFinanceApprove: guard.canFinanceApprove,
    actorCanHrApprove: guard.canApprove,
    decisionNote: parsed.data.decisionNote,
  });

  return { ok: true as const, ...result };
}

export async function rejectClaimAction(
  _previous: unknown,
  formData: FormData,
) {
  const guard = await requireHrPayrollExpenseApprove();
  const parsed = expRejectClaimFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const result = await decideHrExpenseClaim({
    organizationId: guard.organization.id,
    claimId: parsed.data.claimId,
    decision: "reject",
    actorAuthUserId: guard.session.id,
    actorCanFinanceApprove: guard.canFinanceApprove,
    actorCanHrApprove: guard.canApprove,
    rejectionReason: parsed.data.rejectionReason,
  });

  return { ok: true as const, ...result };
}

export async function returnClaimAction(
  _previous: unknown,
  formData: FormData,
) {
  const guard = await requireHrPayrollExpenseApprove();
  const parsed = expReturnClaimFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const result = await decideHrExpenseClaim({
    organizationId: guard.organization.id,
    claimId: parsed.data.claimId,
    decision: "return",
    actorAuthUserId: guard.session.id,
    actorCanFinanceApprove: guard.canFinanceApprove,
    actorCanHrApprove: guard.canApprove,
    returnReason: parsed.data.returnReason,
  });

  return { ok: true as const, ...result };
}

export async function requestClarificationAction(
  _previous: unknown,
  formData: FormData,
) {
  const guard = await requireHrPayrollExpenseApprove();
  const parsed = expClarificationClaimFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const result = await decideHrExpenseClaim({
    organizationId: guard.organization.id,
    claimId: parsed.data.claimId,
    decision: "request_clarification",
    actorAuthUserId: guard.session.id,
    actorCanFinanceApprove: guard.canFinanceApprove,
    actorCanHrApprove: guard.canApprove,
    clarificationReason: parsed.data.clarificationReason,
  });

  return { ok: true as const, ...result };
}

/** HRM-EXP-020 — exception approval for over-limit, late, missing receipt, non-standard. */
export async function submitExceptionApprovalAction(
  _previous: unknown,
  formData: FormData,
) {
  const guard = await requireHrPayrollExpenseApprove();
  if (!guard.canExceptionApprove) {
    return {
      ok: false as const,
      error: { formErrors: ["Exception approval not permitted."] },
    };
  }

  const parsed = expExceptionApprovalFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const result = await decideHrExpenseException({
    organizationId: guard.organization.id,
    exceptionId: parsed.data.exceptionId,
    decision: parsed.data.decision,
    actorAuthUserId: guard.session.id,
    reason: parsed.data.reason,
  });

  return { ok: true as const, ...result };
}
