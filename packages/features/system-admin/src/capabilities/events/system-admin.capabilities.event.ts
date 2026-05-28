export const systemAdminCapabilityWebhookEvents = [
  "system-admin.capability-settings.updated",
] as const;

export const systemAdminCapabilityAuditActions = [
  "system-admin.capability_setting.update",
] as const;

export type SystemAdminCapabilityWebhookEvent =
  (typeof systemAdminCapabilityWebhookEvents)[number];

export type SystemAdminCapabilityAuditAction =
  (typeof systemAdminCapabilityAuditActions)[number];
