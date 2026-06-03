/** @see https://neon.com/docs/auth/guides/password-reset */
export const implementedNeonRecoveryClientMethods = [
  "forgetPassword.email",
  "forgetPassword.emailOtp",
  "emailOtp.resetPassword",
  "resetPassword",
] as const;
