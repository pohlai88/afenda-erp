import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";

export const SYSTEM_ADMIN_POLICIES_MANAGE_DENIED =
  "Requires system-admin.policies.manage.";

export function resolveSystemAdminPolicyRowTrailingAction(input: {
  enabled: boolean;
  canMutate: boolean;
}) {
  const nextEnabled = !input.enabled;

  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: input.canMutate,
    disabledReason: SYSTEM_ADMIN_POLICIES_MANAGE_DENIED,
    descriptor: {
      id: nextEnabled
        ? "system-admin.policy.enable"
        : "system-admin.policy.disable",
      label: nextEnabled ? "Enable" : "Disable",
      intent: nextEnabled ? "default" : "destructive",
    },
  });
}
