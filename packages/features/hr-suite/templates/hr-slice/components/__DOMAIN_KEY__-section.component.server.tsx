import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  __IDENTIFIER__PageModel,
  __IDENTIFIER__PageModelListSection,
} from "./__DOMAIN_KEY__.page-model.server";
import { __IDENTIFIER_CAMEL__OverviewKpiSurfaceKey } from "../surface/__DOMAIN_KEY__-surface-metadata.shared";
import { __IDENTIFIER_CAMEL__UiCopy } from "../surface/__DOMAIN_KEY__-ui.copy.shared";

const forbiddenState = {
  variant: "forbidden" as const,
  title: __IDENTIFIER_CAMEL__UiCopy.accessDenied.title,
  description: __IDENTIFIER_CAMEL__UiCopy.accessDenied.description,
};

function __IDENTIFIER__ListSection({
  section,
}: {
  readonly section: __IDENTIFIER__PageModelListSection;
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

export function __IDENTIFIER__Section({
  pageModel,
}: {
  readonly pageModel: __IDENTIFIER__PageModel;
}) {
  return (
    <div className="@container flex flex-col gap-surface-2xl">
      <GovernedPatternBStatSection
        title={__IDENTIFIER_CAMEL__UiCopy.overview.sectionTitle}
        description={pageModel.description}
        surfaceKey={__IDENTIFIER_CAMEL__OverviewKpiSurfaceKey}
        layout="embedded"
        statGroups={[
          {
            groupKey: "__DOMAIN_LAST__-overview",
            configuration: pageModel.overview,
          },
        ]}
      />
      {pageModel.sections.map((section) => (
        <__IDENTIFIER__ListSection
          key={section.surfaceKey}
          section={section}
        />
      ))}
    </div>
  );
}

export function __IDENTIFIER__AccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={__IDENTIFIER_CAMEL__UiCopy.accessDenied.title}
      description={__IDENTIFIER_CAMEL__UiCopy.accessDenied.description}
    />
  );
}
