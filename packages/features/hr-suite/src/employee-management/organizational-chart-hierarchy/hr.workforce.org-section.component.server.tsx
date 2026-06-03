import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import type { EmptyState } from "@afenda/governed-surface/schemas";
import { SectionPanel } from "@afenda/ui";

import type { HrOrgPageModel } from "./hr.workforce.org.page-model.server";
import {
  hrOrgUnitsSurfaceKey,
  hrOrgPositionsSurfaceKey,
  hrOrgReportingLinesSurfaceKey,
  hrOrgVacanciesSurfaceKey,
  hrOrgHeadcountSurfaceKey,
  hrOrgAuditTrailSurfaceKey,
} from "./hr.workforce.org-search-params.parse.shared";
import { hrOrgOverviewStatSurfaceKey } from "./hr.workforce.org-overview-stat.surface";
import { hrOrgUiCopy } from "./hr.workforce.org-ui.copy.shared";
import { HrOrgChartTreePanel } from "./hr.workforce.org-chart.component.client";
import {
  HrOrgUnitForm,
  HrOrgPositionForm,
  HrOrgReportingLineForm,
} from "./hr.workforce.org-forms.component.client";

const orgForbiddenState = {
  variant: "forbidden" as const,
  title: hrOrgUiCopy.accessDenied.title,
  description: hrOrgUiCopy.accessDenied.description,
};

function HrOrgReadOnlyListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
  loadError,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration: HrOrgPageModel["unitsList"];
  loadError?: EmptyState;
}) {
  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      loadError={loadError}
      parentAccessAllowed
      layout="embedded"
      forbidden={orgForbiddenState}
    />
  );
}

export function HrOrgAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={1}
      title={hrOrgUiCopy.accessDenied.title}
      description={hrOrgUiCopy.accessDenied.description}
    />
  );
}

export function HrOrgWorkbenchSection({ model }: { model: HrOrgPageModel }) {
  return (
    <div className="flex flex-col gap-surface-lg">
      <GovernedPatternBStatSection
        title={hrOrgUiCopy.page.title}
        description={hrOrgUiCopy.page.description}
        surfaceKey={hrOrgOverviewStatSurfaceKey}
        statGroups={model.overviewStatGroups}
        forbidden={orgForbiddenState}
      />

      <HrOrgChartTreePanel nodes={model.orgChartNodes} />

      {model.canWrite ? (
        <div className="@container grid gap-surface-md @xl:grid-cols-3">
          <HrOrgUnitForm
            orgUnitOptions={model.orgUnitPickerOptions}
            employeeOptions={model.employeePickerOptions}
          />
          <HrOrgPositionForm
            orgUnitOptions={model.orgUnitPickerOptions}
            employeeOptions={model.employeePickerOptions}
          />
          <HrOrgReportingLineForm
            employeeOptions={model.employeePickerOptions}
          />
        </div>
      ) : null}

      <HrOrgReadOnlyListSection
        title={hrOrgUiCopy.units.surfaceHeaderTitle}
        description={hrOrgUiCopy.units.emptyDescription}
        surfaceKey={hrOrgUnitsSurfaceKey}
        listConfiguration={model.unitsList}
        loadError={model.unitsLoadError}
      />

      <HrOrgReadOnlyListSection
        title={hrOrgUiCopy.positions.surfaceHeaderTitle}
        description={hrOrgUiCopy.positions.emptyDescription}
        surfaceKey={hrOrgPositionsSurfaceKey}
        listConfiguration={model.positionsList}
        loadError={model.positionsLoadError}
      />

      <HrOrgReadOnlyListSection
        title={hrOrgUiCopy.reportingLines.surfaceHeaderTitle}
        description={hrOrgUiCopy.reportingLines.emptyDescription}
        surfaceKey={hrOrgReportingLinesSurfaceKey}
        listConfiguration={model.reportingLinesList}
        loadError={model.reportingLinesLoadError}
      />

      <HrOrgReadOnlyListSection
        title={hrOrgUiCopy.vacancies.surfaceHeaderTitle}
        description={hrOrgUiCopy.vacancies.emptyDescription}
        surfaceKey={hrOrgVacanciesSurfaceKey}
        listConfiguration={model.vacanciesList}
        loadError={model.vacanciesLoadError}
      />

      <HrOrgReadOnlyListSection
        title={hrOrgUiCopy.headcount.surfaceHeaderTitle}
        description={hrOrgUiCopy.headcount.emptyDescription}
        surfaceKey={hrOrgHeadcountSurfaceKey}
        listConfiguration={model.headcountList}
        loadError={model.headcountLoadError}
      />

      <HrOrgReadOnlyListSection
        title={hrOrgUiCopy.auditTrail.surfaceHeaderTitle}
        description={hrOrgUiCopy.auditTrail.emptyDescription}
        surfaceKey={hrOrgAuditTrailSurfaceKey}
        listConfiguration={model.auditTrailList}
        loadError={model.auditTrailLoadError}
      />
    </div>
  );
}
