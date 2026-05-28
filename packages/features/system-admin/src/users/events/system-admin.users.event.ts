export const systemAdminUserAuditActions = [
  "system-admin.user.invite",
  "system-admin.user.suspend",
  "system-admin.user.reactivate",
] as const;

export type SystemAdminUserAuditAction =
  (typeof systemAdminUserAuditActions)[number];
