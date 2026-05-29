import {
  buildSystemAdminDiagnosticsBlockedIssuesListSurface,
  buildSystemAdminDiagnosticsInfoIssuesListSurface,
  buildSystemAdminDiagnosticsModuleCoverageListSurface,
  buildSystemAdminDiagnosticsRecentChangesListSurface,
  buildSystemAdminDiagnosticsWarningIssuesListSurface,
  systemAdminDiagnosticsModuleCoverageSurfaceKey,
  systemAdminDiagnosticsRecentChangesSurfaceKey,
  systemAdminDiagnosticsSurfaceKey,
  systemAdminDiagnosticsUiCopy,
} from "@afenda/feature-system-admin/metadata";
import {
  exportSystemAdminDiagnosticsAction,
  formatDiagnosticCategoryLabel,
  getSystemAdminDiagnosticsPageModel,
  parseSystemAdminDiagnosticsSearchParams,
  requireSystemAdminDiagnosticsRead,
  systemAdminDiagnosticsHubHref,
  SystemAdminDiagnosticsAccessDenied,
  SystemAdminDiagnosticsSummaryPanel,
} from "@afenda/feature-system-admin/server";
import { SystemAdminDiagnosticsExportButton } from "@afenda/feature-system-admin/client";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { Button, SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Diagnostics — System admin",
  description: systemAdminDiagnosticsUiCopy.page.description,
};

export default async function SystemAdminDiagnosticsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let organization: Awaited<
    ReturnType<typeof requireSystemAdminDiagnosticsRead>
  >["organization"];

  try {
    ({ organization } = await requireSystemAdminDiagnosticsRead());
  } catch {
    return <SystemAdminDiagnosticsAccessDenied />;
  }

  const { diagnosticsCategory } = parseSystemAdminDiagnosticsSearchParams(
    resolvedSearchParams,
  );
  const {
    summary,
    issuesBySeverity,
    moduleCoverage,
    recentChanges,
  } = await getSystemAdminDiagnosticsPageModel({
    organizationId: organization.id,
    category: diagnosticsCategory,
  });

  const copy = systemAdminDiagnosticsUiCopy;
  const categoryLabel = diagnosticsCategory
    ? formatDiagnosticCategoryLabel(diagnosticsCategory)
    : null;

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
        aside={
          <SystemAdminDiagnosticsExportButton
            exportDiagnosticsAction={exportSystemAdminDiagnosticsAction}
          />
        }
      />

      {categoryLabel ? (
        <SectionPanel
          title={copy.page.categoryFilterTitle}
          description={copy.page.categoryFilterDescription(categoryLabel)}
          aside={
            <Button variant="outline" size="sm" asChild>
              <Link href={systemAdminDiagnosticsHubHref()}>
                {copy.page.clearCategoryFilterLabel}
              </Link>
            </Button>
          }
        />
      ) : null}

      <SystemAdminDiagnosticsSummaryPanel summary={summary} />

      <GovernedPatternCListSection
        title={copy.moduleCoverage.title}
        surfaceKey={systemAdminDiagnosticsModuleCoverageSurfaceKey}
        listConfiguration={buildSystemAdminDiagnosticsModuleCoverageListSurface({
          rows: moduleCoverage,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      <GovernedPatternCListSection
        title={copy.recentChanges.title}
        description={copy.recentChanges.description}
        surfaceKey={systemAdminDiagnosticsRecentChangesSurfaceKey}
        listConfiguration={buildSystemAdminDiagnosticsRecentChangesListSurface({
          rows: recentChanges,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      {issuesBySeverity.blocked.length > 0 ? (
        <GovernedPatternCListSection
          title={copy.issues.blockedTitle}
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
          title={copy.issues.warningTitle}
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
          title={copy.issues.infoTitle}
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
