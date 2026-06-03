/** @see https://neon.com/docs/auth/reference/nextjs-server */
export const implementedNeonServerSdkSurfaces = [
  "createNeonAuth",
  "handler",
  "middleware",
  "getSession",
  "signOut",
] as const;

export const implementedNeonServerSdkMethods = [
  "signIn.email",
  "signIn.social",
  "signIn.emailOtp",
  "signUp.email",
  "updateUser",
  "changePassword",
  "sendVerificationEmail",
  "deleteUser",
  "emailOtp.sendVerificationOtp",
  "emailOtp.verifyEmail",
  "listSessions",
  "revokeSession",
  "revokeOtherSessions",
  "organization.create",
  "organization.list",
  "organization.inviteMember",
  "admin.listUsers",
  "admin.banUser",
  "admin.setRole",
] as const;

export type ImplementedNeonServerSdkSurface = (typeof implementedNeonServerSdkSurfaces)[number];
export type ImplementedNeonServerSdkMethod = (typeof implementedNeonServerSdkMethods)[number];
