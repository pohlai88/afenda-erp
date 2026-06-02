import {
  buildCronHealthListSurface,
  buildSystemAdminReliabilityBlockedIssuesListSurface,
  buildSystemAdminReliabilityInfoIssuesListSurface,
  buildSystemAdminReliabilityOperationalLinksListSurface,
  buildSystemAdminReliabilityWarningIssuesListSurface,
  systemAdminCronSurfaceKey,
  systemAdminReliabilityOperationalLinksSurfaceKey,
  systemAdminReliabilitySurfaceKey,
  systemAdminReliabilityUiCopy,
} from "@afenda/feature-system-admin/metadata";
import {
  getSystemAdminReliabilityPageModel,
  requireSystemAdminReliabilityRead,
  SystemAdminReliabilityAccessDenied,
  SystemAdminReliabilitySummaryPanel,
} from "@afenda/feature-system-admin/server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reliability — System admin",
  description: systemAdminReliabilityUiCopy.page.description,
};

export default async function SystemAdminReliabilityPage() {
  let organization: Awaited<
    ReturnType<typeof requireSystemAdminReliabilityRead>
  >["organization"];

  try {
    ({ organization } = await requireSystemAdminReliabilityRead());
  } catch {
    return <SystemAdminReliabilityAccessDenied />;
  }

  const pageModel = await getSystemAdminReliabilityPageModel({
    organizationId: organization.id,
  });

  const copy = systemAdminReliabilityUiCopy;

  return (
    <div className="flex flex-col gap-surface-2xl">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />

      <SystemAdminReliabilitySummaryPanel summary={pageModel.summary} />

      <GovernedPatternCListSection
        title={copy.operationalLinks.title}
        description={copy.operationalLinks.description}
        surfaceKey={systemAdminReliabilityOperationalLinksSurfaceKey}
        listConfiguration={buildSystemAdminReliabilityOperationalLinksListSurface({
          rows: pageModel.operationalLinks,
        })}
        parentAccessAllowed
        layout="embedded"
      />

      {pageModel.issuesBySeverity.blocked.length > 0 ? (
        <GovernedPatternCListSection
          title={copy.issues.blockedTitle}
          surfaceKey={`${systemAdminReliabilitySurfaceKey}:blocked`}
          listConfiguration={buildSystemAdminReliabilityBlockedIssuesListSurface({
            issues: pageModel.issuesBySeverity.blocked,
          })}
          parentAccessAllowed
          layout="embedded"
        />
      ) : null}

      {pageModel.issuesBySeverity.warning.length > 0 ? (
        <GovernedPatternCListSection
          title={copy.issues.warningTitle}
          surfaceKey={`${systemAdminReliabilitySurfaceKey}:warning`}
          listConfiguration={buildSystemAdminReliabilityWarningIssuesListSurface({
            issues: pageModel.issuesBySeverity.warning,
          })}
          parentAccessAllowed
          layout="embedded"
        />
      ) : null}

      {pageModel.issuesBySeverity.info.length > 0 ? (
        <GovernedPatternCListSection
          title={copy.issues.infoTitle}
          surfaceKey={`${systemAdminReliabilitySurfaceKey}:info`}
          listConfiguration={buildSystemAdminReliabilityInfoIssuesListSurface({
            issues: pageModel.issuesBySeverity.info,
          })}
          parentAccessAllowed
          layout="embedded"
        />
      ) : null}

      <GovernedPatternCListSection
        title={copy.cron.title}
        description={copy.cron.description}
        surfaceKey={systemAdminCronSurfaceKey}
        listConfiguration={buildCronHealthListSurface({
          rows: pageModel.cronRows,
        })}
        parentAccessAllowed
        layout="embedded"
      />
    </div>
  );
}
