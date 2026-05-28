export const systemAdminOrganizationWebhookEvents = [
  "system-admin.organization.updated",
] as const;

export const systemAdminOrganizationAuditActions = [
  "system-admin.organization.update",
] as const;

export type SystemAdminOrganizationWebhookEvent =
  (typeof systemAdminOrganizationWebhookEvents)[number];

export type SystemAdminOrganizationAuditAction =
  (typeof systemAdminOrganizationAuditActions)[number];
