import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  HrIndustryMscPageModel,
  HrIndustryMscPageModelListSection,
} from "./hr.industry.msc.page-model.server";
import { hrIndustryMscOverviewKpiSurfaceKey } from "./hr.industry.msc-surface-metadata.shared";
import { hrIndustryMscUiCopy } from "./hr.industry.msc-ui.copy.shared";

const mscForbiddenState = {
  variant: "forbidden" as const,
  title: hrIndustryMscUiCopy.accessDenied.title,
  description: hrIndustryMscUiCopy.accessDenied.description,
};

function HrIndustryMscListSection({
  section,
}: {
  readonly section: HrIndustryMscPageModelListSection;
}) {
  return (
    <GovernedPatternCListSection
      title={section.title}
      description={section.description}
      surfaceKey={section.surfaceKey}
      listConfiguration={section.listConfiguration}
      forbidden={mscForbiddenState}
      layout="embedded"
    />
  );
}

export function HrIndustryMscSection({
  pageModel,
}: {
  readonly pageModel: HrIndustryMscPageModel;
}) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <GovernedPatternBStatSection
        title={hrIndustryMscUiCopy.overview.sectionTitle}
        description={pageModel.description}
        surfaceKey={hrIndustryMscOverviewKpiSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "msc-overview",
            configuration: pageModel.overview,
          },
        ]}
      />
      {pageModel.sections.map((section) => (
        <HrIndustryMscListSection key={section.surfaceKey} section={section} />
      ))}
    </div>
  );
}

export function HrIndustryMscAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrIndustryMscUiCopy.accessDenied.title}
      description={hrIndustryMscUiCopy.accessDenied.description}
    />
  );
}
