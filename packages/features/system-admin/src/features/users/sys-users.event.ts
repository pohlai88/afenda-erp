export const systemAdminUserAuditActions = [
  "system-admin.user_directory.view",
  "system-admin.user.invite",
  "system-admin.user.invitation_resend",
  "system-admin.user.invitation_cancel",
  "system-admin.user.suspend",
  "system-admin.user.reactivate",
  "system-admin.user.remove",
] as const;

export type SystemAdminUserAuditAction =
  (typeof systemAdminUserAuditActions)[number];
