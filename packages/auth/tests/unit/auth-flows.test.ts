import { describe, expect, it } from "vitest";
import {
  erpAuthRoutes,
  implementedNeonClientFlows,
  neonAuthFlowCatalog,
} from "../../src/contracts/auth.flows";

describe("neon auth flow catalog", () => {
  it("lists ERP auth routes including verify-email", () => {
    expect(erpAuthRoutes).toContain("/verify-email");
    expect(erpAuthRoutes).toContain("/reset-password");
    expect(erpAuthRoutes).toContain("/sign-in");
    expect(erpAuthRoutes).toContain("/otp");
  });

  it("tracks link-based password reset", () => {
    expect(implementedNeonClientFlows).toContain("resetPassword");
  });

  it("tracks implemented client flows for sign-up verification", () => {
    expect(implementedNeonClientFlows).toContain("emailOtp.verifyEmail");
    expect(implementedNeonClientFlows).toContain(
      "emailOtp.sendVerificationOtp.email-verification",
    );
  });

  it("tracks post-sign-in user management flows", () => {
    expect(implementedNeonClientFlows).toContain("updateUser");
    expect(implementedNeonClientFlows).toContain("changePassword");
    expect(neonAuthFlowCatalog.deferredNeonClientFlows).toContain("deleteUser");
  });

  it("exposes a stable catalog object", () => {
    expect(neonAuthFlowCatalog.erpAuthRoutes).toBe(erpAuthRoutes);
  });

  it("tracks Neon server SDK methods from the quickstart", () => {
    expect(neonAuthFlowCatalog.implementedNeonServerSdkMethods).toContain(
      "getSession",
    );
    expect(neonAuthFlowCatalog.implementedNeonServerSdkMethods).toContain(
      "handler",
    );
  });

  it("tracks Neon webhook handlers", () => {
    expect(neonAuthFlowCatalog.neonAuthWebhookHttpPath).toBe(
      "/api/internal/v1/webhooks/neon-auth",
    );
    expect(neonAuthFlowCatalog.implementedNeonWebhookEventHandlers).toContain(
      "user.created",
    );
    expect(neonAuthFlowCatalog.deferredNeonWebhookEventHandlers).toContain(
      "send.otp",
    );
  });

  it("lists deferred Neon Admin plugin client methods", () => {
    expect(neonAuthFlowCatalog.deferredNeonAdminClientMethods).toContain(
      "admin.impersonateUser",
    );
    expect(neonAuthFlowCatalog.deferredNeonClientFlows).not.toContain("admin.*");
  });

  it("tracks Email OTP plugin methods", () => {
    expect(neonAuthFlowCatalog.implementedNeonEmailOtpClientMethods).toContain(
      "emailOtp.verifyEmail",
    );
    expect(implementedNeonClientFlows).toContain("signIn.emailOtp");
    expect(neonAuthFlowCatalog.deferredNeonEmailOtpClientMethods).not.toContain(
      "signIn.emailOtp",
    );
  });

  it("tracks JWT plugin vs session patterns", () => {
    expect(neonAuthFlowCatalog.implementedNeonSessionPatterns).toContain(
      "getNeonAuthServer.getSession",
    );
    expect(neonAuthFlowCatalog.implementedNeonJwtServerPatterns).toContain(
      "verifyNeonAuthAccessToken.jose.jwks.EdDSA",
    );
    expect(neonAuthFlowCatalog.deferredNeonJwtClientMethods).toContain("token");
    expect(neonAuthFlowCatalog.deferredNeonClientFlows).not.toContain("token");
  });

  it("tracks Magic Link plugin on sign-in", () => {
    expect(neonAuthFlowCatalog.implementedNeonMagicLinkClientMethods).toContain(
      "signIn.magicLink",
    );
    expect(implementedNeonClientFlows).toContain("signIn.magicLink");
  });

  it("defers Neon Organization plugin in favor of Afenda tenant model", () => {
    expect(neonAuthFlowCatalog.afendaTenantOrganizationPatterns).toContain(
      "bootstrapOrganizationForUser",
    );
    expect(neonAuthFlowCatalog.deferredNeonOrganizationClientMethods).toContain(
      "organization.create",
    );
    expect(neonAuthFlowCatalog.deferredNeonClientFlows).not.toContain(
      "organization.*",
    );
  });

  it("maps Next.js server SDK surfaces", () => {
    expect(neonAuthFlowCatalog.implementedNeonServerSdkSurfaces).toContain(
      "createNeonAuth",
    );
    expect(neonAuthFlowCatalog.afendaServerSessionPatterns).toContain(
      "getSession.tenant-hydration",
    );
    expect(neonAuthFlowCatalog.deferredNeonServerSdkMethods).toContain(
      "signIn.email",
    );
    expect(neonAuthFlowCatalog.implementedNeonServerSdkMethods).toContain(
      "handler",
    );
  });

  it("defers Phone Number plugin until SMS webhook delivery exists", () => {
    expect(neonAuthFlowCatalog.deferredNeonPhoneNumberClientMethods).toContain(
      "phoneNumber.sendOtp",
    );
    expect(
      neonAuthFlowCatalog.neonPhoneNumberWebhookHandlers.blockingRequiresImplementation,
    ).toContain("send.otp.sms");
    expect(
      neonAuthFlowCatalog.neonPhoneNumberWebhookHandlers.implemented,
    ).toContain("phone_number.verified");
  });
});
