import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";
import { systemAdminApprovalsUiCopy } from "./system-admin.approvals-ui.copy.shared";

export const SYSTEM_ADMIN_APPROVALS_MANAGE_DENIED =
  "Requires system-admin.approvals.manage.";

export function resolveSystemAdminApprovalRowTrailingAction(input: {
  enabled: boolean;
  canMutate: boolean;
}) {
  const copy = systemAdminApprovalsUiCopy.list;
  const nextEnabled = !input.enabled;

  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: input.canMutate,
    disabledReason: SYSTEM_ADMIN_APPROVALS_MANAGE_DENIED,
    descriptor: {
      id: nextEnabled
        ? "system-admin.approval.enable"
        : "system-admin.approval.disable",
      label: nextEnabled ? copy.enableActionLabel : copy.disableActionLabel,
      intent: nextEnabled ? "default" : "destructive",
    },
  });
}
