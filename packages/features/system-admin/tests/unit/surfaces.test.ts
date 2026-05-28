import { describe, expect, it } from "vitest";
import { parseListSurfaceRendererConfiguration } from "@afenda/governed-surface/schemas";
import { buildMembersListSurface } from "../../src/surfaces/system-admin.identity.surface";
import {
  buildApiCredentialsListSurface,
  buildWebhooksListSurface,
} from "../../src/surfaces/system-admin.integrations.surface";
import {
  buildCapabilitiesListSurface,
  buildModulesListSurface,
  buildOrganizationDefaultsListSurface,
  buildPermissionsListSurface,
} from "../../src/surfaces/system-admin.control.surface";
import { buildSystemAdminDiagnosticsIssuesListSurface } from "../../src/diagnostics/data/system-admin.diagnostics.surface";
import { buildSystemAdminAuditViewerListSurface } from "../../src/audit-viewer/data/system-admin.audit.surface";
import { buildSystemAdminSecuritySettingsListSurface } from "../../src/security/data/system-admin.security.surface";
import { buildApprovalsListSurface } from "../../src/approvals/data/system-admin.approval-rules.surface";
import { buildPoliciesListSurface } from "../../src/policies/data/system-admin.policy-rules.surface";
import {
  buildSystemAdminAiSandboxesListSurface,
  buildSystemAdminAiUsageListSurface,
} from "../../src/surfaces/system-admin.machine-layer.surface";

describe("system admin governed surfaces", () => {
  it("normalizes empty pagination to schema-safe server windows", () => {
    const parsed = parseListSurfaceRendererConfiguration(
      buildMembersListSurface({ members: [] }),
    );

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.pagination?.pageSize).toBe(1);
      expect(parsed.data.presentation?.toolbar?.search?.param).toBe("membersQ");
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

  it("uses machine-layer labels on admin machine surfaces", () => {
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
      expect(usage.data.surface.header?.title).toBe("Machine usage ledger");
      expect(sandboxes.data.surface.header?.title).toBe(
        "Lynx action sandboxes",
      );
    }
  });

  it("parses granular domain control surfaces", () => {
    const surfaces = [
      buildPermissionsListSurface({ permissions: [] }),
      buildModulesListSurface({ modules: [] }),
      buildCapabilitiesListSurface({ capabilities: [] }),
      buildPoliciesListSurface({ policies: [] }),
      buildApprovalsListSurface({ approvals: [] }),
      buildSystemAdminSecuritySettingsListSurface({ security: null }),
      buildOrganizationDefaultsListSurface({
        settings: null,
        organizationName: "Afenda",
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
