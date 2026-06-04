import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEventInTransaction } from "@afenda/kernel/execution";
import { runWithOrganizationContext, HrShiftWorkflowCommandError } from "@afenda/db";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { hrTimeSftRoutePaths } from "./hr.time.sft-route.contract";
import { hrTimeSftAuditActions } from "./hr.time.sft.event";
import { HrTimeSftSwapIneligibleError } from "./hr.time.sft-swap.server";

const SFT_REVALIDATE_PATH = hrTimeSftRoutePaths.hub;

export async function finalizeHrTimeSftMutation(
  organizationId: string,
  mutate: () => Promise<{
    actorId: string;
    action: string;
    targetId: string;
    summary?: string;
    reason?: string;
    metadata?: Record<string, unknown>;
  }>,
): Promise<ActionResult> {
  try {
    await runWithOrganizationContext(organizationId, async (db) => {
      const audit = await mutate();
      await writeExecutionAuditEventInTransaction(db, {
        organizationId,
        actorId: audit.actorId,
        actorType: "user",
        action: audit.action,
        targetType: "hr_shift_schedule",
        targetId: audit.targetId,
        ...(audit.summary ? { summary: audit.summary } : {}),
        ...(audit.reason ? { reason: audit.reason } : {}),
        metadata: audit.metadata,
      });
    });
  } catch (error) {
    return toHrTimeSftActionFailure(error);
  }

  revalidatePath(SFT_REVALIDATE_PATH);
  return actionSuccess(undefined);
}

const HR_SFT_COMMAND_ERROR_MESSAGES: Record<string, string> = {
  swap_disabled: "Shift swap requests are disabled for this organization.",
  assignment_not_found: "Shift assignment was not found.",
  swap_not_found: "Shift swap request was not found.",
  swap_not_actionable: "Shift swap request is no longer actionable.",
  schedule_change_not_found: "Schedule change request was not found.",
  schedule_change_not_actionable:
    "Schedule change request is no longer actionable.",
  swap_ineligible: "Shift swap request is not eligible.",
  invalid_decision: "Decision could not be applied.",
};

export async function toHrTimeSftActionFailure(
  error: unknown,
): Promise<ActionResult> {
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0]?.message;
    return actionFailure(firstIssue ?? "Invalid request.");
  }
  if (error instanceof HrTimeSftSwapIneligibleError) {
    return actionFailure(error.reasons.join(" "));
  }
  if (error instanceof Error && error.message === "hr_sft_swap_review_denied") {
    return actionFailure("You do not have permission to review shift swap requests.");
  }
  if (error instanceof Error && error.message === "hr_sft_manage_required") {
    return actionFailure("You do not have permission to manage shift schedules.");
  }
  if (error instanceof HrShiftWorkflowCommandError) {
    return actionFailure(
      HR_SFT_COMMAND_ERROR_MESSAGES[error.code] ??
        "Shift scheduling request could not be processed.",
    );
  }
  throw error;
}

export { hrTimeSftAuditActions };
