import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  HrIndustryRwsPageModel,
  HrIndustryRwsPageModelListSection,
} from "./hr.industry.rws.page-model.server";
import { hrIndustryRwsOverviewKpiSurfaceKey } from "./hr.industry.rws-surface-metadata.shared";
import { hrIndustryRwsUiCopy } from "./hr.industry.rws-ui.copy.shared";

const rwsForbiddenState = {
  variant: "forbidden" as const,
  title: hrIndustryRwsUiCopy.accessDenied.title,
  description: hrIndustryRwsUiCopy.accessDenied.description,
};

function HrIndustryRwsListSection({
  section,
}: {
  readonly section: HrIndustryRwsPageModelListSection;
}) {
  return (
    <GovernedPatternCListSection
      title={section.title}
      description={section.description}
      surfaceKey={section.surfaceKey}
      listConfiguration={section.listConfiguration}
      forbidden={rwsForbiddenState}
      layout="embedded"
    />
  );
}

export function HrIndustryRwsSection({
  pageModel,
}: {
  readonly pageModel: HrIndustryRwsPageModel;
}) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <GovernedPatternBStatSection
        title={hrIndustryRwsUiCopy.overview.sectionTitle}
        description={pageModel.description}
        surfaceKey={hrIndustryRwsOverviewKpiSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "rws-overview",
            configuration: pageModel.overview,
          },
        ]}
      />
      {pageModel.sections.map((section) => (
        <HrIndustryRwsListSection key={section.surfaceKey} section={section} />
      ))}
    </div>
  );
}

export function HrIndustryRwsAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrIndustryRwsUiCopy.accessDenied.title}
      description={hrIndustryRwsUiCopy.accessDenied.description}
    />
  );
}
