/** @see https://neon.com/docs/auth/guides/plugins/admin */
export const deferredNeonAdminClientMethods = [
  "admin.createUser",
  "admin.listUsers",
  "admin.setRole",
  "admin.setUserPassword",
  "admin.updateUser",
  "admin.banUser",
  "admin.unbanUser",
  "admin.listUserSessions",
  "admin.revokeUserSession",
  "admin.revokeUserSessions",
  "admin.impersonateUser",
  "admin.stopImpersonating",
] as const;

export type DeferredNeonAdminClientMethod = (typeof deferredNeonAdminClientMethods)[number];
