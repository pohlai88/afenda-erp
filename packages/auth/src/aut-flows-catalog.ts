import { neonAuthHttpProxyPath } from "./aut-paths-shared";

export const implementedNeonClientFlows = [
  "signIn.email",
  "signIn.social",
  "signIn.magicLink",
  "signIn.emailOtp",
  "signUp.email",
  "emailOtp.sendVerificationOtp",
  "emailOtp.verifyEmail",
  "sendVerificationEmail",
  "forgetPassword",
  "resetPassword",
  "updateUser",
  "changePassword",
  "signOut",
  "token",
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
  "forget-password",
  "callback",
  "verify-email",
  "send-verification-email",
  "update-user",
  "change-password",
  "magic-link/verify",
  "organization/*",
  "admin/*",
] as const;

export const implementedNeonWebhookEventHandlers = [
  "send.otp",
  "send.magic_link",
  "user.before_create",
  "user.created",
  "phone_number.verified",
] as const;

export const neonAuthFlowCatalog = {
  httpProxyPath: neonAuthHttpProxyPath,
  implementedClientFlows: implementedNeonClientFlows,
  upstreamPaths: neonAuthUpstreamPaths,
  implementedWebhookHandlers: implementedNeonWebhookEventHandlers,
} as const;
