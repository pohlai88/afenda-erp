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
