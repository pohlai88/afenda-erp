"use server";

import {
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";

import { submitHrTimeOtmRequest } from "./hrs-hr-time-otm-request-commands-server";
import { hrTimeOtmAuditActions } from "./hr.time.otm.event";
import {
  assertHrTimeOtmCanSubmitForEmployee,
  requireHrTimeOtmEmployeeSubmit,
  requireHrTimeOtmOnBehalfSubmit,
} from "./hr.time.otm-access.policy.server";
import {
  parseApplyOtmOnBehalfForm,
  parseRequestOwnOtmForm,
  resolveOtmSubmitHours,
} from "./hr.time.otm-request.schema";
import { finalizeHrTimeOtmMutation } from "./hr.time.otm.mutation.shared.server";

function toIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** HRM-OTM-001 — employee submits own overtime request. */
export async function requestOwnOtmAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseRequestOwnOtmForm(formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeOtmEmployeeSubmit();
  const data = parsed.data;

  return finalizeHrTimeOtmMutation(guard.organization.id, async () => {
    const hours = resolveOtmSubmitHours({
      hours: data.hours,
      startTime: data.startTime,
      endTime: data.endTime,
    });

    const result = await submitHrTimeOtmRequest({
      organizationId: guard.organization.id,
      employeeId: guard.selfEmployeeId,
      actorAuthUserId: guard.session.id,
      overtimeType: data.overtimeType,
      timingKind: data.timingKind,
      workDate: data.workDate,
      startTime: data.startTime ?? null,
      endTime: data.endTime ?? null,
      hours,
      reason: data.reason,
      policyGroupCode: data.policyGroupCode,
      eligibilityExceptionReason: data.eligibilityExceptionReason,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeOtmAuditActions.request.submit,
      targetId: result.requestId,
      summary: "Overtime request submitted",
      metadata: {
        employeeId: guard.selfEmployeeId,
        overtimeType: data.overtimeType,
        timingKind: data.timingKind,
        workDate: toIsoDate(data.workDate),
        hours,
      },
    };
  });
}

/** HRM-OTM-001 — authorized manager or HR submits overtime on behalf of an employee. */
export async function applyOtmOnBehalfAction(
  _previous: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseApplyOtmOnBehalfForm(formData);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  const guard = await requireHrTimeOtmOnBehalfSubmit();
  await assertHrTimeOtmCanSubmitForEmployee(guard, parsed.data.employeeId);
  const data = parsed.data;

  return finalizeHrTimeOtmMutation(guard.organization.id, async () => {
    const hours = resolveOtmSubmitHours({
      hours: data.hours,
      startTime: data.startTime,
      endTime: data.endTime,
    });

    const result = await submitHrTimeOtmRequest({
      organizationId: guard.organization.id,
      employeeId: data.employeeId,
      actorAuthUserId: guard.session.id,
      overtimeType: data.overtimeType,
      timingKind: data.timingKind,
      workDate: data.workDate,
      startTime: data.startTime ?? null,
      endTime: data.endTime ?? null,
      hours,
      reason: data.reason,
      policyGroupCode: data.policyGroupCode,
      eligibilityExceptionReason: data.eligibilityExceptionReason,
    });

    return {
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      action: hrTimeOtmAuditActions.request.submit,
      targetId: result.requestId,
      summary: "Overtime request submitted on behalf of employee",
      metadata: {
        employeeId: data.employeeId,
        overtimeType: data.overtimeType,
        timingKind: data.timingKind,
        workDate: toIsoDate(data.workDate),
        hours,
        onBehalf: true,
      },
    };
  });
}
