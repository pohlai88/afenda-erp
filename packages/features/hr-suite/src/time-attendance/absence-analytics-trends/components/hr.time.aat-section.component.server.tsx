import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import type {
  EmptyState,
  ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface/schemas";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";

import type { HrAatPageModel } from "../data/hr.time.aat.page-model.server";
import { hrAatUiCopy } from "../surface/hr.time.aat-ui.copy.shared";
import { hrAatAuditTrailSurfaceKey } from "../surface/hr.time.aat-audit-trail-list.surface";
import { hrAatNotificationsSurfaceKey } from "../surface/hr.time.aat-notifications-list.surface";
import { hrAatOverviewStatSurfaceKey } from "../surface/hr.time.aat-overview-stat.surface";
import { hrAatRiskIndicatorsSurfaceKey } from "../surface/hr.time.aat-risk-indicators-list.surface";
import { hrAatSnapshotsSurfaceKey } from "../surface/hr.time.aat-snapshots-list.surface";

const aatForbiddenState = {
  variant: "forbidden" as const,
  title: hrAatUiCopy.accessDenied.title,
  description: hrAatUiCopy.accessDenied.description,
};

function HrAatGovernedListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
  loadError,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration?: ListSurfaceRendererConfigurationInput;
  loadError?: EmptyState;
}) {
  if (!listConfiguration) {
    return (
      <SectionPanel headingLevel={3} title={title} description={description}>
        <Alert variant="destructive">
          <AlertTitle>{loadError?.title ?? "Unavailable"}</AlertTitle>
          <AlertDescription>
            {loadError?.description ?? "Could not load this section."}
          </AlertDescription>
        </Alert>
      </SectionPanel>
    );
  }

  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      loadError={loadError}
      parentAccessAllowed
      layout="embedded"
      forbidden={aatForbiddenState}
    />
  );
}

export function HrAatAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrAatUiCopy.accessDenied.title}
      description={hrAatUiCopy.accessDenied.description}
    />
  );
}

/** Absence Analytics & Trends workbench — Pattern B overview + Pattern C lists. */
export function HrAatWorkbenchSection({ model }: { model: HrAatPageModel }) {
  return (
    <div className="@container flex flex-col gap-surface-lg">
      <GovernedPatternBStatSection
        title={hrAatUiCopy.overview.sectionTitle}
        description={hrAatUiCopy.page.description}
        surfaceKey={hrAatOverviewStatSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "overview",
            configuration: model.overviewStats,
          },
        ]}
      />

      {model.canViewRiskIndicators ? (
        <HrAatGovernedListSection
          title={hrAatUiCopy.riskIndicators.sectionTitle}
          description={hrAatUiCopy.riskIndicators.emptyDescription}
          surfaceKey={hrAatRiskIndicatorsSurfaceKey}
          listConfiguration={model.riskIndicators}
          loadError={model.riskIndicatorsLoadError}
        />
      ) : null}

      <HrAatGovernedListSection
        title={hrAatUiCopy.snapshots.sectionTitle}
        description={hrAatUiCopy.snapshots.emptyDescription}
        surfaceKey={hrAatSnapshotsSurfaceKey}
        listConfiguration={model.snapshots}
        loadError={model.snapshotsLoadError}
      />

      <HrAatGovernedListSection
        title={hrAatUiCopy.notifications.sectionTitle}
        description={hrAatUiCopy.notifications.emptyDescription}
        surfaceKey={hrAatNotificationsSurfaceKey}
        listConfiguration={model.notifications}
        loadError={model.notificationsLoadError}
      />

      {model.canViewAudit ? (
        <HrAatGovernedListSection
          title={hrAatUiCopy.audit.sectionTitle}
          description={hrAatUiCopy.audit.emptyDescription}
          surfaceKey={hrAatAuditTrailSurfaceKey}
          listConfiguration={model.auditTrail}
          loadError={model.auditTrailLoadError}
        />
      ) : null}
    </div>
  );
}
