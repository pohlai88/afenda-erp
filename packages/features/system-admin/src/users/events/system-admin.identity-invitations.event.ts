export const systemAdminIdentityInvitationWebhookEvents = [
  "tenant.member.invited",
  "tenant.invitation.revoked",
] as const;

export type SystemAdminIdentityInvitationWebhookEvent =
  (typeof systemAdminIdentityInvitationWebhookEvents)[number];
