import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";

import type {
  HrCsfAuditPageModel,
  HrCsfHubPageModel,
  HrCsfMatchingPageModel,
  HrCsfReportsPageModel,
} from "./hr.talent.csf.page-model.server";
import {
  hrCsfAuditSurfaceKey,
  hrCsfCompetenciesSurfaceKey,
  hrCsfGapsSurfaceKey,
  hrCsfMatchingSurfaceKey,
  hrCsfReportsSurfaceKey,
  hrCsfSkillsSurfaceKey,
} from "./hr.talent.csf-search-params.parse.shared";
import { hrCsfUiCopy } from "./hr.talent.csf-ui.copy.shared";
import { HrCsfMatchTargetForm } from "./hr.talent.csf-workflow-forms.component.client";
import { HrCsfSectionNav } from "./hr.talent.csf-nav.component.server";

const csfForbiddenState = {
  variant: "forbidden" as const,
  title: hrCsfUiCopy.accessDenied.title,
  description: hrCsfUiCopy.accessDenied.description,
};

function HrCsfListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: Parameters<typeof GovernedPatternCListSection>[0]["listConfiguration"];
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      forbidden={csfForbiddenState}
      layout="embedded"
    />
  );
}

export function HrCsfAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrCsfUiCopy.accessDenied.title}
      description={hrCsfUiCopy.accessDenied.description}
    />
  );
}

export function HrCsfHubSection({ pageModel }: { pageModel: HrCsfHubPageModel }) {
  const copy = hrCsfUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.page.title}
        description={copy.page.description}
      />
      <HrCsfSectionNav active="hub" />
      <SectionPanel
        headingLevel={2}
        title="Integration exposure"
        description="Downstream talent modules consume CSF gaps and readiness when authorized."
      >
        <ul className="flex flex-col gap-2 type-muted">
          <li>
            {copy.integration.trainingExposure}: {pageModel.integrationCounts.trainingGaps}
          </li>
          <li>
            {copy.integration.lmsRecommendations}: {pageModel.integrationCounts.lmsRecommendations}
          </li>
          <li>
            {copy.integration.performanceRefs}: {pageModel.integrationCounts.performanceRefs}
          </li>
          <li>
            {copy.integration.successionReadiness}: {pageModel.integrationCounts.successionIndicators}
          </li>
        </ul>
      </SectionPanel>
      <HrCsfListSection
        title={copy.competencies.surfaceHeaderTitle}
        description="Core, leadership, technical, and behavioral competencies (HRM-CSF-001)."
        surfaceKey={hrCsfCompetenciesSurfaceKey}
        listConfiguration={pageModel.competenciesList}
      />
      <HrCsfListSection
        title={copy.skills.surfaceHeaderTitle}
        description="Technical, soft, and functional skills library (HRM-CSF-002)."
        surfaceKey={hrCsfSkillsSurfaceKey}
        listConfiguration={pageModel.skillsList}
      />
      <HrCsfListSection
        title={copy.gaps.surfaceHeaderTitle}
        description="Required vs current proficiency with severity and development priority (HRM-CSF-018..022)."
        surfaceKey={hrCsfGapsSurfaceKey}
        listConfiguration={pageModel.gapsList}
      />
    </div>
  );
}

export function HrCsfReportsSection({ pageModel }: { pageModel: HrCsfReportsPageModel }) {
  const copy = hrCsfUiCopy.reports;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.pageTitle}
        description={copy.pageDescription}
      />
      <HrCsfSectionNav active="reports" />
      <HrCsfListSection
        title={copy.surfaceHeaderTitle}
        description={`Grouped by ${pageModel.reportGroupBy} (HRM-CSF-029 / AC 25).`}
        surfaceKey={hrCsfReportsSurfaceKey}
        listConfiguration={pageModel.reportsList}
      />
    </div>
  );
}

export function HrCsfAuditSection({ pageModel }: { pageModel: HrCsfAuditPageModel }) {
  const copy = hrCsfUiCopy.audit;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.pageTitle}
        description={copy.pageDescription}
      />
      <HrCsfSectionNav active="audit" />
      <HrCsfListSection
        title={copy.surfaceHeaderTitle}
        description="Every CSF setup, mapping, assessment, and integration action records an audit event (HRM-CSF-031 / AC 27)."
        surfaceKey={hrCsfAuditSurfaceKey}
        listConfiguration={pageModel.auditList}
      />
    </div>
  );
}

export function HrCsfMatchingSection({ pageModel }: { pageModel: HrCsfMatchingPageModel }) {
  const copy = hrCsfUiCopy.matching;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <SectionPanel
        headingLevel={1}
        title={copy.pageTitle}
        description={copy.pageDescription}
      />
      <HrCsfSectionNav active="matching" />
      <SectionPanel headingLevel={2} title="Match query" description="HRM-CSF-028 / AC 24.">
        <HrCsfMatchTargetForm
          targetKind={pageModel.targetKind}
          targetCode={pageModel.targetCode}
        />
      </SectionPanel>
      <HrCsfListSection
        title={copy.surfaceHeaderTitle}
        description={`Results for ${pageModel.targetKind} ${pageModel.targetCode}.`}
        surfaceKey={hrCsfMatchingSurfaceKey}
        listConfiguration={pageModel.matchingList}
      />
    </div>
  );
}
