"use server";

import {
  bulkApproveHrOvertimeRequests,
  decideHrOvertimeException,
  decideHrOvertimeRequest,
} from "@afenda/db";

import { requireHrTimeOtmWrite } from "./hr.time.otm-access.policy.server";
import {
  otmAdjustFormSchema,
  otmApproveFormSchema,
  otmBulkApproveFormSchema,
  otmExceptionDecisionFormSchema,
  otmRejectFormSchema,
  otmReturnFormSchema,
} from "./hr.time.otm-decision.schema";

/** HRM-OTM-017 — approve pending overtime (manager stage may advance to HR). */
export async function approveOtmRequestAction(
  _previous: unknown,
  formData: FormData,
) {
  const guard = await requireHrTimeOtmWrite();
  const parsed = otmApproveFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const result = await decideHrOvertimeRequest({
    organizationId: guard.organization.id,
    requestId: parsed.data.requestId,
    decision: "approve",
    actorAuthUserId: guard.session.id,
    actorCanHrApprove: guard.canWriteOtm,
    decisionNote: parsed.data.decisionNote,
  });

  return { ok: true as const, ...result };
}

export async function rejectOtmRequestAction(
  _previous: unknown,
  formData: FormData,
) {
  const guard = await requireHrTimeOtmWrite();
  const parsed = otmRejectFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const result = await decideHrOvertimeRequest({
    organizationId: guard.organization.id,
    requestId: parsed.data.requestId,
    decision: "reject",
    actorAuthUserId: guard.session.id,
    actorCanHrApprove: guard.canWriteOtm,
    rejectionReason: parsed.data.rejectionReason,
  });

  return { ok: true as const, ...result };
}

export async function returnOtmRequestAction(
  _previous: unknown,
  formData: FormData,
) {
  const guard = await requireHrTimeOtmWrite();
  const parsed = otmReturnFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const result = await decideHrOvertimeRequest({
    organizationId: guard.organization.id,
    requestId: parsed.data.requestId,
    decision: "return",
    actorAuthUserId: guard.session.id,
    actorCanHrApprove: guard.canWriteOtm,
    returnReason: parsed.data.returnReason,
  });

  return { ok: true as const, ...result };
}

export async function adjustOtmRequestAction(
  _previous: unknown,
  formData: FormData,
) {
  const guard = await requireHrTimeOtmWrite();
  const parsed = otmAdjustFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const result = await decideHrOvertimeRequest({
    organizationId: guard.organization.id,
    requestId: parsed.data.requestId,
    decision: "adjust",
    actorAuthUserId: guard.session.id,
    actorCanHrApprove: guard.canWriteOtm,
    adjustReason: parsed.data.adjustReason,
    adjustedHours: parsed.data.adjustedHours,
  });

  return { ok: true as const, ...result };
}

/** bulk-016 — bulk approve up to 25 pending requests. */
export async function bulkApproveOtmRequestsAction(input: {
  requestIds: readonly string[];
  decisionNote?: string | null;
}) {
  const guard = await requireHrTimeOtmWrite();
  const parsed = otmBulkApproveFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const result = await bulkApproveHrOvertimeRequests({
    organizationId: guard.organization.id,
    requestIds: parsed.data.requestIds,
    actorAuthUserId: guard.session.id,
    actorCanHrApprove: guard.canWriteOtm,
    decisionNote: parsed.data.decisionNote,
  });

  return { ok: true as const, ...result };
}

/** HRM-OTM-019 — exception inbox approve/reject. */
export async function decideOtmExceptionAction(
  _previous: unknown,
  formData: FormData,
) {
  const guard = await requireHrTimeOtmWrite();
  const parsed = otmExceptionDecisionFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten() };
  }

  const result = await decideHrOvertimeException({
    organizationId: guard.organization.id,
    exceptionId: parsed.data.exceptionId,
    decision: parsed.data.decision,
    actorAuthUserId: guard.session.id,
    reason: parsed.data.reason,
  });

  return { ok: true as const, ...result };
}
