import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  HrWorkforceEssPageModel,
  HrWorkforceEssPageModelListSection,
} from "./hr.workforce.ess.page-model.server";
import { hrWorkforceEssOverviewKpiSurfaceKey } from "./hr.workforce.ess-surface-metadata.shared";
import { hrWorkforceEssUiCopy } from "./hr.workforce.ess-ui.copy.shared";

const forbiddenState = {
  variant: "forbidden" as const,
  title: hrWorkforceEssUiCopy.accessDenied.title,
  description: hrWorkforceEssUiCopy.accessDenied.description,
};

function HrWorkforceEssListSection({
  section,
}: {
  readonly section: HrWorkforceEssPageModelListSection;
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

export function HrWorkforceEssSection({
  pageModel,
}: {
  readonly pageModel: HrWorkforceEssPageModel;
}) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <GovernedPatternBStatSection
        title={hrWorkforceEssUiCopy.overview.sectionTitle}
        description={pageModel.description}
        surfaceKey={hrWorkforceEssOverviewKpiSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "ess-overview",
            configuration: pageModel.overview,
          },
        ]}
      />
      {pageModel.sections.map((section) => (
        <HrWorkforceEssListSection
          key={section.surfaceKey}
          section={section}
        />
      ))}
    </div>
  );
}

export function HrWorkforceEssAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrWorkforceEssUiCopy.accessDenied.title}
      description={hrWorkforceEssUiCopy.accessDenied.description}
    />
  );
}
