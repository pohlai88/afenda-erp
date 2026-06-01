import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type { HrSuccessionPageModel } from "../data/hr.talent.succession.page-model.server";
import {
  hrSuccessionAuditTrailSurfaceKey,
  hrSuccessionBenchStrengthSurfaceKey,
  hrSuccessionCalibrationReviewsSurfaceKey,
  hrSuccessionCompetencyGapsSurfaceKey,
  hrSuccessionCriticalRolesSurfaceKey,
  hrSuccessionDevelopmentPlansSurfaceKey,
  hrSuccessionLifecycleRecommendationsSurfaceKey,
  hrSuccessionNotificationsSurfaceKey,
  hrSuccessionOverviewKpiSurfaceKey,
  hrSuccessionReplacementPlansSurfaceKey,
  hrSuccessionReportsSurfaceKey,
  hrSuccessionSuccessorsSurfaceKey,
  hrSuccessionTalentPoolsSurfaceKey,
} from "../data/hr.talent.succession-search-params.parse.shared";
import { hrSuccessionUiCopy } from "../surface/hr.talent.succession-ui.copy.shared";

const successionForbiddenState = {
  variant: "forbidden" as const,
  title: hrSuccessionUiCopy.accessDenied.title,
  description: hrSuccessionUiCopy.accessDenied.description,
};

function HrSuccessionListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: Parameters<
    typeof GovernedPatternCListSection
  >[0]["listConfiguration"];
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      forbidden={successionForbiddenState}
      layout="embedded"
    />
  );
}

export function HrSuccessionSection({
  pageModel,
}: {
  pageModel: HrSuccessionPageModel;
}) {
  const copy = hrSuccessionUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <GovernedPatternBStatSection
        title={copy.overview.sectionTitle}
        description={copy.page.description}
        surfaceKey={hrSuccessionOverviewKpiSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "succession-overview",
            configuration: pageModel.overview,
          },
        ]}
      />
      <HrSuccessionListSection
        title={copy.criticalRoles.surfaceHeaderTitle}
        description={copy.criticalRoles.emptyDescription}
        surfaceKey={hrSuccessionCriticalRolesSurfaceKey}
        listConfiguration={pageModel.criticalRolesList}
      />
      <HrSuccessionListSection
        title={copy.successors.surfaceHeaderTitle}
        description={copy.successors.emptyDescription}
        surfaceKey={hrSuccessionSuccessorsSurfaceKey}
        listConfiguration={pageModel.successorsList}
      />
      <HrSuccessionListSection
        title={copy.competencyGaps.surfaceHeaderTitle}
        description={copy.competencyGaps.emptyDescription}
        surfaceKey={hrSuccessionCompetencyGapsSurfaceKey}
        listConfiguration={pageModel.competencyGapsList}
      />
      <HrSuccessionListSection
        title={copy.developmentPlans.surfaceHeaderTitle}
        description={copy.developmentPlans.emptyDescription}
        surfaceKey={hrSuccessionDevelopmentPlansSurfaceKey}
        listConfiguration={pageModel.developmentPlansList}
      />
      <HrSuccessionListSection
        title={copy.talentPools.surfaceHeaderTitle}
        description={copy.talentPools.emptyDescription}
        surfaceKey={hrSuccessionTalentPoolsSurfaceKey}
        listConfiguration={pageModel.talentPoolsList}
      />
      <HrSuccessionListSection
        title={copy.calibrationReviews.surfaceHeaderTitle}
        description={copy.calibrationReviews.emptyDescription}
        surfaceKey={hrSuccessionCalibrationReviewsSurfaceKey}
        listConfiguration={pageModel.calibrationReviewsList}
      />
      <HrSuccessionListSection
        title={copy.benchStrength.surfaceHeaderTitle}
        description={copy.benchStrength.emptyDescription}
        surfaceKey={hrSuccessionBenchStrengthSurfaceKey}
        listConfiguration={pageModel.benchStrengthList}
      />
      <HrSuccessionListSection
        title={copy.replacementPlans.surfaceHeaderTitle}
        description={copy.replacementPlans.emptyDescription}
        surfaceKey={hrSuccessionReplacementPlansSurfaceKey}
        listConfiguration={pageModel.replacementPlansList}
      />
      <HrSuccessionListSection
        title={copy.notifications.surfaceHeaderTitle}
        description={copy.notifications.emptyDescription}
        surfaceKey={hrSuccessionNotificationsSurfaceKey}
        listConfiguration={pageModel.notificationsList}
      />
      {pageModel.lifecycleRecommendationsList ? (
        <HrSuccessionListSection
          title={copy.lifecycle.surfaceHeaderTitle}
          description={copy.lifecycle.emptyDescription}
          surfaceKey={hrSuccessionLifecycleRecommendationsSurfaceKey}
          listConfiguration={pageModel.lifecycleRecommendationsList}
        />
      ) : null}
      <HrSuccessionListSection
        title={copy.reports.surfaceHeaderTitle}
        description={`Grouped by ${pageModel.reportGroupBy.replaceAll("_", " ")}.`}
        surfaceKey={hrSuccessionReportsSurfaceKey}
        listConfiguration={pageModel.reportsList}
      />
      {pageModel.auditTrailList ? (
        <HrSuccessionListSection
          title={copy.audit.surfaceHeaderTitle}
          description={copy.audit.emptyDescription}
          surfaceKey={hrSuccessionAuditTrailSurfaceKey}
          listConfiguration={pageModel.auditTrailList}
        />
      ) : null}
    </div>
  );
}

export const HrSuccessionPlanningSection = HrSuccessionSection;

export function HrSuccessionAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrSuccessionUiCopy.accessDenied.title}
      description={hrSuccessionUiCopy.accessDenied.description}
    />
  );
}

export const HrSuccessionPlanningAccessDeniedPanel =
  HrSuccessionAccessDeniedPanel;
