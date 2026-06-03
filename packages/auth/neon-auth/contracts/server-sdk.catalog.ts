/** @see https://neon.com/docs/auth/reference/nextjs-server */
export const implementedNeonServerSdkSurfaces = [
  "createNeonAuth",
  "handler",
  "middleware",
  "getSession",
  "signOut",
] as const;

export const deferredNeonServerSdkMethods = [
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
