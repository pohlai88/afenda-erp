import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type { HrCareerPathPageModel } from "./hr.talent.career-pathing-foundation.page-model.server";
import {
  hrCareerPathingFrameworksSurfaceKey,
  hrCareerPathingOverviewKpiSurfaceKey,
  hrCareerPathingPlanGoalsSurfaceKey,
  hrCareerPathingPlansSurfaceKey,
  hrCareerPathingSkillGapsSurfaceKey,
  hrCareerPathingTargetRolesSurfaceKey,
} from "./hr.talent.career-pathing-search-params.parse.shared";
import { hrTalentCareerPathingUiCopy } from "./hr.talent.career-pathing-ui.copy.shared";

const careerPathingForbiddenState = {
  variant: "forbidden" as const,
  title: hrTalentCareerPathingUiCopy.accessDenied.title,
  description: hrTalentCareerPathingUiCopy.accessDenied.description,
};

function HrCareerPathingListSection({
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
      forbidden={careerPathingForbiddenState}
      layout="embedded"
    />
  );
}

export function HrCareerPathingSection({
  pageModel,
}: {
  pageModel: HrCareerPathPageModel;
}) {
  const copy = hrTalentCareerPathingUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <GovernedPatternBStatSection
        title={copy.overview.sectionTitle}
        description={copy.page.description}
        surfaceKey={hrCareerPathingOverviewKpiSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "career-pathing-overview",
            configuration: pageModel.overview,
          },
        ]}
      />
      <HrCareerPathingListSection
        title={copy.frameworks.surfaceHeaderTitle}
        description={copy.frameworks.emptyDescription}
        surfaceKey={hrCareerPathingFrameworksSurfaceKey}
        listConfiguration={pageModel.frameworks}
      />
      <HrCareerPathingListSection
        title={copy.targetRoles.surfaceHeaderTitle}
        description={copy.targetRoles.emptyDescription}
        surfaceKey={hrCareerPathingTargetRolesSurfaceKey}
        listConfiguration={pageModel.targetRoles}
      />
      <HrCareerPathingListSection
        title={copy.skillGaps.surfaceHeaderTitle}
        description={copy.skillGaps.emptyDescription}
        surfaceKey={hrCareerPathingSkillGapsSurfaceKey}
        listConfiguration={pageModel.skillGaps}
      />
      <HrCareerPathingListSection
        title={copy.plans.surfaceHeaderTitle}
        description={copy.plans.emptyDescription}
        surfaceKey={hrCareerPathingPlansSurfaceKey}
        listConfiguration={pageModel.plans}
      />
      {pageModel.planGoals ? (
        <HrCareerPathingListSection
          title={copy.planGoals.surfaceHeaderTitle}
          description={copy.planGoals.emptyDescription}
          surfaceKey={hrCareerPathingPlanGoalsSurfaceKey}
          listConfiguration={pageModel.planGoals}
        />
      ) : null}
    </div>
  );
}

export function HrCareerPathingAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrTalentCareerPathingUiCopy.accessDenied.title}
      description={hrTalentCareerPathingUiCopy.accessDenied.description}
    />
  );
}
