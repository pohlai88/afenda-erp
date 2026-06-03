/** @see https://neon.com/docs/auth/guides/plugins/admin */
export const deferredNeonAdminClientMethods = [
  "admin.createUser",
  "admin.listUsers",
  "admin.setRole",
  "admin.banUser",
  "admin.impersonateUser",
] as const;
