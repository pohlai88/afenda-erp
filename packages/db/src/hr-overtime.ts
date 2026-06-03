import {
  appendHrOvertimeAuditEvent,
  HrOtmCommandError,
  listHrOvertimeRequestsWindow,
  submitHrOvertimeRequest as submitHrOvertimeRequestCommand,
  type HrOvertimeRequestRow,
  type HrOvertimeRequestWindow,
} from "./hr-otm";
import {
  executeHrOvertimeRequestApproval,
  type ExecuteHrOvertimeApprovalInput,
} from "./hr-otm-approval.server";
import { runWithOrganizationContext } from "./client";
import { hrOvertimeRequests } from "./hr";
import { and, eq } from "drizzle-orm";

export type { HrOvertimeRequestRow, HrOvertimeRequestWindow };
export { listHrOvertimeRequestsWindow };

export class HrOvertimeCommandError extends HrOtmCommandError {}
export { HrOtmCommandError };

async function rejectHrOvertimeRequestInternal(input: {
  organizationId: string;
  requestId: string;
  decisionNote?: string | null;
  actorAuthUserId?: string | null;
}): Promise<{ requestId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [request] = await db
      .select({
        id: hrOvertimeRequests.id,
        employeeId: hrOvertimeRequests.employeeId,
        status: hrOvertimeRequests.status,
      })
      .from(hrOvertimeRequests)
      .where(
        and(
          eq(hrOvertimeRequests.organizationId, input.organizationId),
          eq(hrOvertimeRequests.id, input.requestId),
        ),
      )
      .limit(1);

    if (!request) {
      throw new HrOvertimeCommandError("request_not_found");
    }
    if (request.status !== "pending" && request.status !== "submitted") {
      throw new HrOvertimeCommandError("invalid_status_transition");
    }

    await db
      .update(hrOvertimeRequests)
      .set({
        status: "rejected",
        decisionNote: input.decisionNote?.trim() || null,
        decidedAt: new Date(),
        payableMinutes: null,
        amountCents: null,
      })
      .where(eq(hrOvertimeRequests.id, input.requestId));

    await appendHrOvertimeAuditEvent({
      organizationId: input.organizationId,
      requestId: input.requestId,
      employeeId: request.employeeId,
      action: "request_reject",
      actorAuthUserId: input.actorAuthUserId ?? null,
      summary: "Overtime request rejected",
      metadata: input.decisionNote
        ? { decisionNote: input.decisionNote.trim() }
        : undefined,
    });

    return { requestId: input.requestId };
  });
}

export async function submitHrOvertimeRequest(input: {
  organizationId: string;
  employeeId: string;
  overtimeType: Parameters<typeof submitHrOvertimeRequestCommand>[0]["overtimeType"];
  timingKind?: Parameters<typeof submitHrOvertimeRequestCommand>[0]["timingKind"];
  workDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  hours?: number;
  reason?: string | null;
  policyGroupCode?: string;
  eligibilityExceptionReason?: string | null;
  actorAuthUserId?: string | null;
}): Promise<{ requestId: string }> {
  return submitHrOvertimeRequestCommand(input);
}

export async function approveHrOvertimeRequest(
  input: ExecuteHrOvertimeApprovalInput,
): Promise<{
  requestId: string;
  payableMinutes: number;
  amountCents: number;
  earningCode: string;
  compensatoryCredited: boolean;
}> {
  try {
    return await executeHrOvertimeRequestApproval(input);
  } catch (error) {
    if (error instanceof HrOtmCommandError) {
      throw new HrOvertimeCommandError(error.code);
    }
    throw error;
  }
}

export async function rejectHrOvertimeRequest(input: {
  organizationId: string;
  requestId: string;
  decisionNote?: string | null;
  actorAuthUserId?: string | null;
}): Promise<{ requestId: string }> {
  try {
    return await rejectHrOvertimeRequestInternal(input);
  } catch (error) {
    if (error instanceof HrOtmCommandError) {
      throw new HrOvertimeCommandError(error.code);
    }
    throw error;
  }
}

export async function cancelHrOvertimeRequest(input: {
  organizationId: string;
  requestId: string;
  actorAuthUserId?: string | null;
}): Promise<{ requestId: string }> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [request] = await db
      .select({
        id: hrOvertimeRequests.id,
        employeeId: hrOvertimeRequests.employeeId,
        status: hrOvertimeRequests.status,
      })
      .from(hrOvertimeRequests)
      .where(
        and(
          eq(hrOvertimeRequests.organizationId, input.organizationId),
          eq(hrOvertimeRequests.id, input.requestId),
        ),
      )
      .limit(1);

    if (!request) {
      throw new HrOvertimeCommandError("request_not_found");
    }
    if (
      request.status !== "pending" &&
      request.status !== "submitted" &&
      request.status !== "draft" &&
      request.status !== "returned"
    ) {
      throw new HrOvertimeCommandError("invalid_status_transition");
    }

    await db
      .update(hrOvertimeRequests)
      .set({
        status: "cancelled",
        decidedAt: new Date(),
      })
      .where(eq(hrOvertimeRequests.id, input.requestId));

    await appendHrOvertimeAuditEvent({
      organizationId: input.organizationId,
      requestId: input.requestId,
      employeeId: request.employeeId,
      action: "request_cancel",
      actorAuthUserId: input.actorAuthUserId ?? null,
      summary: "Overtime request cancelled",
    });

    return { requestId: input.requestId };
  });
}

export {
  saveHrOvertimeDraft,
  submitHrOvertimeDraft,
  markHrOvertimePayrollReady,
  markHrOvertimePaid,
  evaluateHrOvertimeEmployeeEligibility,
  validateHrOvertimeEligibilityForSubmit,
  createHrOvertimeEligibilityRule,
  listHrOvertimeEligibilityRules,
  summarizeHrOvertimeReport,
  buildHrOvertimeReportCsv,
  enqueueHrOvertimeNotification,
  listHrOvertimeNotificationsWindow,
  getHrOvertimePolicy,
  upsertHrOvertimePolicy,
  listHrOvertimeRateRules,
  createHrOvertimeRateRule,
  syncHrOvertimeExceptions,
  listHrOvertimeExceptions,
  hasOpenHrOvertimeExceptions,
  sumHrOvertimeApprovedMinutesForEmployee,
  calculateAndPersistHrOvertimeApproval,
} from "./hr-otm";

export {
  executeHrOvertimeRequestApproval,
  decideHrOvertimeRequest,
  bulkApproveHrOvertimeRequests,
  createHrOvertimeApprovalOnSubmit,
  decideHrOvertimeException,
  resolveOtmSubmissionApproversForRequest,
  type ExecuteHrOvertimeApprovalInput,
  type DecideHrOvertimeRequestInput,
} from "./hr-otm-approval.server";

export {
  assertOtmDecisionReason,
  buildOtmManagerChain,
  clampOtmManagerChainDepth,
  matchesOtmApprovalRoute,
  nextOtmStageAfterManagerApproval,
  otmRouteSpecificityScore,
  pickHighestPriorityOtmApprovalRoute,
  resolveOtmApprovalRouteFromChain,
  resolveOtmInitialApprovalStage,
  resolveOtmSubmissionApprovers,
  type HrOvertimeApprovalRouteRow,
  type HrOvertimeApprovalSnapshot,
  type HrOvertimeApprovalStage,
  type HrOvertimeApproverKind,
  type HrOvertimeDecisionKind,
  type HrOvertimeResolvedApprovalRoute,
} from "./hr-otm-approval.shared";

export {
  applyHrOvertimeCalculationSnapshot,
  buildOtmCalculationSnapshot,
  computeOtmAmountCents,
  HRM_OTM_DEFAULT_HOURLY_RATE_CENTS,
  HRM_OTM_MINUTES_PER_LEAVE_DAY,
  resolveOtmEarningCode,
  resolveOtmPayMultiplier,
  roundOtmPayableMinutes,
  calculateOtmPayableForApproval,
  applyOtmRounding,
  applyOtmCaps,
  detectOtmShiftVariance,
  detectOtmAttendanceMismatch,
  enforceOtmMinDuration,
  resolveOtmRateMultiplier,
  resolveOtmRequestedMinutes,
  resolveOtmMinutesFromAttendance,
  deriveOtmDayCategoryFromType,
  DEFAULT_HR_OVERTIME_POLICY,
  type OtmCalculationSnapshot,
  type HrOvertimeCalculationResult,
  type HrOvertimePolicyConfig,
  type HrOvertimeRateRuleRow,
} from "./hr-otm-calculation.server";

export {
  creditHrOvertimeCompensatoryLeave,
  otmPayableMinutesToCompensatoryLeaveDays,
} from "./hr-otm-compensatory.server";

export {
  HRM_OTM_PAYROLL_EXPORTABLE_STATUS,
  listApprovedOvertimeEarningsForEmployeePeriod,
  listHrOvertimePayrollEarningsForEmployeePeriod,
  recordHrOvertimePayrollExportAudit,
  type HrOvertimePayrollEarningLine,
} from "./hr-otm-payroll-export.server";

export {
  canTransitionOtmStatus,
  computeOtmDurationMinutesFromTimeRange,
  formatOtmDurationMinutes,
  formatOtmStatusLabel,
  HRM_OTM_DAY_CATEGORIES,
  HRM_OTM_TIMING_KINDS,
  HRM_OTM_VISIBLE_STATUSES,
  otmMatchesEligibilityRule,
  otmRuleSpecificityScore,
  resolveOtmEligibilityForSubmit,
  resolveOtmEligibilityFromRules,
  type HrOvertimeEligibilityResult,
  type HrOvertimeEligibilityRuleRow,
  type HrOvertimeReportGroupBy,
  type HrOvertimeRequestStatus,
  type HrOvertimeTimingKind,
  type HrOvertimeType,
} from "./hr-otm.shared";

export type { HrOvertimeReportRow } from "./hr-otm";
