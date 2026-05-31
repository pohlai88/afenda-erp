/** HRM-SFT-021/029 — swap approval routing and authorization gates. */

import type { HrSftSwapDecision } from "../schemas/hr.time.sft-swap.schema";

export type HrTimeSftSwapAccessContext = {
  canReadOrg: boolean;
  canManageSchedule: boolean;
  actorEmployeeId: string | null;
  requesterManagerEmployeeId: string | null;
};

export function canHrTimeSftSubmitSwapRequest(input: {
  swapRequestsEnabled: boolean;
  linkedEmployeeId: string | null;
}): boolean {
  return input.swapRequestsEnabled && Boolean(input.linkedEmployeeId);
}

export function canHrTimeSftReviewSwapRequest(
  context: HrTimeSftSwapAccessContext,
): boolean {
  return context.canManageSchedule;
}

export function canHrTimeSftReviewSwapRequestAsManager(
  context: HrTimeSftSwapAccessContext,
  _requesterEmployeeId: string,
): boolean {
  if (context.canManageSchedule) {
    return true;
  }
  if (!context.actorEmployeeId || !context.requesterManagerEmployeeId) {
    return false;
  }
  return context.actorEmployeeId === context.requesterManagerEmployeeId;
}

export function assertHrTimeSftSwapDecisionPermitted(input: {
  context: HrTimeSftSwapAccessContext;
  decision: HrSftSwapDecision;
}): void {
  if (!canHrTimeSftReviewSwapRequest(input.context)) {
    throw new Error("hr_sft_swap_review_denied");
  }
}

export function canHrTimeSftInitiateScheduleChange(
  context: Pick<HrTimeSftSwapAccessContext, "canManageSchedule">,
): boolean {
  return context.canManageSchedule;
}
