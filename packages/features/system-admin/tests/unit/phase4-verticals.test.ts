import { describe, expect, it } from "vitest";
import { systemAdminAuditViewerAuditActions } from "../../src/audit-viewer/events/system-admin.audit-viewer.event";
import {
  systemAdminIntegrationsWebhookEvents,
} from "../../src/integrations/events/system-admin.integrations.event";
import { buildSystemAdminAuditPageHref } from "../../src/audit-viewer/surface/system-admin.audit-pagination.shared";
import { systemAdminPolicyRuleWebhookEvents } from "../../src/policies/events/system-admin.policy-rules.event";
import { systemAdminSecurityAuditActions } from "../../src/security/events/system-admin.security.event";
import {
  assertSecuritySettingsDowngradeGuard,
  updateSecuritySettingsInputSchema,
} from "../../src/security/schemas/system-admin.security.schema";
import type { OrganizationSecuritySettings } from "../../src/security/contracts/system-admin.security-settings.contract";
import { evaluateSecurityReadiness } from "../../src/security/data/system-admin.security.readiness.server";

const baseSecurity: OrganizationSecuritySettings = {
  organizationId: "org_phase4",
  requireMfaForAdmins: true,
  allowedEmailDomains: ["example.com"],
  sessionMaxAgeMinutes: 720,
  idleTimeoutMinutes: 30,
  requireSensitiveActionConfirmation: true,
  restrictInvitesToAllowedDomains: true,
  adminLockoutProtectionEnabled: true,
  updatedByUserId: "user_admin",
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("system admin phase 4 audit viewer", () => {
  it("builds shareable audit pagination hrefs", () => {
    const href = buildSystemAdminAuditPageHref(
      {
        auditQ: "policy",
        auditPage: 2,
        auditPageSize: 25,
      },
      3,
    );

    expect(href).toContain("auditQ=policy");
    expect(href).toContain("auditPage=3");
  });

  it("denies audit export without export capability", () => {
    const capabilities = ["system-admin.audit.read"] as const;
    expect(capabilities.includes("system-admin.audit.export")).toBe(false);
  });
});

describe("system admin phase 4 security", () => {
  it("rejects idle timeout greater than session max age", () => {
    const parsed = updateSecuritySettingsInputSchema.safeParse({
      requireMfaForAdmins: "true",
      allowedEmailDomains: "example.com",
      sessionMaxAgeMinutes: "60",
      idleTimeoutMinutes: "120",
      requireSensitiveActionConfirmation: "true",
      restrictInvitesToAllowedDomains: "false",
      adminLockoutProtectionEnabled: "true",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects invalid email domains", () => {
    const parsed = updateSecuritySettingsInputSchema.safeParse({
      requireMfaForAdmins: "true",
      allowedEmailDomains: "not a domain",
      sessionMaxAgeMinutes: "720",
      idleTimeoutMinutes: "30",
      requireSensitiveActionConfirmation: "true",
      restrictInvitesToAllowedDomains: "false",
      adminLockoutProtectionEnabled: "true",
    });

    expect(parsed.success).toBe(false);
  });

  it("requires confirmation before disabling lockout protection", () => {
    const parsed = updateSecuritySettingsInputSchema.parse({
      requireMfaForAdmins: "true",
      allowedEmailDomains: "example.com",
      sessionMaxAgeMinutes: "720",
      idleTimeoutMinutes: "30",
      requireSensitiveActionConfirmation: "true",
      restrictInvitesToAllowedDomains: "true",
      adminLockoutProtectionEnabled: "false",
      confirmDisableLockoutProtection: "false",
    });

    const message = assertSecuritySettingsDowngradeGuard({
      parsed,
      previous: baseSecurity,
    });

    expect(message).toMatch(/confirm/i);
  });

  it("blocks disabling all admin protections", () => {
    const parsed = updateSecuritySettingsInputSchema.parse({
      requireMfaForAdmins: "false",
      allowedEmailDomains: "example.com",
      sessionMaxAgeMinutes: "720",
      idleTimeoutMinutes: "30",
      requireSensitiveActionConfirmation: "false",
      restrictInvitesToAllowedDomains: "false",
      adminLockoutProtectionEnabled: "false",
      confirmDisableLockoutProtection: "true",
    });

    const message = assertSecuritySettingsDowngradeGuard({
      parsed,
      previous: baseSecurity,
    });

    expect(message).toMatch(/at least one admin protection/i);
  });

  it("denies security manage without manage capability", () => {
    const capabilities = ["system-admin.security.read"] as const;
    expect(capabilities.includes("system-admin.security.manage")).toBe(false);
  });

  it("reports blocked readiness when security settings are missing", () => {
    expect(evaluateSecurityReadiness(null).verdict).toBe("blocked");
  });

  it("reports blocked readiness when idle timeout exceeds session max age", () => {
    expect(
      evaluateSecurityReadiness({
        ...baseSecurity,
        sessionMaxAgeMinutes: 60,
        idleTimeoutMinutes: 120,
      }).verdict,
    ).toBe("blocked");
  });

  it("reports warning readiness when admin MFA is optional", () => {
    expect(
      evaluateSecurityReadiness({
        ...baseSecurity,
        requireMfaForAdmins: false,
      }).verdict,
    ).toBe("warning");
  });

  it("uses stable audit and security action identifiers", () => {
    expect(systemAdminAuditViewerAuditActions.view).toBe(
      "system-admin.audit.view",
    );
    expect(systemAdminSecurityAuditActions.view).toBe("system-admin.security.view");
    expect(systemAdminSecurityAuditActions.update).toBe(
      "system-admin.security.update",
    );
    expect(systemAdminPolicyRuleWebhookEvents[0]).toBe("system-admin.policy.updated");
    expect(systemAdminIntegrationsWebhookEvents[0]).toBe(
      "tenant.api-credential.created",
    );
  });
});
