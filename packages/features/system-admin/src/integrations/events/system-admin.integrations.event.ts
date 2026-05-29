export const systemAdminIntegrationsWebhookEvents = [
  "tenant.api-credential.created",
  "tenant.api-credential.revoked",
  "tenant.webhook.created",
  "tenant.webhook.enabled",
  "tenant.webhook.disabled",
  "tenant.sso.updated",
] as const;

export type SystemAdminIntegrationsWebhookEvent =
  (typeof systemAdminIntegrationsWebhookEvents)[number];

export const systemAdminIntegrationsAuditActions = {
  view: "system-admin.integrations.view",
  apiCredentialCreate: "system-admin.integration.credentials.create",
  apiCredentialRevoke: "system-admin.integration.credentials.revoke",
  webhookCreate: "system-admin.integration.webhook.create",
  webhookEnable: "system-admin.integration.enable",
  webhookDisable: "system-admin.integration.disable",
  ssoUpdate: "system-admin.integration.sso.update",
} as const;

export type SystemAdminIntegrationsAuditAction =
  (typeof systemAdminIntegrationsAuditActions)[keyof typeof systemAdminIntegrationsAuditActions];
