import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";

import { APPROVALS_DECIDE_CAPABILITY } from "../schemas/approvals.capability.shared";
import { approvalsUiCopy } from "./approvals-ui.copy.shared";

export const APPROVALS_DECIDE_DENIED = `Requires ${APPROVALS_DECIDE_CAPABILITY}.`;

export function resolveApprovalQueueRowTrailingAction(input: {
  decisionComplete: boolean;
  canDecide: boolean;
}) {
  if (input.decisionComplete) {
    return resolveListSurfaceRowTrailingAction({
      visible: false,
      allowed: false,
      disabledReason: APPROVALS_DECIDE_DENIED,
    });
  }

  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: input.canDecide,
    disabledReason: APPROVALS_DECIDE_DENIED,
    descriptor: {
      id: "approvals.work-item.decide",
      label: approvalsUiCopy.queue.approveActionLabel,
      intent: "default",
    },
  });
}
