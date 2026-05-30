import {
  GovernedPatternCListSection,
} from "@afenda/governed-surface/server";
import type { EmptyState, ListSurfaceRendererConfigurationInput } from "@afenda/governed-surface/schemas";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";

import type { HrLamPageModel } from "../data/hr.time.lam.page-model.server";
import { hrLamAttendanceDaysSurfaceKey } from "../surface/hr.time.lam-attendance-days-list.surface";
import { hrLamAuditTrailSurfaceKey } from "../surface/hr.time.attendance.lam-audit-trail-list.surface";
import { hrLamCorrectionsSurfaceKey } from "../surface/hr.time.attendance.lam-corrections-list.surface";
import { hrLamExceptionsSurfaceKey } from "../surface/hr.time.attendance.lam-exceptions-list.surface";
import { hrLamLeaveBalancesSurfaceKey } from "../surface/hr.time.lam-leave-balances-list.surface";
import { hrLamLeaveRequestsSurfaceKey } from "../surface/hr.time.lam-leave-requests-list.surface";
import { hrLamPayrollRefsSurfaceKey } from "../surface/hr.time.attendance.lam-payroll-refs-list.surface";
import { hrLamReportsSurfaceKey } from "../surface/hr.time.attendance.lam-reports-list.surface";
import { hrLamUiCopy } from "../surface/hr.time.lam-ui.copy.shared";

const lamForbiddenState = {
  variant: "forbidden" as const,
  title: hrLamUiCopy.accessDenied.title,
  description: hrLamUiCopy.accessDenied.description,
};

function HrLamGovernedListSection({
  title,
  description,
  surfaceKey,
  listConfiguration,
  loadError,
}: {
  title: string;
  description: string;
  surfaceKey: string;
  listConfiguration?: ListSurfaceRendererConfigurationInput;
  loadError?: EmptyState;
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
      forbidden={lamForbiddenState}
    />
  );
}

export function HrLamAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrLamUiCopy.accessDenied.title}
      description={hrLamUiCopy.accessDenied.description}
    />
  );
}

export function HrLamWorkbenchSection({ model }: { model: HrLamPageModel }) {
  return (
    <div className="@container flex flex-col gap-6">
      <HrLamGovernedListSection
        title={hrLamUiCopy.attendanceDays.sectionTitle}
        description={hrLamUiCopy.attendanceDays.emptyDescription}
        surfaceKey={hrLamAttendanceDaysSurfaceKey}
        listConfiguration={model.attendanceDays}
        loadError={model.attendanceDaysLoadError}
      />
      <HrLamGovernedListSection
        title={hrLamUiCopy.leaveRequests.sectionTitle}
        description={hrLamUiCopy.leaveRequests.emptyDescription}
        surfaceKey={hrLamLeaveRequestsSurfaceKey}
        listConfiguration={model.leaveRequests}
        loadError={model.leaveRequestsLoadError}
      />
      <HrLamGovernedListSection
        title={hrLamUiCopy.leaveBalances.sectionTitle}
        description={hrLamUiCopy.leaveBalances.emptyDescription}
        surfaceKey={hrLamLeaveBalancesSurfaceKey}
        listConfiguration={model.leaveBalances}
        loadError={model.leaveBalancesLoadError}
      />
      <HrLamGovernedListSection
        title={hrLamUiCopy.exceptions.sectionTitle}
        description={hrLamUiCopy.exceptions.emptyDescription}
        surfaceKey={hrLamExceptionsSurfaceKey}
        listConfiguration={model.exceptions}
        loadError={model.exceptionsLoadError}
      />
      <HrLamGovernedListSection
        title={hrLamUiCopy.corrections.sectionTitle}
        description={hrLamUiCopy.corrections.emptyDescription}
        surfaceKey={hrLamCorrectionsSurfaceKey}
        listConfiguration={model.corrections}
        loadError={model.correctionsLoadError}
      />
      <HrLamGovernedListSection
        title={hrLamUiCopy.payrollRefs.sectionTitle}
        description={hrLamUiCopy.payrollRefs.emptyDescription}
        surfaceKey={hrLamPayrollRefsSurfaceKey}
        listConfiguration={model.payrollRefs}
        loadError={model.payrollRefsLoadError}
      />
      <HrLamGovernedListSection
        title={hrLamUiCopy.reports.sectionTitle}
        description={hrLamUiCopy.reports.emptyDescription}
        surfaceKey={hrLamReportsSurfaceKey}
        listConfiguration={model.reports}
        loadError={model.reportsLoadError}
      />
      <HrLamGovernedListSection
        title={hrLamUiCopy.audit.sectionTitle}
        description={hrLamUiCopy.audit.emptyDescription}
        surfaceKey={hrLamAuditTrailSurfaceKey}
        listConfiguration={model.auditTrail}
        loadError={model.auditTrailLoadError}
      />
    </div>
  );
}

export function HrLeaveWorkbenchSection({ model }: { model: HrLamPageModel }) {
  return (
    <div className="@container flex flex-col gap-6">
      <HrLamGovernedListSection
        title={hrLamUiCopy.leaveRequests.sectionTitle}
        description={hrLamUiCopy.leaveRequests.emptyDescription}
        surfaceKey={hrLamLeaveRequestsSurfaceKey}
        listConfiguration={model.leaveRequests}
        loadError={model.leaveRequestsLoadError}
      />
      <HrLamGovernedListSection
        title={hrLamUiCopy.leaveBalances.sectionTitle}
        description={hrLamUiCopy.leaveBalances.emptyDescription}
        surfaceKey={hrLamLeaveBalancesSurfaceKey}
        listConfiguration={model.leaveBalances}
        loadError={model.leaveBalancesLoadError}
      />
    </div>
  );
}

export function HrAttendanceWorkbenchSection({
  model,
}: {
  model: HrLamPageModel;
}) {
  return (
    <HrLamGovernedListSection
      title={hrLamUiCopy.attendanceDays.sectionTitle}
      description={hrLamUiCopy.attendanceDays.emptyDescription}
      surfaceKey={hrLamAttendanceDaysSurfaceKey}
      listConfiguration={model.attendanceDays}
      loadError={model.attendanceDaysLoadError}
    />
  );
}
