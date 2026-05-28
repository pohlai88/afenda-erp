export const systemAdminModuleWebhookEvents = [
  "system-admin.module-settings.updated",
] as const;

export const systemAdminModuleAuditActions = [
  "system-admin.module_setting.update",
] as const;

export type SystemAdminModuleWebhookEvent =
  (typeof systemAdminModuleWebhookEvents)[number];

export type SystemAdminModuleAuditAction =
  (typeof systemAdminModuleAuditActions)[number];
