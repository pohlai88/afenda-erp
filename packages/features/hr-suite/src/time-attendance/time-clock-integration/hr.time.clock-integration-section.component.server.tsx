import type { ComponentType } from "react";

import {
  GovernedPatternBStatSection,
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client";
import type {
  EmptyState,
  ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface/schemas";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";

import type { HrTimeClockPageModel } from "./hr.time.clock-integration.page-model.server";
import { HrTimeClockFormsPanel } from "./hr.time.clock-integration-forms.component.client";
import { HrTimeClockListTrailingCell } from "./hr.time.clock-integration-list-trailing.component.client";
import { HrTimeClockReportsExportPanel } from "./hr.time.clock-integration-reports.component.client";
import {
  hrTimeClockAuditTrailSurfaceKey,
  hrTimeClockDevicesSurfaceKey,
  hrTimeClockEmployeeMappingsSurfaceKey,
  hrTimeClockLamExportSurfaceKey,
  hrTimeClockOvertimeRefsSurfaceKey,
  hrTimeClockPayrollRefsSurfaceKey,
  hrTimeClockPunchExceptionsSurfaceKey,
  hrTimeClockRawPunchesSurfaceKey,
  hrTimeClockReportsSurfaceKey,
  hrTimeClockSyncBatchesSurfaceKey,
} from "./hr.time.clock-integration-surface-metadata.shared";
import { hrTimeClockOverviewStatSurfaceKey } from "./hr.time.clock-integration-overview-stat.surface";
import { hrTimeClockUiCopy } from "./hr.time.clock-integration-ui.copy.shared";

const forbiddenState = {
  variant: "forbidden" as const,
  title: hrTimeClockUiCopy.accessDenied.title,
  description: hrTimeClockUiCopy.accessDenied.description,
};

function HrTimeClockGovernedListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
  loadError,
  actionsHeader,
  TrailingCell,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration?: ListSurfaceRendererConfigurationInput;
  loadError?: EmptyState;
  actionsHeader?: string;
  TrailingCell?: ComponentType<GovernedListTrailingCellProps>;
}) {
  if (!listConfiguration) {
    return (
      <SectionPanel headingLevel={3} title={title} description={description}>
        <Alert variant="destructive">
          <AlertTitle>{loadError?.title ?? "Unavailable"}</AlertTitle>
          <AlertDescription>
            {loadError?.description ?? "Could not load this section."}
          </AlertDescription>
        </Alert>
      </SectionPanel>
    );
  }

  return (
    <GovernedPatternCListSection
      title={title}
      description={description}
      surfaceKey={surfaceKey}
      listConfiguration={listConfiguration}
      loadError={loadError}
      parentAccessAllowed
      layout="embedded"
      forbidden={forbiddenState}
      trailingColumn={
        TrailingCell && actionsHeader
          ? {
              header: actionsHeader,
              Cell: TrailingCell,
              context: { surfaceKey },
            }
          : undefined
      }
    />
  );
}

export function HrTimeClockAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrTimeClockUiCopy.accessDenied.title}
      description={hrTimeClockUiCopy.accessDenied.description}
    />
  );
}

export function HrTimeClockWorkbenchSection({
  model,
}: {
  model: HrTimeClockPageModel;
}) {
  const copy = hrTimeClockUiCopy;

  return (
    <div className="@container flex flex-col gap-surface-lg">
      <GovernedPatternBStatSection
        title={copy.page.title}
        description={copy.page.description}
        surfaceKey={hrTimeClockOverviewStatSurfaceKey}
        layout="embedded"
        statGroups={[{ groupKey: "overview", configuration: model.overviewStats }]}
        loadError={model.overviewLoadError}
      />

      {model.syncAlertCount > 0 ? (
        <Alert variant="destructive">
          <AlertTitle>Sync failures detected</AlertTitle>
          <AlertDescription>
            {model.syncAlertCount} failed sync batch
            {model.syncAlertCount === 1 ? "" : "es"} require administrator review
            (HRM-TCI-026).
          </AlertDescription>
        </Alert>
      ) : null}

      {model.canAdmin ? <HrTimeClockFormsPanel canAdmin={model.canAdmin} /> : null}

      <HrTimeClockGovernedListSection
        title={copy.devices.sectionTitle}
        description={copy.devices.emptyDescription}
        surfaceKey={hrTimeClockDevicesSurfaceKey}
        listConfiguration={model.devicesList}
        loadError={model.devicesLoadError}
        actionsHeader={copy.devices.colActions}
        TrailingCell={HrTimeClockListTrailingCell}
      />
      <HrTimeClockGovernedListSection
        title={copy.mappings.sectionTitle}
        description={copy.mappings.emptyDescription}
        surfaceKey={hrTimeClockEmployeeMappingsSurfaceKey}
        listConfiguration={model.mappingsList}
        loadError={model.mappingsLoadError}
        actionsHeader={copy.mappings.colActions}
        TrailingCell={HrTimeClockListTrailingCell}
      />
      <HrTimeClockGovernedListSection
        title={copy.rawPunches.sectionTitle}
        description={copy.rawPunches.emptyDescription}
        surfaceKey={hrTimeClockRawPunchesSurfaceKey}
        listConfiguration={model.rawPunchesList}
        loadError={model.rawPunchesLoadError}
      />
      <HrTimeClockGovernedListSection
        title={copy.exceptions.sectionTitle}
        description={copy.exceptions.emptyDescription}
        surfaceKey={hrTimeClockPunchExceptionsSurfaceKey}
        listConfiguration={model.punchExceptionsList}
        loadError={model.punchExceptionsLoadError}
        actionsHeader={copy.exceptions.colActions}
        TrailingCell={HrTimeClockListTrailingCell}
      />
      <HrTimeClockGovernedListSection
        title={copy.syncBatches.sectionTitle}
        description={copy.syncBatches.emptyDescription}
        surfaceKey={hrTimeClockSyncBatchesSurfaceKey}
        listConfiguration={model.syncBatchesList}
        loadError={model.syncBatchesLoadError}
      />
      <HrTimeClockGovernedListSection
        title={copy.lamExport.sectionTitle}
        description={copy.lamExport.emptyDescription}
        surfaceKey={hrTimeClockLamExportSurfaceKey}
        listConfiguration={model.lamExportList}
        loadError={model.lamExportLoadError}
      />
      <HrTimeClockGovernedListSection
        title={copy.overtimeRefs.sectionTitle}
        description={copy.overtimeRefs.emptyDescription}
        surfaceKey={hrTimeClockOvertimeRefsSurfaceKey}
        listConfiguration={model.overtimeRefsList}
        loadError={model.overtimeRefsLoadError}
      />
      <HrTimeClockGovernedListSection
        title={copy.payrollRefs.sectionTitle}
        description={copy.payrollRefs.emptyDescription}
        surfaceKey={hrTimeClockPayrollRefsSurfaceKey}
        listConfiguration={model.payrollRefsList}
        loadError={model.payrollRefsLoadError}
      />

      <SectionPanel
        headingLevel={3}
        title={copy.reports.sectionTitle}
        description={copy.reports.emptyDescription}
      >
        <HrTimeClockReportsExportPanel />
      </SectionPanel>

      <HrTimeClockGovernedListSection
        title={copy.reports.sectionTitle}
        description={copy.reports.emptyDescription}
        surfaceKey={hrTimeClockReportsSurfaceKey}
        listConfiguration={model.reportsList}
        loadError={model.reportsLoadError}
      />

      {model.auditTrailList ? (
        <HrTimeClockGovernedListSection
          title={copy.auditTrail.sectionTitle}
          description={copy.auditTrail.emptyDescription}
          surfaceKey={hrTimeClockAuditTrailSurfaceKey}
          listConfiguration={model.auditTrailList}
          loadError={model.auditTrailLoadError}
        />
      ) : null}
    </div>
  );
}
