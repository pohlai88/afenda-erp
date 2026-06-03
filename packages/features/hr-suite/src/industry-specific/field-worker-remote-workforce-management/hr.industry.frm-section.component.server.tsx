import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  HrIndustryFrmPageModel,
  HrIndustryFrmPageModelListSection,
} from "./hr.industry.frm.page-model.server";
import { hrIndustryFrmOverviewKpiSurfaceKey } from "./hr.industry.frm-surface-metadata.shared";
import { hrIndustryFrmUiCopy } from "./hr.industry.frm-ui.copy.shared";

const frmForbiddenState = {
  variant: "forbidden" as const,
  title: hrIndustryFrmUiCopy.accessDenied.title,
  description: hrIndustryFrmUiCopy.accessDenied.description,
};

function HrIndustryFrmListSection({
  section,
}: {
  readonly section: HrIndustryFrmPageModelListSection;
}) {
  return (
    <GovernedPatternCListSection
      title={section.title}
      description={section.description}
      surfaceKey={section.surfaceKey}
      listConfiguration={section.listConfiguration}
      forbidden={frmForbiddenState}
      layout="embedded"
    />
  );
}

export function HrIndustryFrmSection({
  pageModel,
}: {
  readonly pageModel: HrIndustryFrmPageModel;
}) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <GovernedPatternBStatSection
        title={hrIndustryFrmUiCopy.overview.sectionTitle}
        description={pageModel.description}
        surfaceKey={hrIndustryFrmOverviewKpiSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "frm-overview",
            configuration: pageModel.overview,
          },
        ]}
      />
      {pageModel.sections.map((section) => (
        <HrIndustryFrmListSection
          key={section.surfaceKey}
          section={section}
        />
      ))}
    </div>
  );
}

export function HrIndustryFrmAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrIndustryFrmUiCopy.accessDenied.title}
      description={hrIndustryFrmUiCopy.accessDenied.description}
    />
  );
}
