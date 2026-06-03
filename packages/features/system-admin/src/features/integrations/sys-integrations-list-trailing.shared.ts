import { resolveListSurfaceRowTrailingAction } from "@afenda/governed-surface";

export const systemAdminIntegrationsWriteRequiredReason =
  "Requires system-admin.integrations.write.";

export function resolveSystemAdminApiCredentialRowTrailingAction(input: {
  canMutate: boolean;
}) {
  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: input.canMutate,
    disabledReason: systemAdminIntegrationsWriteRequiredReason,
    descriptor: {
      id: "system-admin.api-credential.revoke",
      label: "Revoke",
      intent: "destructive",
      confirm: {
        title: "Revoke API credential",
        description: "This credential will stop authenticating immediately.",
        confirmLabel: "Revoke",
      },
    },
  });
}

export function resolveSystemAdminWebhookRowTrailingAction(input: {
  enabled: boolean;
  canMutate: boolean;
}) {
  return resolveListSurfaceRowTrailingAction({
    visible: true,
    allowed: input.canMutate,
    disabledReason: systemAdminIntegrationsWriteRequiredReason,
    descriptor: input.enabled
      ? {
          id: "system-admin.webhook.disable",
          label: "Disable",
          intent: "destructive",
          confirm: {
            title: "Disable webhook",
            description:
              "Delivery stops immediately until this endpoint is enabled again.",
            confirmLabel: "Disable",
          },
        }
      : {
          id: "system-admin.webhook.enable",
          label: "Enable",
          intent: "default",
        },
  });
}
