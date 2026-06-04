import { submitHrOvertimeRequest, type HrOvertimeType } from "@afenda/db";

import { createHrTimeOtmApprovalOnSubmit } from "./hrs-hr-time-otm-approval-commands-server";

export type SubmitHrTimeOtmRequestInput = {
  organizationId: string;
  employeeId: string;
  actorAuthUserId: string;
  overtimeType: HrOvertimeType;
  timingKind?: "planned" | "actual";
  workDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  hours: number;
  reason: string;
  policyGroupCode?: string;
  eligibilityExceptionReason?: string | null;
};

/** HRM-OTM-001..006 — persist submitted overtime request (eligibility enforced in @afenda/db). */
export async function submitHrTimeOtmRequest(
  input: SubmitHrTimeOtmRequestInput,
): Promise<{ requestId: string }> {
  const result = await submitHrOvertimeRequest({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    overtimeType: input.overtimeType,
    timingKind: input.timingKind,
    workDate: input.workDate,
    startTime: input.startTime,
    endTime: input.endTime,
    hours: input.hours,
    reason: input.reason,
    policyGroupCode: input.policyGroupCode ?? "default",
    eligibilityExceptionReason: input.eligibilityExceptionReason,
    actorAuthUserId: input.actorAuthUserId,
  });

  await createHrTimeOtmApprovalOnSubmit({
    organizationId: input.organizationId,
    requestId: result.requestId,
    employeeId: input.employeeId,
    policyGroupCode: input.policyGroupCode ?? "default",
    hasEligibilityException: Boolean(input.eligibilityExceptionReason?.trim()),
  });

  return result;
}
