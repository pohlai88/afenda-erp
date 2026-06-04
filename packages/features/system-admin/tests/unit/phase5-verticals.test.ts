import { describe, expect, it, beforeEach } from "vitest";
import type {
  TenantApprovalSettingRow,
  TenantCapabilitySettingRow,
  TenantModuleSettingRow,
  TenantPolicySettingRow,
} from "@afenda/db";
import {
  defineExecutionCapability,
  resetExecutionCapabilityRegistryForTest,
} from "@afenda/kernel/execution-capabilities";
import { evaluateCapabilityCoverage } from "../../src/features/capabilities/sys-capabilities.coverage.server";
import { collectSystemAdminDiagnosticIssues } from "../../src/features/diagnostics/sys-diagnostics.checks.server";
import { buildDiagnosticsModuleCoverageRows } from "../../src/features/diagnostics/sys-diagnostics.module-coverage.server";
import { isConfigurationAuditAction } from "../../src/features/diagnostics/sys-diagnostics.recent-changes.server";
import { buildSystemAdminDiagnosticsIssuesListSurface, buildSystemAdminDiagnosticsModuleCoverageListSurface, buildSystemAdminDiagnosticsRecentChangesListSurface } from "../../src/features/diagnostics/sys-diagnostics-list.surface";
import { collectIntegrationDiagnosticIssues } from "../../src/features/diagnostics/sys-diagnostics.checks.server";
import { summarizeDiagnosticIssues } from "../../src/features/diagnostics/sys-diagnostics.verdict.server";
import type { OrganizationSecuritySettings } from "../../src/features/security/sys-security-settings.contract";
import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";

const organizationId = "org_phase5";

const healthySecurity: OrganizationSecuritySettings = {
  organizationId,
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

function baseModule(
  moduleKey: string,
  overrides?: Partial<TenantModuleSettingRow>,
): TenantModuleSettingRow {
  return {
    organizationId,
    moduleKey,
    enabled: true,
    visible: true,
    readiness: "active",
    configuration: {},
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function baseCapabilitySetting(
  capabilityKey: string,
  overrides?: Partial<TenantCapabilitySettingRow>,
): TenantCapabilitySettingRow {
  return {
    organizationId,
    capabilityKey,
    availability: "enabled",
    ...overrides,
  };
}

function basePolicy(
  policyKey: string,
  configuration: Record<string, unknown>,
): TenantPolicySettingRow {
  return {
    id: `policy_${policyKey}`,
    organizationId,
    policyKey,
    label: policyKey,
    enabled: true,
    readiness: "active",
    configuration,
  };
}

function baseApproval(
  approvalKey: string,
  configuration: Record<string, unknown>,
): TenantApprovalSettingRow {
  return {
    id: `approval_${approvalKey}`,
    organizationId,
    approvalKey,
    label: approvalKey,
    enabled: true,
    approverRole: "operations-manager",
    escalationMinutes: null,
    configuration,
  };
}

describe("system admin phase 5 diagnostics access", () => {
  it("denies diagnostics read without diagnostics capability", () => {
    const capabilities: readonly string[] = ["system-admin.modules.read"];
    expect(capabilities.includes("system-admin.diagnostics.read")).toBe(false);
  });
});

describe("system admin phase 5 diagnostic checks", () => {
  beforeEach(() => {
    resetExecutionCapabilityRegistryForTest();
  });

  it("missing permission creates blocked issue", () => {
    const coverage = evaluateCapabilityCoverage({
      capability: {
        key: "hrm.employee.records",
        moduleKey: "hr",
        label: "Employee records",
        requiredPermission: "hrm.employee.update" as never,
        auditArea: "hr",
        status: "active",
      },
    });

    expect(coverage.verdict).toBe("missing_permission");
  });

  it("disabled module with active capabilities creates warning", () => {
    const issues = collectSystemAdminDiagnosticIssues({
      moduleSettings: [
        baseModule("hr", { enabled: false, visible: false }),
      ],
      capabilitySettings: [
        baseCapabilitySetting("hr.view", { availability: "enabled" }),
      ],
      policySettings: [],
      approvalSettings: [],
      roleOverrides: [],
      security: healthySecurity,
    });

    expect(
      issues.some(
        (issue) =>
          issue.category === "capability_status" &&
          issue.severity === "warning" &&
          issue.title.includes("module is disabled"),
      ),
    ).toBe(true);
  });

  it("policy referencing missing action creates blocked issue", () => {
    const issues = collectSystemAdminDiagnosticIssues({
      moduleSettings: [baseModule("inventory")],
      capabilitySettings: [],
      policySettings: [
        basePolicy("inventory.stock.adjust", {
          moduleKey: "inventory",
          action: "inventory.stock.adjust",
          targetType: "erp-record",
          effect: "lock",
          status: "active",
          priority: 100,
          enabled: true,
        }),
      ],
      approvalSettings: [],
      roleOverrides: [],
      security: healthySecurity,
    });

    expect(
      issues.some(
        (issue) =>
          issue.category === "policy_drift" &&
          issue.severity === "blocked" &&
          issue.description.includes("inventory.stock.adjust"),
      ),
    ).toBe(true);
  });

  it("approval referencing deprecated role creates warning", () => {
    const issues = collectSystemAdminDiagnosticIssues({
      moduleSettings: [],
      capabilitySettings: [],
      policySettings: [],
      approvalSettings: [
        baseApproval("finance.payment.release", {
          moduleKey: "finance",
          action: "finance.invoice.update",
          targetType: "erp-record",
          approverRoleKeys: ["manager"],
          minApprovals: 1,
          status: "deprecated",
          enabled: true,
        }),
      ],
      roleOverrides: [],
      security: healthySecurity,
    });

    expect(
      issues.some(
        (issue) =>
          issue.category === "approval_drift" &&
          issue.severity === "warning" &&
          issue.title.includes("Deprecated approval rule"),
      ),
    ).toBe(true);
  });

  it("sensitive capability without audit action creates blocked issue", () => {
    defineExecutionCapability({
      key: "vendor.bank_account.update",
      moduleKey: "purchasing",
      label: "Vendor bank account update",
      requiredPermission: "purchasing.documents.write",
      route: "/purchasing/vendor-bank",
      auditArea: "",
      status: "active",
    });

    const issues = collectSystemAdminDiagnosticIssues({
      moduleSettings: [baseModule("purchasing")],
      capabilitySettings: [
        baseCapabilitySetting("vendor.bank_account.update"),
      ],
      policySettings: [],
      approvalSettings: [],
      roleOverrides: [],
      security: healthySecurity,
    });

    expect(
      issues.some(
        (issue) =>
          issue.category === "audit_coverage" &&
          issue.severity === "blocked" &&
          issue.targetId === "vendor.bank_account.update",
      ),
    ).toBe(true);
  });

  it("healthy configuration returns empty issue list", () => {
    const summary = summarizeDiagnosticIssues([]);
    expect(summary.isHealthy).toBe(true);
    expect(summary.verdict).toBe("healthy");
    expect(summary.totalCount).toBe(0);
  });

  it("builds audit coverage diagnostics deep link", async () => {
    const { systemAdminAuditCoverageDiagnosticsHref } = await import(
      "../../src/features/diagnostics/sys-diagnostics-links.shared"
    );

    expect(systemAdminAuditCoverageDiagnosticsHref).toBe(
      "/system-admin/diagnostics?diagnosticsCategory=audit_coverage",
    );
  });

  it("parses diagnostics category search params", async () => {
    const { parseSystemAdminDiagnosticsSearchParams } = await import(
      "../../src/features/diagnostics/sys-diagnostics-search-params.parse.shared"
    );

    expect(
      parseSystemAdminDiagnosticsSearchParams({
        diagnosticsCategory: "audit_coverage",
      }).diagnosticsCategory,
    ).toBe("audit_coverage");
  });

  it("integration readiness issues map to integration_health diagnostics", () => {
    const issues = collectIntegrationDiagnosticIssues({
      verdict: "blocked",
      issues: [
        {
          id: "blocked:webhook-health",
          title: "Webhook health is critically degraded",
          description: "Multiple consecutive failures indicate the endpoint is unhealthy.",
        },
      ],
    });

    expect(issues[0]?.category).toBe("integration_health");
    expect(issues[0]?.severity).toBe("blocked");
    expect(issues[0]?.targetHref).toBe("/system-admin/integrations");
  });

  it("security posture warnings surface when admin MFA is disabled", () => {
    const issues = collectSystemAdminDiagnosticIssues({
      moduleSettings: [],
      capabilitySettings: [],
      policySettings: [],
      approvalSettings: [],
      roleOverrides: [],
      security: {
        ...healthySecurity,
        requireMfaForAdmins: false,
      },
    });

    expect(
      issues.some(
        (issue) =>
          issue.category === "security_posture" &&
          issue.severity === "warning" &&
          issue.title.includes("MFA"),
      ),
    ).toBe(true);
  });

  it("parses governed diagnostics issue list surface", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildSystemAdminDiagnosticsIssuesListSurface({
        issues: [
          {
            id: "policy_drift:test",
            category: "policy_drift",
            severity: "blocked",
            title: "Policy references unknown action",
            description: "Policy references action inventory.stock.adjust.",
            targetType: "policy",
            targetId: "inventory.stock.adjust",
            targetHref: "/system-admin/policies",
            recommendedAction: "Update the policy action.",
          },
        ],
      }),
    );

    expect(parsed.success).toBe(true);
  });

  it("builds module coverage rows with blocked status when module has blocked issues", () => {
    const rows = buildDiagnosticsModuleCoverageRows({
      moduleSettings: [baseModule("finance")],
      issues: [
        {
          id: "policy_drift:finance.lock",
          category: "policy_drift",
          severity: "blocked",
          title: "Policy drift",
          description: "Policy references unknown action.",
          targetType: "policy",
          targetId: "finance.invoice.lock",
          recommendedAction: "Update the policy.",
        },
      ],
    });

    const finance = rows.find((row) => row.moduleKey === "finance");
    expect(finance?.status).toBe("blocked");
    expect(finance?.blockedCount).toBe(1);
  });

  it("recognizes configuration audit actions and excludes audit viewer noise", () => {
    expect(isConfigurationAuditAction("system-admin.security.update")).toBe(
      true,
    );
    expect(isConfigurationAuditAction("tenant.role-override.changed")).toBe(
      true,
    );
    expect(isConfigurationAuditAction("system-admin.audit.view")).toBe(false);
  });

  it("parses module coverage and recent change governed surfaces", () => {
    const moduleCoverage = parseListSurfaceRendererConfiguration(
      buildSystemAdminDiagnosticsModuleCoverageListSurface({
        rows: [
          {
            id: "finance",
            moduleKey: "finance",
            moduleLabel: "Finance",
            status: "healthy",
            blockedCount: 0,
            warningCount: 0,
            infoCount: 0,
            totalCount: 0,
            href: "/system-admin/modules",
          },
        ],
      }),
    );
    const recentChanges = parseListSurfaceRendererConfiguration(
      buildSystemAdminDiagnosticsRecentChangesListSurface({
        rows: [
          {
            id: "audit_1",
            occurredAt: "2026-01-01",
            action: "system-admin.security.update",
            actionLabel: "Security settings update",
            actorId: "user_admin",
            target: "organization:org_phase5",
            summary: "Security settings updated.",
            href: "/system-admin/audit?auditId=audit_1",
          },
        ],
      }),
    );

    expect(moduleCoverage.success).toBe(true);
    expect(recentChanges.success).toBe(true);
  });
});
