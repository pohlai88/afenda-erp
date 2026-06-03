import {
  decideHrShiftSwapRequest,
  getHrShiftAssignmentSwapContext,
  getHrShiftEmployeeManagerId,
  getHrShiftSchedulingPolicy,
  hasPendingHrShiftSwapOnAssignment,
  HrShiftWorkflowCommandError,
  listHrShiftSwapRequestsWindow,
  submitHrShiftSwapRequest,
  type HrShiftSwapRequestWindow,
} from "@afenda/db";

import type {
  HrSftDecideSwapRequestInput,
  HrSftSubmitSwapRequestInput,
} from "./hr.time.sft-swap.schema";
import {
  evaluateHrShiftSwapEligibility,
  resolveHrShiftSwapApprovalRoute,
} from "./hr.time.sft-swap-eligibility.shared";

export type { HrShiftSwapRequestWindow };

export class HrTimeSftSwapIneligibleError extends Error {
  readonly reasons: readonly string[];

  constructor(reasons: readonly string[]) {
    super("hr_sft_swap_ineligible");
    this.name = "HrTimeSftSwapIneligibleError";
    this.reasons = reasons;
  }
}

/** HRM-SFT-019/020/021 — submit employee swap with eligibility + routing. */
export async function submitHrTimeSftSwapRequest(input: {
  organizationId: string;
  requesterEmployeeId: string;
  actorAuthUserId: string;
  payload: HrSftSubmitSwapRequestInput;
}): Promise<{
  swapRequestId: string;
  route: ReturnType<typeof resolveHrShiftSwapApprovalRoute>;
}> {
  const [policy, requesterAssignment, targetAssignment, pendingSwapOnRequesterAssignment] =
    await Promise.all([
      getHrShiftSchedulingPolicy({ organizationId: input.organizationId }),
      getHrShiftAssignmentSwapContext({
        organizationId: input.organizationId,
        assignmentId: input.payload.requesterAssignmentId,
      }),
      input.payload.targetAssignmentId
        ? getHrShiftAssignmentSwapContext({
            organizationId: input.organizationId,
            assignmentId: input.payload.targetAssignmentId,
          })
        : Promise.resolve(null),
      hasPendingHrShiftSwapOnAssignment({
        organizationId: input.organizationId,
        assignmentId: input.payload.requesterAssignmentId,
      }),
    ]);

  if (!requesterAssignment) {
    throw new HrShiftWorkflowCommandError("assignment_not_found");
  }

  const eligibility = evaluateHrShiftSwapEligibility({
    swapRequestsEnabled: policy.swapRequestsEnabled,
    requesterEmployeeId: input.requesterEmployeeId,
    requesterAssignment,
    targetEmployeeId: input.payload.targetEmployeeId,
    targetAssignment: targetAssignment ?? undefined,
    pendingSwapOnRequesterAssignment,
  });

  if (!eligibility.eligible) {
    throw new HrTimeSftSwapIneligibleError(eligibility.reasons);
  }

  const requesterManagerEmployeeId = await getHrShiftEmployeeManagerId({
    organizationId: input.organizationId,
    employeeId: input.requesterEmployeeId,
  });

  const route = resolveHrShiftSwapApprovalRoute({
    requesterManagerEmployeeId,
    canManageSchedule: false,
  });

  const submitted = await submitHrShiftSwapRequest({
    organizationId: input.organizationId,
    requesterEmployeeId: input.requesterEmployeeId,
    requesterAssignmentId: input.payload.requesterAssignmentId,
    targetEmployeeId: input.payload.targetEmployeeId,
    targetAssignmentId: input.payload.targetAssignmentId,
    reason: input.payload.reason,
    actorAuthUserId: input.actorAuthUserId,
  });

  return { swapRequestId: submitted.swapRequestId, route };
}

/** HRM-SFT-022/023 — manager approve/reject/return/override. */
export async function decideHrTimeSftSwapRequest(input: {
  organizationId: string;
  actorAuthUserId: string;
  payload: HrSftDecideSwapRequestInput;
}) {
  return decideHrShiftSwapRequest({
    organizationId: input.organizationId,
    swapRequestId: input.payload.swapRequestId,
    decision: input.payload.decision,
    actorAuthUserId: input.actorAuthUserId,
    rejectionReason: input.payload.rejectionReason,
    overrideReason: input.payload.overrideReason,
    returnedNote: input.payload.returnedNote,
    decisionNote: input.payload.decisionNote,
  });
}

export async function loadHrTimeSftSwapPendingWindow(input: {
  organizationId: string;
  managerEmployeeId?: string;
  limit?: number;
  offset?: number;
}): Promise<HrShiftSwapRequestWindow> {
  return listHrShiftSwapRequestsWindow({
    organizationId: input.organizationId,
    status: "actionable",
    managerEmployeeId: input.managerEmployeeId,
    limit: input.limit,
    offset: input.offset,
  });
}

export async function loadHrTimeSftMySwapsWindow(input: {
  organizationId: string;
  requesterEmployeeId: string;
  limit?: number;
  offset?: number;
}): Promise<HrShiftSwapRequestWindow> {
  return listHrShiftSwapRequestsWindow({
    organizationId: input.organizationId,
    requesterEmployeeId: input.requesterEmployeeId,
    limit: input.limit,
    offset: input.offset,
  });
}
