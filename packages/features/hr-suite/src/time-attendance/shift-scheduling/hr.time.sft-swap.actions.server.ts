"use server";

import {
  decideHrTimeSftScheduleChangeRequest,
  submitHrTimeSftScheduleChangeRequest,
} from "./hrs-hr-time-sft-schedule-change-server";
import {
  decideHrTimeSftSwapRequest,
  submitHrTimeSftSwapRequest,
} from "./hrs-hr-time-sft-swap-server";
import {
  assertHrTimeSftSwapDecisionPermitted,
  canHrTimeSftInitiateScheduleChange,
  canHrTimeSftSubmitSwapRequest,
} from "./hr.time.sft-swap.policy.server";
import { readHrTimeSftSchedulingPolicy } from "./hrs-hr-time-sft-coverage-server";
import {
  finalizeHrTimeSftMutation,
  toHrTimeSftActionFailure,
} from "./hr.time.sft.mutation.shared.server";
import { hrTimeSftAuditActions } from "./hr.time.sft.event";
import {
  hrSftDecideScheduleChangeSchema,
  hrSftSubmitScheduleChangeSchema,
} from "./hr.time.sft-schedule-change.schema";
import {
  hrSftDecideSwapRequestSchema,
  hrSftSubmitSwapRequestSchema,
} from "./hr.time.sft-swap.schema";

export async function submitHrTimeSftSwapRequestAction(input: {
  organizationId: string;
  actorAuthUserId: string;
  linkedEmployeeId: string | null;
  raw: unknown;
}) {
  const parsed = hrSftSubmitSwapRequestSchema.safeParse(input.raw);
  if (!parsed.success) {
    return toHrTimeSftActionFailure(parsed.error);
  }

  const policy = await readHrTimeSftSchedulingPolicy({
    organizationId: input.organizationId,
  });

  if (
    !canHrTimeSftSubmitSwapRequest({
      swapRequestsEnabled: policy.swapRequestsEnabled,
      linkedEmployeeId: input.linkedEmployeeId,
    })
  ) {
    return toHrTimeSftActionFailure(new Error("hr_sft_swap_review_denied"));
  }

  return finalizeHrTimeSftMutation(input.organizationId, async () => {
    const result = await submitHrTimeSftSwapRequest({
      organizationId: input.organizationId,
      requesterEmployeeId: input.linkedEmployeeId!,
      actorAuthUserId: input.actorAuthUserId,
      payload: parsed.data,
    });

    return {
      actorId: input.actorAuthUserId,
      action: hrTimeSftAuditActions.swap.submitted,
      targetId: result.swapRequestId,
      summary: "Shift swap request submitted",
      metadata: { route: result.route },
    };
  });
}

export async function decideHrTimeSftSwapRequestAction(input: {
  organizationId: string;
  actorAuthUserId: string;
  canManageSchedule: boolean;
  raw: unknown;
}) {
  const parsed = hrSftDecideSwapRequestSchema.safeParse(input.raw);
  if (!parsed.success) {
    return toHrTimeSftActionFailure(parsed.error);
  }

  try {
    assertHrTimeSftSwapDecisionPermitted({
      context: {
        canReadOrg: true,
        canManageSchedule: input.canManageSchedule,
        actorEmployeeId: null,
        requesterManagerEmployeeId: null,
      },
      decision: parsed.data.decision,
    });
  } catch (error) {
    return toHrTimeSftActionFailure(error);
  }

  return finalizeHrTimeSftMutation(input.organizationId, async () => {
    const result = await decideHrTimeSftSwapRequest({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      payload: parsed.data,
    });

    const actionByDecision = {
      approve: hrTimeSftAuditActions.swap.approved,
      reject: hrTimeSftAuditActions.swap.rejected,
      return: hrTimeSftAuditActions.swap.returned,
      override: hrTimeSftAuditActions.swap.overridden,
    } as const;

    return {
      actorId: input.actorAuthUserId,
      action: actionByDecision[parsed.data.decision],
      targetId: result.swapRequestId,
      summary: `Shift swap ${parsed.data.decision}`,
      reason:
        parsed.data.rejectionReason?.trim() ||
        parsed.data.overrideReason?.trim() ||
        undefined,
    };
  });
}

export async function submitHrTimeSftScheduleChangeAction(input: {
  organizationId: string;
  actorAuthUserId: string;
  canManageSchedule: boolean;
  linkedEmployeeId: string | null;
  raw: unknown;
}) {
  const parsed = hrSftSubmitScheduleChangeSchema.safeParse(input.raw);
  if (!parsed.success) {
    return toHrTimeSftActionFailure(parsed.error);
  }

  const managerInitiated = canHrTimeSftInitiateScheduleChange({
    canManageSchedule: input.canManageSchedule,
  });

  if (!managerInitiated && !input.linkedEmployeeId) {
    return toHrTimeSftActionFailure(new Error("hr_sft_manage_required"));
  }

  return finalizeHrTimeSftMutation(input.organizationId, async () => {
    const result = await submitHrTimeSftScheduleChangeRequest({
      organizationId: input.organizationId,
      requestingEmployeeId:
        parsed.data.requestingEmployeeId ??
        input.linkedEmployeeId ??
        "",
      actorAuthUserId: input.actorAuthUserId,
      managerInitiated,
      payload: parsed.data,
    });

    return {
      actorId: input.actorAuthUserId,
      action: hrTimeSftAuditActions.scheduleChange.submitted,
      targetId: result.scheduleChangeRequestId,
      summary: managerInitiated
        ? "Manager-initiated schedule change applied"
        : "Schedule change request submitted",
    };
  });
}

export async function decideHrTimeSftScheduleChangeAction(input: {
  organizationId: string;
  actorAuthUserId: string;
  canManageSchedule: boolean;
  raw: unknown;
}) {
  const parsed = hrSftDecideScheduleChangeSchema.safeParse(input.raw);
  if (!parsed.success) {
    return toHrTimeSftActionFailure(parsed.error);
  }

  if (!input.canManageSchedule) {
    return toHrTimeSftActionFailure(new Error("hr_sft_manage_required"));
  }

  return finalizeHrTimeSftMutation(input.organizationId, async () => {
    const result = await decideHrTimeSftScheduleChangeRequest({
      organizationId: input.organizationId,
      actorAuthUserId: input.actorAuthUserId,
      payload: parsed.data,
    });

    const actionByDecision = {
      approve: hrTimeSftAuditActions.scheduleChange.approved,
      reject: hrTimeSftAuditActions.scheduleChange.rejected,
      return: hrTimeSftAuditActions.scheduleChange.returned,
      override: hrTimeSftAuditActions.scheduleChange.overridden,
    } as const;

    return {
      actorId: input.actorAuthUserId,
      action: actionByDecision[parsed.data.decision],
      targetId: result.scheduleChangeRequestId,
      summary: `Schedule change ${parsed.data.decision}`,
      reason:
        parsed.data.rejectionReason?.trim() ||
        parsed.data.overrideReason?.trim() ||
        undefined,
    };
  });
}
