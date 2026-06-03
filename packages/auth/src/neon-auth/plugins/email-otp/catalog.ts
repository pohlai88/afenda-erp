/** @see https://neon.com/docs/auth/guides/plugins/email-otp */
export const implementedNeonEmailOtpClientMethods = [
  "signIn.emailOtp",
  "emailOtp.sendVerificationOtp",
  "emailOtp.verifyEmail",
  "emailOtp.resetPassword",
] as const;

export const implementedNeonEmailOtpServerMethods = [
  "signIn.emailOtp",
  "emailOtp.sendVerificationOtp",
  "emailOtp.verifyEmail",
] as const;
