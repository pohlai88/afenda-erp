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

import type { HrGeoPageModel } from "../data/hr.time.geo.page-model.server";
import { HrGeoPendingExceptionsTrailingCell } from "./hr.time.geo-pending-trailing.component.client";
import { HrGeoRemoteCheckinCapturePanel } from "./hr.time.geo-remote-checkin.component.client";
import {
  hrGeoAuditTrailSurfaceKey,
  hrGeoDevicesSurfaceKey,
  hrGeoGeofencesSurfaceKey,
  hrGeoHistorySurfaceKey,
  hrGeoLamExposureSurfaceKey,
  hrGeoOvertimeRefSurfaceKey,
  hrGeoPayrollRefSurfaceKey,
  hrGeoPendingSurfaceKey,
  hrGeoPoliciesSurfaceKey,
  hrGeoRawVsApprovedSurfaceKey,
  hrGeoReportsSurfaceKey,
  hrGeoStatsSurfaceKey,
} from "../contracts/geolocation.contract";
import { hrGeoUiCopy } from "../surface/hr.time.geo-ui.copy.shared";

const geoForbiddenState = {
  variant: "forbidden" as const,
  title: hrGeoUiCopy.accessDenied.title,
  description: hrGeoUiCopy.accessDenied.description,
};

function HrGeoGovernedListSection({
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
      forbidden={geoForbiddenState}
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

export function HrGeoAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrGeoUiCopy.accessDenied.title}
      description={hrGeoUiCopy.accessDenied.description}
    />
  );
}

export function HrGeoWorkbenchSection({ model }: { model: HrGeoPageModel }) {
  return (
    <div className="@container flex flex-col gap-surface-lg">
      <GovernedPatternBStatSection
        title={hrGeoUiCopy.page.title}
        description={hrGeoUiCopy.page.description}
        surfaceKey={hrGeoStatsSurfaceKey}
        layout="embedded"
        statGroups={[{ groupKey: "overview", configuration: model.stats }]}
      />

      <SectionPanel
        headingLevel={3}
        title={hrGeoUiCopy.capture.sectionTitle}
        description={hrGeoUiCopy.capture.description}
      >
        <HrGeoRemoteCheckinCapturePanel />
      </SectionPanel>

      <HrGeoGovernedListSection
        title={hrGeoUiCopy.geofences.sectionTitle}
        description={hrGeoUiCopy.geofences.emptyDescription}
        surfaceKey={hrGeoGeofencesSurfaceKey}
        listConfiguration={model.geofences}
        loadError={model.geofencesLoadError}
      />
      <HrGeoGovernedListSection
        title={hrGeoUiCopy.policies.sectionTitle}
        description={hrGeoUiCopy.policies.emptyDescription}
        surfaceKey={hrGeoPoliciesSurfaceKey}
        listConfiguration={model.policies}
        loadError={model.policiesLoadError}
      />
      <HrGeoGovernedListSection
        title={hrGeoUiCopy.devices.sectionTitle}
        description={hrGeoUiCopy.devices.emptyDescription}
        surfaceKey={hrGeoDevicesSurfaceKey}
        listConfiguration={model.devices}
        loadError={model.devicesLoadError}
      />
      <HrGeoGovernedListSection
        title={hrGeoUiCopy.pending.sectionTitle}
        description={hrGeoUiCopy.pending.emptyDescription}
        surfaceKey={hrGeoPendingSurfaceKey}
        listConfiguration={model.pending}
        loadError={model.pendingLoadError}
        actionsHeader={hrGeoUiCopy.pending.colActions}
        TrailingCell={HrGeoPendingExceptionsTrailingCell}
      />
      <HrGeoGovernedListSection
        title={hrGeoUiCopy.history.sectionTitle}
        description={hrGeoUiCopy.history.emptyDescription}
        surfaceKey={hrGeoHistorySurfaceKey}
        listConfiguration={model.history}
        loadError={model.historyLoadError}
      />
      <HrGeoGovernedListSection
        title={hrGeoUiCopy.rawVsApproved.sectionTitle}
        description={hrGeoUiCopy.rawVsApproved.emptyDescription}
        surfaceKey={hrGeoRawVsApprovedSurfaceKey}
        listConfiguration={model.rawVsApproved}
        loadError={model.rawVsApprovedLoadError}
      />
      <HrGeoGovernedListSection
        title={hrGeoUiCopy.lamExposure.sectionTitle}
        description={hrGeoUiCopy.lamExposure.emptyDescription}
        surfaceKey={hrGeoLamExposureSurfaceKey}
        listConfiguration={model.lamExposure}
        loadError={model.lamExposureLoadError}
      />
      <HrGeoGovernedListSection
        title={hrGeoUiCopy.overtimeRef.sectionTitle}
        description={hrGeoUiCopy.overtimeRef.emptyDescription}
        surfaceKey={hrGeoOvertimeRefSurfaceKey}
        listConfiguration={model.overtimeRef}
        loadError={model.overtimeRefLoadError}
      />
      <HrGeoGovernedListSection
        title={hrGeoUiCopy.payrollRef.sectionTitle}
        description={hrGeoUiCopy.payrollRef.emptyDescription}
        surfaceKey={hrGeoPayrollRefSurfaceKey}
        listConfiguration={model.payrollRef}
        loadError={model.payrollRefLoadError}
      />
      <HrGeoGovernedListSection
        title={hrGeoUiCopy.reports.sectionTitle}
        description={hrGeoUiCopy.reports.emptyDescription}
        surfaceKey={hrGeoReportsSurfaceKey}
        listConfiguration={model.reports}
        loadError={model.reportsLoadError}
      />
      {model.canReadAudit ? (
        <HrGeoGovernedListSection
          title={hrGeoUiCopy.auditTrail.sectionTitle}
          description={hrGeoUiCopy.auditTrail.emptyDescription}
          surfaceKey={hrGeoAuditTrailSurfaceKey}
          listConfiguration={model.auditTrail}
          loadError={model.auditTrailLoadError}
        />
      ) : null}
    </div>
  );
}
