import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";
import type { ActionDescriptor } from "@afenda/governed-surface/schemas";

import { systemAdminApprovalsUiCopy } from "./system-admin.approvals-ui.copy.shared";

export {
  SYSTEM_ADMIN_APPROVALS_DECIDE_CAPABILITY,
} from "../schemas/system-admin.approvals-capability.shared";

export const SYSTEM_ADMIN_APPROVALS_DECIDE_DENIED =
  systemAdminApprovalsUiCopy.permissions.requiresDecide;

export const SYSTEM_ADMIN_APPROVAL_QUEUE_ROW_TRAILING_ACTION_IDS = {
  approve: "system-admin.approvals.work-item.approve",
  reject: "system-admin.approvals.work-item.reject",
} as const;

function buildApprovalQueueApproveDescriptor(): ActionDescriptor {
  const copy = systemAdminApprovalsUiCopy.queue;

  return {
    id: SYSTEM_ADMIN_APPROVAL_QUEUE_ROW_TRAILING_ACTION_IDS.approve,
    label: copy.approveActionLabel,
    intent: "approval",
  };
}

export function resolveSystemAdminApprovalQueueRowTrailingAction(input: {
  decisionComplete: boolean;
  canDecide: boolean;
}) {
  const copy = systemAdminApprovalsUiCopy.queue;

  if (input.decisionComplete) {
    return resolveListSurfaceRowTrailingAction({
      visible: false,
      allowed: false,
      disabledReason: copy.trailingDisabledReasons.decisionComplete,
    });
  }

  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: input.canDecide,
    disabledReason: SYSTEM_ADMIN_APPROVALS_DECIDE_DENIED,
    descriptor: buildApprovalQueueApproveDescriptor(),
  });
}
