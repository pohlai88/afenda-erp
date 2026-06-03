/** @see https://neon.com/docs/auth/reference/nextjs-server#authadminlistusers */
export const implementedNeonAdminClientMethods = [
  "admin.listUsers",
  "admin.banUser",
  "admin.setRole",
] as const;

export const implementedNeonAdminServerMethods = [
  "admin.listUsers",
  "admin.banUser",
  "admin.setRole",
] as const;
