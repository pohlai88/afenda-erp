import { listRoleOverridesForOrganization } from "../users/sys-identity.repository.server";
import {
  listTenantApprovalSettings,
  listTenantCapabilitySettings,
  listTenantModuleSettings,
  listTenantPolicySettings,
} from "../tenant-execution/sys-execution-settings.repository.server";
import { getSystemAdminOrganizationSecuritySettings } from "../security/sys-security.query.server";
import {
  mapApiCredentialToListRow,
  mapSsoConnectionToListRow,
  mapWebhookDeliveryToListRow,
  mapWebhookToListRow,
} from "../integrations/sys-integrations.mapper.server";
import { evaluateIntegrationsReadiness } from "../integrations/sys-integrations.readiness.server";
import {
  listApiCredentials,
  listSsoConnections,
  listWebhookDeliveries,
  listWebhooks,
} from "../integrations/sys-integrations.repository.server";
import type {
  SystemAdminDiagnosticCategory,
  SystemAdminDiagnosticIssue,
  SystemAdminDiagnosticsSummary,
} from "./sys-diagnostic-issue.contract";
import type {
  SystemAdminDiagnosticsModuleCoverageRow,
  SystemAdminDiagnosticsRecentChangeRow,
} from "./sys-diagnostics-coverage.contract";
import {
  collectIntegrationDiagnosticIssues,
  collectSystemAdminDiagnosticIssues,
} from "./sys-diagnostics.checks.server";
import { buildDiagnosticsModuleCoverageRows } from "./sys-diagnostics.module-coverage.server";
import { listSystemAdminDiagnosticsRecentChanges } from "./sys-diagnostics.recent-changes.server";
import {
  groupDiagnosticIssuesBySeverity,
  sortDiagnosticIssues,
  summarizeDiagnosticIssues,
} from "./sys-diagnostics.verdict.server";

export type SystemAdminDiagnosticsPageModel = {
  issues: readonly SystemAdminDiagnosticIssue[];
  summary: SystemAdminDiagnosticsSummary;
  issuesBySeverity: ReturnType<typeof groupDiagnosticIssuesBySeverity>;
  moduleCoverage: readonly SystemAdminDiagnosticsModuleCoverageRow[];
  recentChanges: readonly SystemAdminDiagnosticsRecentChangeRow[];
};

export async function getSystemAdminDiagnosticsPageModel(input: {
  organizationId: string;
  category?: SystemAdminDiagnosticCategory;
}): Promise<SystemAdminDiagnosticsPageModel> {
  const [
    moduleSettings,
    capabilitySettings,
    policySettings,
    approvalSettings,
    roleOverrides,
    security,
    recentChanges,
    credentialRows,
    webhookRows,
    deliveryRows,
    ssoRows,
  ] = await Promise.all([
    listTenantModuleSettings({ organizationId: input.organizationId, limit: 200 }),
    listTenantCapabilitySettings({
      organizationId: input.organizationId,
      limit: 500,
    }),
    listTenantPolicySettings({ organizationId: input.organizationId, limit: 500 }),
    listTenantApprovalSettings({
      organizationId: input.organizationId,
      limit: 500,
    }),
    listRoleOverridesForOrganization({ organizationId: input.organizationId }),
    getSystemAdminOrganizationSecuritySettings({
      organizationId: input.organizationId,
    }),
    listSystemAdminDiagnosticsRecentChanges({
      organizationId: input.organizationId,
    }),
    listApiCredentials({ organizationId: input.organizationId, limit: 100 }),
    listWebhooks({ organizationId: input.organizationId, limit: 100 }),
    listWebhookDeliveries({ organizationId: input.organizationId, limit: 50 }),
    listSsoConnections({ organizationId: input.organizationId, limit: 50 }),
  ]);

  const integrationsReadiness = evaluateIntegrationsReadiness({
    credentials: credentialRows.map(mapApiCredentialToListRow),
    webhooks: webhookRows.map(mapWebhookToListRow),
    deliveries: deliveryRows.map(mapWebhookDeliveryToListRow),
    ssoConnections: ssoRows.map(mapSsoConnectionToListRow),
  });

  const allIssues = sortDiagnosticIssues([
    ...collectSystemAdminDiagnosticIssues({
      moduleSettings,
      capabilitySettings,
      policySettings,
      approvalSettings,
      roleOverrides,
      security,
    }),
    ...collectIntegrationDiagnosticIssues(integrationsReadiness),
  ]);

  const issues = input.category
    ? allIssues.filter((issue) => issue.category === input.category)
    : allIssues;

  return {
    issues,
    summary: summarizeDiagnosticIssues(issues),
    issuesBySeverity: groupDiagnosticIssuesBySeverity(issues),
    moduleCoverage: buildDiagnosticsModuleCoverageRows({
      issues: allIssues,
      moduleSettings,
    }),
    recentChanges,
  };
}
