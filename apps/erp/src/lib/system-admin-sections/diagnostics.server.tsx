import {
  buildSystemAdminDiagnosticsBlockedIssuesListSurface,
  buildSystemAdminDiagnosticsInfoIssuesListSurface,
  buildSystemAdminDiagnosticsModuleCoverageListSurface,
  buildSystemAdminDiagnosticsRecentChangesListSurface,
  buildSystemAdminDiagnosticsWarningIssuesListSurface,
  systemAdminDiagnosticsModuleCoverageSurfaceKey,
  systemAdminDiagnosticsRecentChangesSurfaceKey,
  systemAdminDiagnosticsSurfaceKey,
} from "@afenda/feature-system-admin/metadata";
import {
  getSystemAdminDiagnosticsPageModel,
  requireSystemAdminDiagnosticsRead,
  SystemAdminDiagnosticsSummaryPanel,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnostics — System admin",
  description:
    "Organization-scoped configuration health for permissions, capabilities, policies, approvals, audit coverage, and security posture.",
};

export default async function SystemAdminDiagnosticsPage() {
  const { organization } = await requireSystemAdminDiagnosticsRead();
  const {
    summary,
    issuesBySeverity,
    moduleCoverage,
    recentChanges,
  } = await getSystemAdminDiagnosticsPageModel({
    organizationId: organization.id,
  });

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title="Diagnostics"
        description="Read-only configuration health. Diagnostics observes drift and coverage gaps; System Admin surfaces are where operators remediate settings."
      />

      <SystemAdminDiagnosticsSummaryPanel summary={summary} />

      <GovernedPatternCListSection
        title="Coverage by module"
        surfaceKey={systemAdminDiagnosticsModuleCoverageSurfaceKey}
        listConfiguration={buildSystemAdminDiagnosticsModuleCoverageListSurface({
          rows: moduleCoverage,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title="Recent configuration changes"
        description="Latest administrative audit evidence for module, capability, policy, approval, security, and role configuration. Open the audit viewer for full search and export."
        surfaceKey={systemAdminDiagnosticsRecentChangesSurfaceKey}
        listConfiguration={buildSystemAdminDiagnosticsRecentChangesListSurface({
          rows: recentChanges,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      {issuesBySeverity.blocked.length > 0 ? (
        <GovernedPatternCListSection
          title="Blocked issues"
          surfaceKey={`${systemAdminDiagnosticsSurfaceKey}:blocked`}
          listConfiguration={buildSystemAdminDiagnosticsBlockedIssuesListSurface({
            issues: issuesBySeverity.blocked,
          })}
          parentAccessAllowed
          layout="embedded"
        />
      ) : null}

      {issuesBySeverity.warning.length > 0 ? (
        <GovernedPatternCListSection
          title="Warnings"
          surfaceKey={`${systemAdminDiagnosticsSurfaceKey}:warning`}
          listConfiguration={buildSystemAdminDiagnosticsWarningIssuesListSurface({
            issues: issuesBySeverity.warning,
          })}
          parentAccessAllowed
          layout="embedded"
        />
      ) : null}

      {issuesBySeverity.info.length > 0 ? (
        <GovernedPatternCListSection
          title="Informational notices"
          surfaceKey={`${systemAdminDiagnosticsSurfaceKey}:info`}
          listConfiguration={buildSystemAdminDiagnosticsInfoIssuesListSurface({
            issues: issuesBySeverity.info,
          })}
          parentAccessAllowed
          layout="embedded"
        />
      ) : null}
    </div>
  );
}
