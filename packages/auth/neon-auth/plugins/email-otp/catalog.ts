/** @see https://neon.com/docs/auth/guides/plugins/email-otp */
export const implementedNeonEmailOtpClientMethods = [
  "emailOtp.sendVerificationOtp",
  "emailOtp.verifyEmail",
  "signIn.emailOtp",
  "forgetPassword.emailOtp",
  "emailOtp.resetPassword",
] as const;

export const deferredNeonEmailOtpClientMethods = ["emailOtp.checkVerificationOtp"] as const;
