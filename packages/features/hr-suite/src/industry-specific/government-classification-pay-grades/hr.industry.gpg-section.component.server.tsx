import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  HrIndustryGpgPageModel,
  HrIndustryGpgPageModelListSection,
} from "./hr.industry.gpg.page-model.server";
import { hrIndustryGpgOverviewKpiSurfaceKey } from "./hr.industry.gpg-surface-metadata.shared";
import { hrIndustryGpgUiCopy } from "./hr.industry.gpg-ui.copy.shared";

const gpgForbiddenState = {
  variant: "forbidden" as const,
  title: hrIndustryGpgUiCopy.accessDenied.title,
  description: hrIndustryGpgUiCopy.accessDenied.description,
};

function HrIndustryGpgListSection({
  section,
}: {
  readonly section: HrIndustryGpgPageModelListSection;
}) {
  return (
    <GovernedPatternCListSection
      title={section.title}
      description={section.description}
      surfaceKey={section.surfaceKey}
      listConfiguration={section.listConfiguration}
      forbidden={gpgForbiddenState}
      layout="embedded"
    />
  );
}

export function HrIndustryGpgSection({
  pageModel,
}: {
  readonly pageModel: HrIndustryGpgPageModel;
}) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <GovernedPatternBStatSection
        title={hrIndustryGpgUiCopy.overview.sectionTitle}
        description={pageModel.description}
        surfaceKey={hrIndustryGpgOverviewKpiSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "gpg-overview",
            configuration: pageModel.overview,
          },
        ]}
      />
      {pageModel.sections.map((section) => (
        <HrIndustryGpgListSection key={section.surfaceKey} section={section} />
      ))}
    </div>
  );
}

export function HrIndustryGpgAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrIndustryGpgUiCopy.accessDenied.title}
      description={hrIndustryGpgUiCopy.accessDenied.description}
    />
  );
}
