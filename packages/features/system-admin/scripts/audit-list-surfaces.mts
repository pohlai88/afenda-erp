/**
 * Dev audit: builds empty system-admin list surfaces and asserts empty-state metadata.
 * Run from repo root: pnpm exec tsx packages/features/system-admin/scripts/audit-list-surfaces.mts
 */
import type { ListSurfaceRendererConfigurationResolvedInput } from "@afenda/governed-surface";
import { buildApprovalsListSurface } from "../src/approvals/surface/system-admin.approvals-list.surface.js";
import { buildSystemAdminAuditViewerListSurface } from "../src/audit-viewer/surface/system-admin.audit-list.surface.js";
import { buildSystemAdminRetentionPoliciesListSurface } from "../src/audit-viewer/surface/system-admin.retention-list.surface.js";
import { buildBillingEntitlementsListSurface } from "../src/billing/surface/system-admin.billing-entitlements.surface.js";
import { buildBillingGovernanceListSurface } from "../src/billing/surface/system-admin.billing-governance.surface.js";
import { buildCapabilityRoleMatrixListSurface } from "../src/capabilities/surface/system-admin.capabilities-role-matrix.surface.js";
import {
  buildSystemAdminDiagnosticsBlockedIssuesListSurface,
  buildSystemAdminDiagnosticsIssuesListSurface,
  buildSystemAdminDiagnosticsModuleCoverageListSurface,
  buildSystemAdminDiagnosticsRecentChangesListSurface,
} from "../src/diagnostics/surface/system-admin.diagnostics-list.surface.js";
import { buildOrganizationDefaultsListSurface } from "../src/organization/data/system-admin.organization-list.surface.js";
import { buildRoleOverridesListSurface } from "../src/permissions/surface/system-admin.role-overrides-list.surface.js";
import {
  buildSystemAdminAiApprovalsListSurface,
  buildSystemAdminAiEntitlementsListSurface,
  buildSystemAdminAiSandboxesListSurface,
  buildSystemAdminAiUsageListSurface,
} from "../src/lynx/data/system-admin.lynx.surface.js";
import { buildGatewaySpendListSurface } from "../src/lynx/data/system-admin.gateway-spend.surface.js";
import { buildSystemAdminSecuritySettingsListSurface } from "../src/security/surface/system-admin.security-list.surface.js";
import { buildSystemAdminSecurityRecentChangesListSurface } from "../src/security/surface/system-admin.security-recent-changes.surface.js";
import { buildIntegrationsGovernanceListSurface } from "../src/integrations/surface/system-admin.integrations-governance.surface.js";
import { buildSystemAdminIntegrationsRecentChangesListSurface } from "../src/integrations/surface/system-admin.integrations-recent-changes.surface.js";
import { buildCronHealthListSurface } from "../src/reliability/surface/system-admin.cron-health.surface.js";
import {
  buildSystemAdminReliabilityBlockedIssuesListSurface,
  buildSystemAdminReliabilityOperationalLinksListSurface,
} from "../src/reliability/surface/system-admin.reliability-list.surface.js";

const GENERIC_SEARCH = /^Search [a-zA-Z][a-zA-Z-]*$/;

function assertSurfaceQuality(
  name: string,
  config: ListSurfaceRendererConfigurationResolvedInput,
) {
  const emptyDescription = config.surface.empty.description;
  const searchPlaceholder = config.presentation?.toolbar?.search?.placeholder;

  if (!emptyDescription) {
    throw new Error(
      `[${name}] missing surface.empty.description (${config.surface.columnsId})`,
    );
  }

  if (searchPlaceholder && GENERIC_SEARCH.test(searchPlaceholder)) {
    throw new Error(
      `[${name}] generic search placeholder: "${searchPlaceholder}"`,
    );
  }
}

const builders: Array<{
  name: string;
  run: () => ListSurfaceRendererConfigurationResolvedInput;
}> = [
  {
    name: "approvals",
    run: () => buildApprovalsListSurface({ approvals: [], canMutate: false }),
  },
  {
    name: "organization",
    run: () =>
      buildOrganizationDefaultsListSurface({
        settings: null,
        organizationName: "Audit Org",
      }),
  },
  {
    name: "audit",
    run: () =>
      buildSystemAdminAuditViewerListSurface({
        rows: [],
        params: { auditPage: 1, auditPageSize: 25 },
        totalCount: 0,
        pageSize: 25,
        page: 1,
        hasNextPage: false,
      }),
  },
  {
    name: "retention",
    run: () => buildSystemAdminRetentionPoliciesListSurface({ policies: [] }),
  },
  {
    name: "role-overrides",
    run: () => buildRoleOverridesListSurface({ overrides: [] }),
  },
  {
    name: "capability-matrix",
    run: () => buildCapabilityRoleMatrixListSurface({ rows: [] }),
  },
  {
    name: "billing-entitlements",
    run: () => buildBillingEntitlementsListSurface({ entitlements: [] }),
  },
  {
    name: "billing-governance",
    run: () =>
      buildBillingGovernanceListSurface({
        readiness: { verdict: "ready", issues: [] },
        subscription: {
          planKey: "none",
          status: "inactive",
          seatQuantity: 0,
          currentPeriodEnd: null,
        },
        seatCount: 0,
        gatewaySpendAvailable: false,
      }),
  },
  {
    name: "diagnostics-all",
    run: () => buildSystemAdminDiagnosticsIssuesListSurface({ issues: [] }),
  },
  {
    name: "diagnostics-blocked",
    run: () =>
      buildSystemAdminDiagnosticsBlockedIssuesListSurface({ issues: [] }),
  },
  {
    name: "diagnostics-module-coverage",
    run: () =>
      buildSystemAdminDiagnosticsModuleCoverageListSurface({ rows: [] }),
  },
  {
    name: "diagnostics-recent",
    run: () =>
      buildSystemAdminDiagnosticsRecentChangesListSurface({ rows: [] }),
  },
  {
    name: "lynx-usage",
    run: () => buildSystemAdminAiUsageListSurface({ events: [] }),
  },
  {
    name: "lynx-approvals",
    run: () => buildSystemAdminAiApprovalsListSurface({ proposals: [] }),
  },
  {
    name: "lynx-sandboxes",
    run: () =>
      buildSystemAdminAiSandboxesListSurface({ sandboxes: [], canMutate: false }),
  },
  {
    name: "lynx-entitlements",
    run: () => buildSystemAdminAiEntitlementsListSurface({ entitlements: [] }),
  },
  {
    name: "gateway-spend",
    run: () =>
      buildGatewaySpendListSurface({
        available: true,
        entries: [],
      }),
  },
  {
    name: "security-posture",
    run: () =>
      buildSystemAdminSecuritySettingsListSurface({
        security: null,
        readiness: { verdict: "ready", issues: [] },
        objectStorageProvider: null,
        deploymentProvider: "r2",
        encryptionSettings: {
          mode: "platform" as const,
          kmsAdapter: null,
          kmsKeyRef: null,
        },
      }),
  },
  {
    name: "security-recent",
    run: () => buildSystemAdminSecurityRecentChangesListSurface({ rows: [] }),
  },
  {
    name: "integrations-governance",
    run: () =>
      buildIntegrationsGovernanceListSurface({
        readiness: { verdict: "ready", issues: [] },
        activeCredentialCount: 0,
        enabledWebhookCount: 0,
        failedDeliveryCount: 0,
        stagedSsoCount: 0,
      }),
  },
  {
    name: "integrations-recent",
    run: () => buildSystemAdminIntegrationsRecentChangesListSurface({ rows: [] }),
  },
  {
    name: "reliability-cron",
    run: () => buildCronHealthListSurface({ rows: [] }),
  },
  {
    name: "reliability-blocked",
    run: () =>
      buildSystemAdminReliabilityBlockedIssuesListSurface({ issues: [] }),
  },
  {
    name: "reliability-links",
    run: () =>
      buildSystemAdminReliabilityOperationalLinksListSurface({ rows: [] }),
  },
];

for (const builder of builders) {
  assertSurfaceQuality(builder.name, builder.run());
}

console.log(
  `OK: ${builders.length} system-admin list surfaces have empty descriptions and domain search copy.`,
);
