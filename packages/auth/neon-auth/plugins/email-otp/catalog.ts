/** @see https://neon.com/docs/auth/guides/plugins/email-otp */
export const implementedNeonEmailOtpClientMethods = [
  "emailOtp.sendVerificationOtp.email-verification",
  "emailOtp.verifyEmail",
  "forgetPassword.emailOtp",
  "emailOtp.resetPassword",
  "emailOtp.sendVerificationOtp.sign-in",
  "signIn.emailOtp",
] as const;

export const deferredNeonEmailOtpClientMethods = [
  "emailOtp.checkVerificationOtp.sign-in",
  "emailOtp.checkVerificationOtp.email-verification",
  "emailOtp.checkVerificationOtp.forget-password",
  "@neondatabase/auth-ui.emailOTP",
] as const;

export type ImplementedNeonEmailOtpClientMethod =
  (typeof implementedNeonEmailOtpClientMethods)[number];

export type DeferredNeonEmailOtpClientMethod =
  (typeof deferredNeonEmailOtpClientMethods)[number];
