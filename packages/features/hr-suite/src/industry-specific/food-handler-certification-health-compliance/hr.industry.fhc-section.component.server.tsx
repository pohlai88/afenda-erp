import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  HrIndustryFhcPageModel,
  HrIndustryFhcPageModelListSection,
} from "./hr.industry.fhc.page-model.server";
import { hrIndustryFhcOverviewKpiSurfaceKey } from "./hr.industry.fhc-surface-metadata.shared";
import { hrIndustryFhcUiCopy } from "./hr.industry.fhc-ui.copy.shared";

const fhcForbiddenState = {
  variant: "forbidden" as const,
  title: hrIndustryFhcUiCopy.accessDenied.title,
  description: hrIndustryFhcUiCopy.accessDenied.description,
};

function HrIndustryFhcListSection({
  section,
}: {
  readonly section: HrIndustryFhcPageModelListSection;
}) {
  return (
    <GovernedPatternCListSection
      title={section.title}
      description={section.description}
      surfaceKey={section.surfaceKey}
      listConfiguration={section.listConfiguration}
      forbidden={fhcForbiddenState}
      layout="embedded"
    />
  );
}

export function HrIndustryFhcSection({
  pageModel,
}: {
  readonly pageModel: HrIndustryFhcPageModel;
}) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <GovernedPatternBStatSection
        title={hrIndustryFhcUiCopy.overview.sectionTitle}
        description={pageModel.description}
        surfaceKey={hrIndustryFhcOverviewKpiSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "fhc-overview",
            configuration: pageModel.overview,
          },
        ]}
      />
      {pageModel.sections.map((section) => (
        <HrIndustryFhcListSection
          key={section.surfaceKey}
          section={section}
        />
      ))}
    </div>
  );
}

export function HrIndustryFhcAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrIndustryFhcUiCopy.accessDenied.title}
      description={hrIndustryFhcUiCopy.accessDenied.description}
    />
  );
}
