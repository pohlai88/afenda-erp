import { neonAuthHttpProxyPath } from "./paths.shared";

export const implementedNeonClientFlows = [
  "signIn.email",
  "signIn.social.google",
  "signIn.magicLink",
  "signIn.emailOtp",
  "signUp.email",
  "emailOtp.sendVerificationOtp.email-verification",
  "emailOtp.verifyEmail",
  "sendVerificationEmail",
  "forgetPassword.email",
  "forgetPassword.emailOtp",
  "emailOtp.resetPassword",
  "resetPassword",
  "updateUser",
  "changePassword",
  "signOut",
] as const;

export const deferredNeonClientFlows = [
  "resetPasswordForEmail",
  "deleteUser",
  "changeEmail",
  "signIn.social.other-providers",
] as const;

export const neonAuthUpstreamPaths = [
  "get-session",
  "sign-in/email",
  "sign-up/email",
  "sign-in/social",
  "sign-in/email-otp",
  "sign-out",
  "email-otp/send-verification-otp",
  "email-otp/verify-email",
  "email-otp/reset-password",
  "forget-password/email-otp",
  "callback",
  "verify-email",
  "send-verification-email",
  "update-user",
  "change-password",
  "magic-link/verify",
  "organization/*",
] as const;

export const implementedNeonWebhookEventHandlers = [
  "user.before_create",
  "user.created",
  "phone_number.verified",
] as const;

export const deferredNeonWebhookEventHandlers = ["send.otp", "send.magic_link"] as const;

export const neonAuthFlowCatalog = {
  httpProxyPath: neonAuthHttpProxyPath,
  implementedClientFlows: implementedNeonClientFlows,
  deferredClientFlows: deferredNeonClientFlows,
  upstreamPaths: neonAuthUpstreamPaths,
  implementedWebhookHandlers: implementedNeonWebhookEventHandlers,
  deferredWebhookHandlers: deferredNeonWebhookEventHandlers,
} as const;
