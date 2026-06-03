import {
  neonAuthHttpProxyPath,
  neonAuthWebhookHttpPath,
} from "../neon-auth/contracts/paths.shared";

/**
 * Neon Auth capability catalog for Afenda ERP.
 * Keep this compact: it records target auth decisions that tests and architecture guards consume.
 * Tenant organizations are provisioned in @afenda/db, not Neon organization plugin routes.
 */

export const erpAuthRoutes = [
  "/sign-in",
  "/otp",
  "/sign-up",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/onboarding",
] as const;

export type ErpAuthRoute = (typeof erpAuthRoutes)[number];

export { neonAuthHttpProxyPath, neonAuthWebhookHttpPath };

export const deferredNeonAdminClientMethods = [
  "admin.createUser",
  "admin.listUsers",
  "admin.setRole",
  "admin.impersonateUser",
] as const;

export const implementedNeonEmailOtpClientMethods = [
  "signIn.emailOtp",
  "forgetPassword.emailOtp",
  "emailOtp.sendVerificationOtp.email-verification",
  "emailOtp.verifyEmail",
  "emailOtp.resetPassword",
] as const;

export const deferredNeonEmailOtpClientMethods = [
  "emailOtp.checkVerificationOtp",
  "@neondatabase/auth-ui.EmailOTPForm",
] as const;

export const implementedNeonSessionPatterns = [
  "getNeonAuthServer.getSession",
] as const;

export const implementedNeonJwtServerPatterns = [
  "verifyNeonAuthAccessToken.jose.jwks.EdDSA",
] as const;

export const deferredNeonJwtClientMethods = [
  "token",
  "getSession.responseHeader.set-auth-jwt",
] as const;

export const deferredNeonJwtServerPatterns = [
  "api.routes.BearerAuthorization",
] as const;

export const implementedNeonMagicLinkClientMethods = [
  "signIn.magicLink",
] as const;

export const deferredNeonMagicLinkClientMethods = [
  "magicLink.verify",
  "@neondatabase/auth-ui.magicLink",
] as const;

export const afendaTenantOrganizationPatterns = [
  "bootstrapOrganizationForUser",
  "findActiveMembershipByUserId",
  "resolveTenantContextFromSession",
] as const;

export const deferredNeonOrganizationClientMethods = [
  "organization.create",
  "organization.update",
  "organization.inviteMember",
  "organization.setActive",
  "organization.list",
] as const;

export const deferredNeonPhoneNumberClientMethods = [
  "phoneNumber.sendOtp",
  "phoneNumber.verify",
] as const;

export const neonPhoneNumberWebhookHandlers = {
  blockingRequiresImplementation: ["send.otp.sms"],
  implemented: ["phone_number.verified"],
} as const;

export const implementedNeonServerSdkSurfaces = [
  "createNeonAuth",
  "handler",
  "middleware",
  "getSession",
] as const;

export const deferredNeonServerSdkMethods = [
  "signIn.email",
  "signUp.email",
  "emailOtp.sendVerificationOtp",
] as const;

export const afendaServerSessionPatterns = [
  "getSession.tenant-hydration",
  "UserSession.organizationId.server-only",
] as const;

/** Handled at `neonAuthWebhookHttpPath` with Ed25519 verification (see neon-auth.md). */
export const implementedNeonWebhookEventHandlers = [
  "user.before_create",
  "user.created",
  "phone_number.verified",
] as const;

/** Subscribing in Neon console without a custom delivery handler breaks auth. */
export const deferredNeonWebhookEventHandlers = [
  "send.otp",
  "send.magic_link",
] as const;

/** Browser-facing flows live in apps/erp/src/auth (pages, forms, ingress). Neon SDK client: @afenda/auth/client. */
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

/** Available in SDK; intentionally not exposed in Afenda UI (see neon-auth.md). */
export const deferredNeonClientFlows = [
  "resetPasswordForEmail",
  "deleteUser",
  "changeEmail",
  "@neondatabase/auth-ui.ForgotPasswordForm",
  "signIn.social.other-providers",
] as const;

/** Wired on server via `getNeonAuthServer()` / quickstart alias `auth`. */
export const implementedNeonServerSdkMethods = [
  "createNeonAuth",
  "handler",
  "middleware",
  "getSession",
  "signOut",
] as const;

/** Proxied by getNeonAuthServer().handler() — full Better Auth surface. */
export const neonAuthUpstreamPaths = [
  "get-session",
  "sign-in/email",
  "email-otp/send-verification-otp",
  "sign-up/email",
  "sign-in/social",
  "sign-out",
  "forget-password/email-otp",
  "email-otp/verify-email",
  "email-otp/reset-password",
  "callback",
  "verify-email",
  "send-verification-email",
  "update-user",
  "change-password",
  "magic-link/verify",
  "organization/*",
] as const;

export type NeonAuthFlowCatalog = {
  erpAuthRoutes: typeof erpAuthRoutes;
  implementedNeonClientFlows: typeof implementedNeonClientFlows;
  implementedNeonServerSdkMethods: typeof implementedNeonServerSdkMethods;
  deferredNeonClientFlows: typeof deferredNeonClientFlows;
  neonAuthUpstreamPaths: typeof neonAuthUpstreamPaths;
  neonAuthWebhookHttpPath: typeof neonAuthWebhookHttpPath;
  implementedNeonWebhookEventHandlers: typeof implementedNeonWebhookEventHandlers;
  deferredNeonWebhookEventHandlers: typeof deferredNeonWebhookEventHandlers;
  deferredNeonAdminClientMethods: typeof deferredNeonAdminClientMethods;
  implementedNeonEmailOtpClientMethods: typeof implementedNeonEmailOtpClientMethods;
  deferredNeonEmailOtpClientMethods: typeof deferredNeonEmailOtpClientMethods;
  implementedNeonSessionPatterns: typeof implementedNeonSessionPatterns;
  implementedNeonJwtServerPatterns: typeof implementedNeonJwtServerPatterns;
  deferredNeonJwtClientMethods: typeof deferredNeonJwtClientMethods;
  deferredNeonJwtServerPatterns: typeof deferredNeonJwtServerPatterns;
  implementedNeonMagicLinkClientMethods: typeof implementedNeonMagicLinkClientMethods;
  deferredNeonMagicLinkClientMethods: typeof deferredNeonMagicLinkClientMethods;
  afendaTenantOrganizationPatterns: typeof afendaTenantOrganizationPatterns;
  deferredNeonOrganizationClientMethods: typeof deferredNeonOrganizationClientMethods;
  deferredNeonPhoneNumberClientMethods: typeof deferredNeonPhoneNumberClientMethods;
  neonPhoneNumberWebhookHandlers: typeof neonPhoneNumberWebhookHandlers;
  implementedNeonServerSdkSurfaces: typeof implementedNeonServerSdkSurfaces;
  deferredNeonServerSdkMethods: typeof deferredNeonServerSdkMethods;
  afendaServerSessionPatterns: typeof afendaServerSessionPatterns;
};

export const neonAuthFlowCatalog: NeonAuthFlowCatalog = {
  erpAuthRoutes,
  implementedNeonClientFlows,
  implementedNeonServerSdkMethods,
  deferredNeonClientFlows,
  neonAuthUpstreamPaths,
  neonAuthWebhookHttpPath,
  implementedNeonWebhookEventHandlers,
  deferredNeonWebhookEventHandlers,
  deferredNeonAdminClientMethods,
  implementedNeonEmailOtpClientMethods,
  deferredNeonEmailOtpClientMethods,
  implementedNeonSessionPatterns,
  implementedNeonJwtServerPatterns,
  deferredNeonJwtClientMethods,
  deferredNeonJwtServerPatterns,
  implementedNeonMagicLinkClientMethods,
  deferredNeonMagicLinkClientMethods,
  afendaTenantOrganizationPatterns,
  deferredNeonOrganizationClientMethods,
  deferredNeonPhoneNumberClientMethods,
  neonPhoneNumberWebhookHandlers,
  implementedNeonServerSdkSurfaces,
  deferredNeonServerSdkMethods,
  afendaServerSessionPatterns,
};
