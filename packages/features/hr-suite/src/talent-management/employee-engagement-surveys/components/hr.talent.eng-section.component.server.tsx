import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  HrTalentEngPageModel,
  HrTalentEngPageModelListSection,
} from "../data/hr.talent.eng.page-model.server";
import { hrTalentEngOverviewKpiSurfaceKey } from "../surface/hr.talent.eng-surface-metadata.shared";
import { hrTalentEngUiCopy } from "../surface/hr.talent.eng-ui.copy.shared";

const forbiddenState = {
  variant: "forbidden" as const,
  title: hrTalentEngUiCopy.accessDenied.title,
  description: hrTalentEngUiCopy.accessDenied.description,
};

function HrTalentEngListSection({
  section,
}: {
  readonly section: HrTalentEngPageModelListSection;
}) {
  return (
    <GovernedPatternCListSection
      title={section.title}
      description={section.description}
      surfaceKey={section.surfaceKey}
      listConfiguration={section.listConfiguration}
      forbidden={forbiddenState}
      layout="embedded"
    />
  );
}

export function HrTalentEngSection({
  pageModel,
}: {
  readonly pageModel: HrTalentEngPageModel;
}) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <GovernedPatternBStatSection
        title={hrTalentEngUiCopy.overview.sectionTitle}
        description={pageModel.description}
        surfaceKey={hrTalentEngOverviewKpiSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "eng-overview",
            configuration: pageModel.overview,
          },
        ]}
      />
      {pageModel.sections.map((section) => (
        <HrTalentEngListSection
          key={section.surfaceKey}
          section={section}
        />
      ))}
    </div>
  );
}

export function HrTalentEngAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrTalentEngUiCopy.accessDenied.title}
      description={hrTalentEngUiCopy.accessDenied.description}
    />
  );
}
