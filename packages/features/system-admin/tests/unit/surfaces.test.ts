import { describe, expect, it } from "vitest";
import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { buildMembersListSurface } from "../../src/features/memberships/sys-memberships-list.surface";
import {
  buildApiCredentialsListSurface,
  buildWebhooksListSurface,
} from "../../src/features/integrations/sys-integrations-list.surface";
import { buildCapabilitiesListSurface } from "../../src/features/capabilities/sys-capabilities-list.surface";
import { buildModulesListSurface } from "../../src/features/modules/sys-modules-list.surface";
import { buildOrganizationDefaultsListSurface } from "../../src/features/organization/sys-organization-list.surface";
import { buildPermissionsListSurface } from "../../src/features/permissions/sys-permissions-list.surface";
import { buildRolesListSurface } from "../../src/features/roles/sys-roles-list.surface";
import { buildSystemAdminDiagnosticsIssuesListSurface } from "../../src/features/diagnostics/sys-diagnostics-list.surface";
import { buildSystemAdminAuditViewerListSurface } from "../../src/features/audit-viewer/sys-audit-list.surface";
import { buildSystemAdminSecuritySettingsListSurface } from "../../src/features/security/sys-security-list.surface";
import { evaluateSecurityReadiness } from "../../src/features/security/sys-security.readiness.server";
import { buildApprovalsListSurface } from "../../src/features/approvals/sys-approvals-list.surface";
import { buildPoliciesListSurface } from "../../src/features/policies/system-admin.policy-rules.surface";
import {
  buildSystemAdminAiSandboxesListSurface,
  buildSystemAdminAiUsageListSurface,
} from "../../src/features/lynx/sys-lynx.surface";
import {
  buildSystemAdminImportJobsListSurface,
  buildSystemAdminImportTemplatesListSurface,
} from "../../src/features/data-management/sys-import-jobs-list.surface";
import { listSystemAdminImportTemplates } from "../../src/features/data-management/sys-import-adapter.registry.server";
import { buildUsersListSurface } from "../../src/features/users/sys-users-list.surface";
import { systemAdminUsersGalleryRows } from "../../src/features/users/sys-users-gallery.fixtures.shared";

const defaultEncryptionSettings = {
  mode: "platform" as const,
  kmsAdapter: null,
  kmsKeyRef: null,
};

describe("system admin governed surfaces", () => {
  it("normalizes empty pagination to schema-safe server windows", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildMembersListSurface({ memberships: [] }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.pagination?.pageSize).toBe(1);
      expect(parsed.data.presentation?.toolbar?.search?.param).toBe("membersQ");
    }
  });

  it("parses the memberships governed list surface with ERP permission metadata", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildMembersListSurface({ memberships: [], canMutate: true }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.requiresErpPermission).toEqual({
        module: "system-admin",
        object: "members",
        function: "read",
      });
      expect(parsed.data.surface.rowKey).toBe("membershipId");
    }
  });

  it("parses the audit viewer governed list surface", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildSystemAdminAuditViewerListSurface({
        rows: [
          {
            id: "audit_1",
            occurredAt: "2026-01-01",
            actorId: "user_1",
            action: "system-admin.security.update",
            target: "organization:org_1",
            moduleKey: "system-admin",
            result: "recorded",
            summary: "Security settings updated.",
          },
        ],
        params: { auditPage: 1, auditPageSize: 25 },
        totalCount: 1,
        pageSize: 25,
        page: 1,
        hasNextPage: false,
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.pagination?.totalCount).toBe(1);
      expect(parsed.data.presentation?.toolbar?.search?.param).toBe("auditQ");
    }
  });

  it("adds governed trailing actions for mutable row commands", () => {
    const credentials = parseListSurfaceRendererConfiguration(
      buildApiCredentialsListSurface({
        canMutate: true,
        credentials: [
          {
            id: "cred_1",
            label: "Primary",
            keyPrefix: "afk_live_01",
            scopes: ["erp.read"],
            status: "active",
            lastUsedAt: null,
          },
        ],
      }),
    );

    expect(credentials.success).toBe(true);
    if (credentials.success) {
      expect(credentials.data.rows[0]?.trailingAction?.state).toBe("ready");
      expect(
        credentials.data.rows[0]?.trailingAction?.descriptor?.confirm,
      ).toEqual(definedConfirm);
    }
  });

  it("exposes enable/disable trailing actions for webhooks when mutable", () => {
    const webhooks = parseListSurfaceRendererConfiguration(
      buildWebhooksListSurface({
        canMutate: true,
        webhooks: [
          {
            id: "wh_1",
            label: "Primary",
            url: "https://example.com/hooks",
            status: "enabled",
            eventFilters: ["tenant.webhook.created"],
          },
        ],
      }),
    );

    expect(webhooks.success).toBe(true);
    if (webhooks.success) {
      expect(webhooks.data.rows[0]?.trailingAction?.state).toBe("ready");
      expect(webhooks.data.rows[0]?.trailingAction?.descriptor?.label).toBe(
        "Disable",
      );
    }
  });

  it("uses Lynx labels on admin machine surfaces", () => {
    const usage = parseListSurfaceRendererConfiguration(
      buildSystemAdminAiUsageListSurface({ events: [] }),
    );
    const sandboxes = parseListSurfaceRendererConfiguration(
      buildSystemAdminAiSandboxesListSurface({
        sandboxes: [],
        canMutate: false,
      }),
    );

    expect(usage.success).toBe(true);
    expect(sandboxes.success).toBe(true);
    if (usage.success && sandboxes.success) {
      expect(usage.data.surface.header?.title).toBe("Lynx usage ledger");
      expect(usage.data.surface.empty.description).toBeTruthy();
      expect(sandboxes.data.surface.header?.title).toBe(
        "Lynx action sandboxes",
      );
      expect(sandboxes.data.surface.empty.description).toBeTruthy();
    }
  });

  it("parses the users governed list surface with ERP permission metadata", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildUsersListSurface({
        users: systemAdminUsersGalleryRows,
        canMutate: true,
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.requiresErpPermission).toEqual({
        module: "system-admin",
        object: "users",
        function: "read",
      });
      expect(parsed.data.presentation?.toolbar?.search?.param).toBe("usersQ");
      expect(parsed.data.columns.some((column) => column.id === "roles")).toBe(
        true,
      );
    }
  });

  it("parses the permissions governed list surface with coverage metadata", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildPermissionsListSurface({
        searchValue: "audit",
        permissions: [
          {
            id: "system-admin.audit.read",
            permission: "system-admin.audit.read",
            module: "system-admin",
            group: "Read",
            label: "Audit Read",
            description: "Catalog permission system-admin.audit.read.",
            capabilityCount: "2",
            roleCount: "1",
            status: "active",
            coverageVerdict: "covered",
            riskLevel: "low",
          },
          {
            id: "system-admin.permissions.manage",
            permission: "system-admin.permissions.manage",
            module: "system-admin",
            group: "Configure",
            label: "Permissions Manage",
            description: "Catalog permission system-admin.permissions.manage.",
            capabilityCount: "1",
            roleCount: "3",
            status: "active",
            coverageVerdict: "overprivileged",
            riskLevel: "critical",
          },
        ],
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.requiresErpPermission).toEqual({
        module: "system-admin",
        object: "permissions",
        function: "read",
      });
      expect(parsed.data.presentation?.toolbar?.search?.param).toBe(
        "permissionsQ",
      );
      expect(parsed.data.columns.map((column) => column.id)).toEqual([
        "permission",
        "module",
        "group",
        "capabilityCount",
        "roleCount",
        "coverageVerdict",
        "status",
        "riskLevel",
        "label",
        "description",
      ]);
      expect(parsed.data.presentation?.toolbar?.filters?.[0]?.param).toBe(
        "permissionsStatus",
      );
    }
  });

  it("parses the roles governed list surface with ERP permission metadata", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildRolesListSurface({
        roles: [
          {
            id: "admin",
            key: "admin",
            name: "Admin",
            description: "Organization administrator",
            status: "active",
            assignedMembers: 2,
            permissionCount: 18,
          },
        ],
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.requiresErpPermission).toEqual({
        module: "system-admin",
        object: "roles",
        function: "read",
      });
      expect(parsed.data.columns.map((column) => column.id)).toEqual([
        "name",
        "key",
        "status",
        "permissions",
        "assignedMembers",
        "description",
      ]);
      expect(parsed.data.presentation?.toolbar?.search?.param).toBe("rolesQ");
    }
  });

  it("parses the modules governed list surface with rollout metadata", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildModulesListSurface({
        searchValue: "finance",
        canMutate: true,
        modules: [
          {
            id: "finance",
            module: "Finance",
            category: "finance",
            status: "active",
            availability: "enabled",
            visibility: "visible",
            capabilities: "12",
            permissions: "finance.view",
            policies: "3",
            readinessVerdict: "ready",
            lastChanged: "2026-05-29",
          },
        ],
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.requiresErpPermission).toEqual({
        module: "system-admin",
        object: "modules",
        function: "read",
      });
      expect(parsed.data.presentation?.toolbar?.search?.param).toBe("modulesQ");
      expect(parsed.data.columns.map((column) => column.id)).toEqual([
        "module",
        "category",
        "status",
        "availability",
        "visibility",
        "capabilities",
        "permissions",
        "policies",
        "readinessVerdict",
        "lastChanged",
      ]);
      expect(parsed.data.rows[0]?.trailingAction?.state).toBe("ready");
      expect(parsed.data.rows[0]?.trailingAction?.descriptor?.label).toBe(
        "Disable",
      );
    }
  });

  it("parses the capabilities governed list surface with readiness metadata", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildCapabilitiesListSurface({
        canMutate: true,
        capabilities: [
          {
            id: "finance.view",
            capability: "finance.view",
            module: "finance",
            route: "/finance",
            requiredPermission: "finance.view",
            availability: "enabled",
            readinessVerdict: "ready",
            coverageVerdict: "covered",
            accessCoverage: "Catalog",
            auditCoverage: "Declared",
            docsCoverage: "Declared",
            issues: "None",
          },
        ],
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.presentation?.toolbar?.search?.param).toBe(
        "capabilitiesQ",
      );
      expect(parsed.data.rows[0]?.trailingAction?.state).toBe("ready");
    }
  });

  it("parses the approvals governed list surface with trailing actions", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildApprovalsListSurface({
        canMutate: true,
        approvals: [
          {
            id: "approval_1",
            key: "finance.payment",
            name: "Payment release",
            moduleKey: "finance",
            action: "finance.documents.write",
            targetType: "erp-record",
            approvalMode: "parallel",
            approverRoles: "finance-manager",
            minApprovals: 1,
            escalation: "Not configured",
            status: "active",
            enabled: true,
            readinessVerdict: "ready",
          },
        ],
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.requiresErpPermission).toEqual({
        module: "system-admin",
        object: "approvals",
        function: "read",
      });
      expect(parsed.data.presentation?.toolbar?.search?.param).toBe("approvalsQ");
      expect(parsed.data.rows[0]?.trailingAction?.state).toBe("ready");
      expect(parsed.data.rows[0]?.trailingAction?.descriptor?.label).toBe(
        "Disable",
      );
      expect(parsed.data.rows[0]?.rowHref).toContain("approvalsKey=finance.payment");
    }
  });

  it("parses the security posture governed list surface with ERP permission metadata", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildSystemAdminSecuritySettingsListSurface({
        security: {
          organizationId: "org_1",
          requireMfaForAdmins: true,
          allowedEmailDomains: ["example.com"],
          sessionMaxAgeMinutes: 720,
          idleTimeoutMinutes: 30,
          requireSensitiveActionConfirmation: true,
          restrictInvitesToAllowedDomains: true,
          adminLockoutProtectionEnabled: true,
          updatedByUserId: "user_1",
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
        readiness: evaluateSecurityReadiness({
          organizationId: "org_1",
          requireMfaForAdmins: true,
          allowedEmailDomains: ["example.com"],
          sessionMaxAgeMinutes: 720,
          idleTimeoutMinutes: 30,
          requireSensitiveActionConfirmation: true,
          restrictInvitesToAllowedDomains: true,
          adminLockoutProtectionEnabled: true,
          updatedByUserId: "user_1",
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        }),
        objectStorageProvider: null,
        deploymentProvider: "r2",
        encryptionSettings: defaultEncryptionSettings,
      }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.requiresErpPermission).toEqual({
        module: "system-admin",
        object: "security",
        function: "read",
      });
      expect(parsed.data.dataNature).toBe("table");
      expect(parsed.data.rows.some((row) => row.id === "mfa")).toBe(true);
      expect(parsed.data.rows.some((row) => row.id === "readiness")).toBe(true);
      expect(parsed.data.rows.some((row) => row.id === "object-storage-provider")).toBe(
        true,
      );
      expect(
        parsed.data.rows.some((row) => row.id === "object-storage-encryption-mode"),
      ).toBe(true);
    }
  });

  it("parses granular domain control surfaces", () => {
    const surfaces = [
      buildPermissionsListSurface({ permissions: [] }),
      buildRolesListSurface({ roles: [] }),
      buildModulesListSurface({ modules: [] }),
      buildCapabilitiesListSurface({ capabilities: [] }),
      buildPoliciesListSurface({ policies: [] }),
      buildApprovalsListSurface({ approvals: [], canMutate: true }),
      buildSystemAdminSecuritySettingsListSurface({
        security: null,
        readiness: evaluateSecurityReadiness(null),
        objectStorageProvider: null,
        deploymentProvider: "vercel-blob",
        encryptionSettings: defaultEncryptionSettings,
      }),
      buildOrganizationDefaultsListSurface({
        settings: null,
        organizationName: "Afenda",
      }),
      buildSystemAdminImportTemplatesListSurface({
        templates: listSystemAdminImportTemplates(),
      }),
      buildSystemAdminImportJobsListSurface({
        jobs: [],
        canRun: false,
        canCancel: false,
      }),
      buildSystemAdminDiagnosticsIssuesListSurface({ issues: [] }),
    ];

    for (const surface of surfaces) {
      expect(parseListSurfaceRendererConfiguration(surface).success).toBe(true);
    }
  });
});

const definedConfirm = expect.objectContaining({
  title: "Revoke API credential",
});
