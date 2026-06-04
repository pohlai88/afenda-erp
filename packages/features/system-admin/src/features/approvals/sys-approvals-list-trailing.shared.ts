import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";
import type { ActionDescriptor } from "@afenda/governed-surface/schemas";

import type { SystemAdminApprovalRuleStatus } from "./sys-approval-rule.contract";
import { systemAdminApprovalsUiCopy } from "./sys-approvals-ui.copy.shared";

export {
  SYSTEM_ADMIN_APPROVALS_MANAGE_CAPABILITY,
} from "./sys-approvals-capability.shared";

export const SYSTEM_ADMIN_APPROVALS_MANAGE_DENIED =
  systemAdminApprovalsUiCopy.permissions.requiresManage;

export const SYSTEM_ADMIN_APPROVAL_ROW_TRAILING_ACTION_IDS = {
  enable: "system-admin.approval.enable",
  disable: "system-admin.approval.disable",
} as const;

function buildApprovalDisableDescriptor(): ActionDescriptor {
  const copy = systemAdminApprovalsUiCopy.list;

  return {
    id: SYSTEM_ADMIN_APPROVAL_ROW_TRAILING_ACTION_IDS.disable,
    label: copy.disableActionLabel,
    intent: "destructive",
    confirm: copy.trailingConfirms.disable,
  };
}

function buildApprovalEnableDescriptor(): ActionDescriptor {
  const copy = systemAdminApprovalsUiCopy.list;

  return {
    id: SYSTEM_ADMIN_APPROVAL_ROW_TRAILING_ACTION_IDS.enable,
    label: copy.enableActionLabel,
    intent: "default",
  };
}

function buildApprovalToggleDescriptor(enabled: boolean): ActionDescriptor {
  return enabled
    ? buildApprovalDisableDescriptor()
    : buildApprovalEnableDescriptor();
}

export function resolveSystemAdminApprovalRowTrailingAction(input: {
  status: SystemAdminApprovalRuleStatus;
  enabled: boolean;
  canMutate: boolean;
}) {
  const copy = systemAdminApprovalsUiCopy.list;

  if (input.status === "deprecated") {
    if (input.enabled) {
      return resolveListSurfaceRowTrailingAction({
        visible: true,
        allowed: input.canMutate,
        disabledReason: SYSTEM_ADMIN_APPROVALS_MANAGE_DENIED,
        descriptor: buildApprovalDisableDescriptor(),
      });
    }

    return resolveListSurfaceRowTrailingAction({
      visible: false,
      allowed: false,
      disabledReason: copy.trailingDisabledReasons.deprecatedReactivate,
    });
  }

  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: input.canMutate,
    disabledReason: SYSTEM_ADMIN_APPROVALS_MANAGE_DENIED,
    descriptor: buildApprovalToggleDescriptor(input.enabled),
  });
}
