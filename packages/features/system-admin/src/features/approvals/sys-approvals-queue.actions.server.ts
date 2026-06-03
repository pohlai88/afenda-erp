"use server";

import {
  applyTenantApprovalWorkItemDecision,
  ApprovalWorkItemCommandError,
} from "@afenda/db";
import {
  actionFailure,
  actionSuccess,
  zodActionFailure,
  type ActionResult,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { revalidatePath } from "next/cache";

import { systemAdminApprovalQueueAuditActions } from "../events/system-admin.approvals-queue.event";
import { requireSystemAdminApprovalsQueueDecide } from "../policies/system-admin.approvals-queue.policy.server";
import { systemAdminApprovalWorkItemDecisionInputSchema } from "../schemas/system-admin.approvals-queue-decision.schema";

function mapApprovalCommandError(
  error: ApprovalWorkItemCommandError,
): ActionResult {
  switch (error.code) {
    case "work_item_not_found":
      return actionFailure("Approval work item was not found.");
    case "work_item_not_actionable":
      return actionFailure("This approval work item can no longer be decided.");
    case "wrong_module":
      return actionFailure(
        "Only approvals-module work items can be decided here.",
      );
    case "rejection_reason_required":
      return actionFailure("Rejection reason is required.");
    default:
      return actionFailure("Unable to record the approval decision.");
  }
}

export async function decideSystemAdminApprovalWorkItemAction(input: {
  workItemId: string;
  decision: "approve" | "reject";
  decisionNote?: string;
  rejectionReason?: string;
}): Promise<ActionResult> {
  const guard = await requireSystemAdminApprovalsQueueDecide();
  const parsed = systemAdminApprovalWorkItemDecisionInputSchema.safeParse(input);

  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  try {
    const result = await applyTenantApprovalWorkItemDecision({
      organizationId: guard.organization.id,
      workItemId: parsed.data.workItemId,
      decision: parsed.data.decision,
      actorAuthUserId: guard.session.id,
      decisionNote: parsed.data.decisionNote,
      rejectionReason: parsed.data.rejectionReason,
    });

    await writeExecutionAuditEvent({
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      actorType: "user",
      action:
        parsed.data.decision === "approve"
          ? systemAdminApprovalQueueAuditActions.approve
          : systemAdminApprovalQueueAuditActions.reject,
      targetType: "approval_work_item",
      targetId: result.workItemId,
      metadata: {
        decision: parsed.data.decision,
        sourceRecordId: result.sourceRecordId,
        recordStatus: result.recordStatus,
        ...(parsed.data.decisionNote?.trim()
          ? { decisionNote: parsed.data.decisionNote.trim() }
          : {}),
        ...(parsed.data.rejectionReason?.trim()
          ? { rejectionReason: parsed.data.rejectionReason.trim() }
          : {}),
      },
    });

    revalidatePath("/system-admin/approvals");
    if (result.sourceRecordId) {
      revalidatePath(`/approvals/records/${result.sourceRecordId}`);
    }

    return actionSuccess();
  } catch (error) {
    if (error instanceof ApprovalWorkItemCommandError) {
      return mapApprovalCommandError(error);
    }

    throw error;
  }
}
