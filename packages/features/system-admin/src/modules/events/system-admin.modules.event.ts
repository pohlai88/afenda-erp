export const systemAdminModuleWebhookEvents = [
  "system-admin.module-settings.updated",
] as const;

export const systemAdminModuleAuditActions = [
  "system-admin.module.enable",
  "system-admin.module.disable",
  "system-admin.module_visibility.update",
  "system-admin.module_setting.update",
] as const;

export type SystemAdminModuleWebhookEvent =
  (typeof systemAdminModuleWebhookEvents)[number];

export type SystemAdminModuleAuditAction =
  (typeof systemAdminModuleAuditActions)[number];

export function resolveSystemAdminModuleAuditAction(input: {
  previous:
    | {
        enabled: boolean;
        visible: boolean;
        readiness: string;
      }
    | null
    | undefined;
  next: {
    enabled: boolean;
    visible: boolean;
    readiness: string;
  };
}): SystemAdminModuleAuditAction {
  const previous = input.previous;

  if (!previous || previous.enabled !== input.next.enabled) {
    return input.next.enabled
      ? "system-admin.module.enable"
      : "system-admin.module.disable";
  }

  if (previous.visible !== input.next.visible) {
    return "system-admin.module_visibility.update";
  }

  return "system-admin.module_setting.update";
}
