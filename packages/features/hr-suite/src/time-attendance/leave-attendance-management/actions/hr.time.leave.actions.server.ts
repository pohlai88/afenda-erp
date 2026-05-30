"use server";

import {
  adjustHrLeaveBalanceManual,
  amendHrLeaveApplication,
  cancelHrLeaveApplication,
  decideHrLeaveApplication,
  listHrUnpaidLeavePayrollDeductionRefs,
  processHrLeaveCarryForwardForYear,
  type HrLeaveDecision,
} from "@afenda/db";
import {
  actionFailure,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";
import { z } from "zod";

import { hrTimeLeaveAuditActions } from "../events/hr.time.leave.event";
import {
  requireHrTimeLeaveDecide,
  requireHrTimeLeaveWrite,
} from "../policies/hr.time.leave-access.policy.server";
import {
  adjustHrLeaveBalanceFormSchema,
  carryForwardHrLeaveFormSchema,
  decideHrLeaveApplicationFormSchema,
} from "../schemas/hr.time.leave-decision.schema";
import { finalizeHrTimeLeaveMutation } from "./hr.time.leave.mutation.shared.server";

function parseForm<T extends z.ZodType>(schema: T, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return schema.safeParse(raw);
}

export async function decideHrLeaveApplicationAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(decideHrLeaveApplicationFormSchema, formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeLeaveDecide();
  const {
    requestId,
    decision,
    rejectionReason,
    decisionNote,
    returnedNote,
    clarificationNote,
  } = parsed.data;

  const auditAction =
    decision === "approve"
      ? hrTimeLeaveAuditActions.approval.approved
      : decision === "reject"
        ? hrTimeLeaveAuditActions.approval.rejected
        : decision === "return"
          ? hrTimeLeaveAuditActions.approval.returned
          : hrTimeLeaveAuditActions.approval.clarificationRequested;

  return finalizeHrTimeLeaveMutation(guard.organization.id, async () => {
    const result = await decideHrLeaveApplication({
      organizationId: guard.organization.id,
      requestId,
      decision: decision as HrLeaveDecision,
      rejectionReason,
      decisionNote,
      returnedNote,
      clarificationNote,
      actorAuthUserId: guard.session.id,
      actorCanHrApprove: guard.actorCanHrApprove,
      actorManagerEmployeeIds: guard.actorManagerEmployeeIds,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: auditAction,
      targetId: result.requestId,
      summary: `Leave ${decision}`,
      ...(decision === "reject" && rejectionReason
        ? { reason: rejectionReason }
        : {}),
      metadata: { status: result.status, decision },
    };
  });
}

export async function cancelHrLeaveApplicationAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const requestId = formData.get("requestId");
  if (typeof requestId !== "string" || !requestId.trim()) {
    return actionFailure("Request id is required.");
  }

  const guard = await requireHrTimeLeaveWrite();

  return finalizeHrTimeLeaveMutation(guard.organization.id, async () => {
    const result = await cancelHrLeaveApplication({
      organizationId: guard.organization.id,
      requestId: requestId.trim(),
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeLeaveAuditActions.application.cancelled,
      targetId: result.requestId,
      summary: "Leave application cancelled",
    };
  });
}

const amendLeaveFormSchema = z.object({
  requestId: z.string().min(1),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  reason: z.string().optional(),
});

export async function amendHrLeaveApplicationAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(amendLeaveFormSchema, formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeLeaveWrite();

  return finalizeHrTimeLeaveMutation(guard.organization.id, async () => {
    const result = await amendHrLeaveApplication({
      organizationId: guard.organization.id,
      requestId: parsed.data.requestId,
      startAt: parsed.data.startAt,
      endAt: parsed.data.endAt,
      reason: parsed.data.reason,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeLeaveAuditActions.application.amended,
      targetId: result.amendmentRequestId,
      summary: "Leave application amended",
      metadata: {
        originalRequestId: result.requestId,
        amendmentRequestId: result.amendmentRequestId,
      },
    };
  });
}

export async function adjustHrLeaveBalanceAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(adjustHrLeaveBalanceFormSchema, formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeLeaveWrite();

  return finalizeHrTimeLeaveMutation(guard.organization.id, async () => {
    const result = await adjustHrLeaveBalanceManual({
      organizationId: guard.organization.id,
      employeeId: parsed.data.employeeId,
      leaveType: parsed.data.leaveType,
      entitlementYear: parsed.data.entitlementYear,
      adjustmentDays: parsed.data.adjustmentDays,
      reason: parsed.data.reason,
      authorizedByAuthUserId: guard.session.id,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeLeaveAuditActions.balance.adjusted,
      targetId: result.balanceId,
      summary: "Manual leave balance adjustment",
      reason: parsed.data.reason,
      metadata: {
        adjustmentDays: parsed.data.adjustmentDays,
        leaveType: parsed.data.leaveType,
        entitlementYear: parsed.data.entitlementYear,
      },
    };
  });
}

export async function processHrLeaveCarryForwardAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(carryForwardHrLeaveFormSchema, formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeLeaveWrite();

  return finalizeHrTimeLeaveMutation(guard.organization.id, async () => {
    const result = await processHrLeaveCarryForwardForYear({
      organizationId: guard.organization.id,
      fromYear: parsed.data.fromYear,
      toYear: parsed.data.toYear,
      policyGroupCode: parsed.data.policyGroupCode,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeLeaveAuditActions.balance.carryForwardProcessed,
      targetId: `${parsed.data.fromYear}-${parsed.data.toYear}`,
      summary: "Leave carry-forward processed",
      metadata: result,
    };
  });
}

const payrollExportFormSchema = z.object({
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
});

export async function exportHrUnpaidLeavePayrollRefsAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseForm(payrollExportFormSchema, formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeLeaveWrite();

  const rows = await listHrUnpaidLeavePayrollDeductionRefs({
    organizationId: guard.organization.id,
    periodStart: parsed.data.periodStart,
    periodEnd: parsed.data.periodEnd,
  });

  const audited = await finalizeHrTimeLeaveMutation(
    guard.organization.id,
    async () => ({
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeLeaveAuditActions.payroll.unpaidExported,
      targetId: `${parsed.data.periodStart.toISOString()}_${parsed.data.periodEnd.toISOString()}`,
      summary: "Unpaid leave payroll references exported",
      metadata: { count: rows.length, rows },
    }),
  );

  return audited;
}
