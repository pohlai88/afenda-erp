export const systemAdminPermissionBundleWebhookEvents = [
  "tenant.role-override.changed",
] as const;

export type SystemAdminPermissionBundleWebhookEvent =
  (typeof systemAdminPermissionBundleWebhookEvents)[number];
