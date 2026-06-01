import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  HrIndustryUcbPageModel,
  HrIndustryUcbPageModelListSection,
} from "../data/hr.industry.ucb.page-model.server";
import { hrIndustryUcbOverviewKpiSurfaceKey } from "../surface/hr.industry.ucb-surface-metadata.shared";
import { hrIndustryUcbUiCopy } from "../surface/hr.industry.ucb-ui.copy.shared";

const ucbForbiddenState = {
  variant: "forbidden" as const,
  title: hrIndustryUcbUiCopy.accessDenied.title,
  description: hrIndustryUcbUiCopy.accessDenied.description,
};

function HrIndustryUcbListSection({
  section,
}: {
  readonly section: HrIndustryUcbPageModelListSection;
}) {
  return (
    <GovernedPatternCListSection
      title={section.title}
      description={section.description}
      surfaceKey={section.surfaceKey}
      listConfiguration={section.listConfiguration}
      forbidden={ucbForbiddenState}
      layout="embedded"
    />
  );
}

export function HrIndustryUcbSection({
  pageModel,
}: {
  readonly pageModel: HrIndustryUcbPageModel;
}) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <GovernedPatternBStatSection
        title={hrIndustryUcbUiCopy.overview.sectionTitle}
        description={pageModel.description}
        surfaceKey={hrIndustryUcbOverviewKpiSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "ucb-overview",
            configuration: pageModel.overview,
          },
        ]}
      />
      {pageModel.sections.map((section) => (
        <HrIndustryUcbListSection key={section.surfaceKey} section={section} />
      ))}
    </div>
  );
}

export function HrIndustryUcbAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrIndustryUcbUiCopy.accessDenied.title}
      description={hrIndustryUcbUiCopy.accessDenied.description}
    />
  );
}
