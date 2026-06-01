import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  HrTalentRssPageModel,
  HrTalentRssPageModelListSection,
} from "../data/hr.talent.rss.page-model.server";
import { hrTalentRssOverviewKpiSurfaceKey } from "../surface/hr.talent.rss-surface-metadata.shared";
import { hrTalentRssUiCopy } from "../surface/hr.talent.rss-ui.copy.shared";

const forbiddenState = {
  variant: "forbidden" as const,
  title: hrTalentRssUiCopy.accessDenied.title,
  description: hrTalentRssUiCopy.accessDenied.description,
};

function HrTalentRssListSection({
  section,
}: {
  readonly section: HrTalentRssPageModelListSection;
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

export function HrTalentRssSection({
  pageModel,
}: {
  readonly pageModel: HrTalentRssPageModel;
}) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <GovernedPatternBStatSection
        title={hrTalentRssUiCopy.overview.sectionTitle}
        description={pageModel.description}
        surfaceKey={hrTalentRssOverviewKpiSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "rss-overview",
            configuration: pageModel.overview,
          },
        ]}
      />
      {pageModel.sections.map((section) => (
        <HrTalentRssListSection
          key={section.surfaceKey}
          section={section}
        />
      ))}
    </div>
  );
}

export function HrTalentRssAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrTalentRssUiCopy.accessDenied.title}
      description={hrTalentRssUiCopy.accessDenied.description}
    />
  );
}
