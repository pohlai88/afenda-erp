/** HRM-SFT-019/020 — pure shift swap eligibility validation. */

export type HrShiftSwapAssignmentContext = {
  readonly assignmentId: string;
  readonly employeeId: string;
  readonly templateId: string;
  readonly shiftDate: Date;
  readonly status: string;
};

export type HrShiftSwapEligibilityInput = {
  readonly swapRequestsEnabled: boolean;
  readonly requesterEmployeeId: string;
  readonly requesterAssignment: HrShiftSwapAssignmentContext;
  readonly targetEmployeeId?: string | null;
  readonly targetAssignment?: HrShiftSwapAssignmentContext | null;
  readonly pendingSwapOnRequesterAssignment?: boolean;
  readonly requesterHasLeaveConflict?: boolean;
  readonly targetHasLeaveConflict?: boolean;
};

export type HrShiftSwapEligibilityResult = {
  readonly eligible: boolean;
  readonly reasons: readonly string[];
};

function isSwappableStatus(status: string): boolean {
  return status === "scheduled" || status === "published";
}

export function evaluateHrShiftSwapEligibility(
  input: HrShiftSwapEligibilityInput,
): HrShiftSwapEligibilityResult {
  const reasons: string[] = [];

  if (!input.swapRequestsEnabled) {
    reasons.push("Shift swap requests are disabled for this organization.");
  }

  if (input.requesterAssignment.employeeId !== input.requesterEmployeeId) {
    reasons.push("You can only swap shifts assigned to you.");
  }

  if (!isSwappableStatus(input.requesterAssignment.status)) {
    reasons.push("Only scheduled or published shifts can be swapped.");
  }

  if (input.pendingSwapOnRequesterAssignment) {
    reasons.push("This shift already has a pending swap request.");
  }

  if (input.requesterHasLeaveConflict) {
    reasons.push("Requester has approved leave covering this shift date.");
  }

  if (input.targetEmployeeId) {
    if (input.targetEmployeeId === input.requesterEmployeeId) {
      reasons.push("Swap target must be a different employee.");
    }
    if (input.targetHasLeaveConflict) {
      reasons.push("Target employee has approved leave on the swap date.");
    }
  }

  if (input.targetAssignment) {
    if (!isSwappableStatus(input.targetAssignment.status)) {
      reasons.push("Target shift must be scheduled or published.");
    }
    if (
      input.targetEmployeeId &&
      input.targetAssignment.employeeId !== input.targetEmployeeId
    ) {
      reasons.push("Target assignment does not belong to the selected employee.");
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

export type HrShiftSwapApprovalRoute = {
  readonly managerEmployeeIds: readonly string[];
  readonly initialApproverEmployeeId: string | null;
};

export function resolveHrShiftSwapApprovalRoute(input: {
  requesterManagerEmployeeId: string | null;
  canManageSchedule: boolean;
}): HrShiftSwapApprovalRoute {
  const managerEmployeeIds = input.requesterManagerEmployeeId
    ? [input.requesterManagerEmployeeId]
    : [];

  return {
    managerEmployeeIds,
    initialApproverEmployeeId:
      managerEmployeeIds[0] ?? (input.canManageSchedule ? null : null),
  };
}
