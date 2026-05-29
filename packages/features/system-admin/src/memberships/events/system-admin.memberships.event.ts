export const systemAdminMembershipWebhookEvents = [
  "tenant.role.changed",
] as const;

export type SystemAdminMembershipWebhookEvent =
  (typeof systemAdminMembershipWebhookEvents)[number];
