import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  HrTrainingPageModel,
  HrTrainingPageModelListSection,
} from "./hr.talent.training.page-model.server";
import { hrTrainingOverviewKpiSurfaceKey } from "./hr.talent.training-surface-metadata.shared";
import { hrTalentTrainingUiCopy } from "./hr.talent.training-ui.copy.shared";

const trainingForbiddenState = {
  variant: "forbidden" as const,
  title: hrTalentTrainingUiCopy.accessDenied.title,
  description: hrTalentTrainingUiCopy.accessDenied.description,
};

function HrTrainingListSection({
  section,
}: {
  readonly section: HrTrainingPageModelListSection;
}) {
  return (
    <GovernedPatternCListSection
      title={section.title}
      description={section.description}
      surfaceKey={section.surfaceKey}
      listConfiguration={section.listConfiguration}
      forbidden={trainingForbiddenState}
      layout="embedded"
    />
  );
}

export function HrTrainingSection({
  pageModel,
}: {
  readonly pageModel: HrTrainingPageModel;
}) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <GovernedPatternBStatSection
        title={hrTalentTrainingUiCopy.overview.sectionTitle}
        description={pageModel.description}
        surfaceKey={hrTrainingOverviewKpiSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "training-overview",
            configuration: pageModel.overview,
          },
        ]}
      />
      {pageModel.sections.map((section) => (
        <HrTrainingListSection key={section.surfaceKey} section={section} />
      ))}
    </div>
  );
}

export const HrTalentTrainingSection = HrTrainingSection;

export function HrTrainingAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrTalentTrainingUiCopy.accessDenied.title}
      description={hrTalentTrainingUiCopy.accessDenied.description}
    />
  );
}

export const HrTalentTrainingAccessDeniedPanel =
  HrTrainingAccessDeniedPanel;
