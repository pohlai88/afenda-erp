import { listRoleOverridesForOrganization } from "../../data/repositories/system-admin.identity.repository.server";
import {
  listTenantApprovalSettings,
  listTenantCapabilitySettings,
  listTenantModuleSettings,
  listTenantPolicySettings,
} from "../../data/repositories/system-admin.execution-settings.repository.server";
import { getSystemAdminOrganizationSecuritySettings } from "../../security/data/system-admin.security.query.server";
import type {
  SystemAdminDiagnosticIssue,
  SystemAdminDiagnosticsSummary,
} from "../contracts/system-admin.diagnostic-issue.contract";
import type {
  SystemAdminDiagnosticsModuleCoverageRow,
  SystemAdminDiagnosticsRecentChangeRow,
} from "../contracts/system-admin.diagnostics-coverage.contract";
import { collectSystemAdminDiagnosticIssues } from "./system-admin.diagnostics.checks.server";
import { buildDiagnosticsModuleCoverageRows } from "./system-admin.diagnostics.module-coverage.server";
import { listSystemAdminDiagnosticsRecentChanges } from "./system-admin.diagnostics.recent-changes.server";
import {
  groupDiagnosticIssuesBySeverity,
  summarizeDiagnosticIssues,
} from "./system-admin.diagnostics.verdict.server";

export type SystemAdminDiagnosticsPageModel = {
  issues: readonly SystemAdminDiagnosticIssue[];
  summary: SystemAdminDiagnosticsSummary;
  issuesBySeverity: ReturnType<typeof groupDiagnosticIssuesBySeverity>;
  moduleCoverage: readonly SystemAdminDiagnosticsModuleCoverageRow[];
  recentChanges: readonly SystemAdminDiagnosticsRecentChangeRow[];
};

export async function getSystemAdminDiagnosticsPageModel(input: {
  organizationId: string;
}): Promise<SystemAdminDiagnosticsPageModel> {
  const [
    moduleSettings,
    capabilitySettings,
    policySettings,
    approvalSettings,
    roleOverrides,
    security,
    recentChanges,
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
  ]);

  const issues = collectSystemAdminDiagnosticIssues({
    moduleSettings,
    capabilitySettings,
    policySettings,
    approvalSettings,
    roleOverrides,
    security,
  });

  return {
    issues,
    summary: summarizeDiagnosticIssues(issues),
    issuesBySeverity: groupDiagnosticIssuesBySeverity(issues),
    moduleCoverage: buildDiagnosticsModuleCoverageRows({
      issues,
      moduleSettings,
    }),
    recentChanges,
  };
}
