import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import type {
  EmptyState,
  ListSurfaceRendererConfigurationInput,
} from "@afenda/governed-surface/schemas";
import { Alert, AlertDescription, AlertTitle } from "@afenda/ui/alert";
import { SectionPanel } from "@afenda/ui";

import type {
  HrSftPageModel,
  HrSftSelfServicePageModel,
} from "./hr.time.sft.page-model.server";
import { hrSftUiCopy } from "./hr.time.sft-ui.copy.shared";
import { hrSftAttendanceReconcileSurfaceKey } from "./hr.time.sft-attendance-reconcile-list.surface";
import { hrSftAuditTrailSurfaceKey } from "./hr.time.sft-audit-trail-list.surface";
import { hrTimeSftAvailabilitySurfaceKey } from "./hr.time.sft-availability-list.surface";
import { hrTimeSftCoverageSurfaceKey } from "./hr.time.sft-coverage-list.surface";
import { hrTimeSftMyScheduleChangesSurfaceKey } from "./hr.time.sft-my-schedule-changes-list.surface";
import { hrTimeSftMySwapsSurfaceKey } from "./hr.time.sft-my-swaps-list.surface";
import { hrSftNotificationsSurfaceKey } from "./hr.time.sft-notifications-list.surface";
import { hrSftPayrollRefsSurfaceKey } from "./hr.time.sft-payroll-refs-list.surface";
import { hrSftPublicationsSurfaceKey } from "./hr.time.sft-publications-list.surface";
import { hrTimeSftRecurrenceRulesSurfaceKey } from "./hr.time.sft-recurrence-rules-list.surface";
import { hrSftReportDefinitionsSurfaceKey } from "./hr.time.sft-report-definitions-list.surface";
import { hrTimeSftRosterSurfaceKey } from "./hr.time.sft-roster-list.surface";
import { hrTimeSftScheduleChangePendingSurfaceKey } from "./hr.time.sft-schedule-change-pending-list.surface";
import { hrTimeSftSwapPendingSurfaceKey } from "./hr.time.sft-swap-pending-list.surface";
import { hrTimeSftTemplatesSurfaceKey } from "./hr.time.sft-templates-list.surface";

const sftForbiddenState = {
  variant: "forbidden" as const,
  title: hrSftUiCopy.accessDenied.title,
  description: hrSftUiCopy.accessDenied.description,
};

function HrSftGovernedListSection({
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
      forbidden={sftForbiddenState}
    />
  );
}

export function HrSftAccessDeniedPanel() {
  return (
    <SectionPanel
      headingLevel={2}
      title={hrSftUiCopy.accessDenied.title}
      description={hrSftUiCopy.accessDenied.description}
    />
  );
}

/** Self-service lane — linked employee without org planner scope (HRM-SFT-019). */
export function HrSftMySwapsSection({
  model,
}: {
  model: HrSftSelfServicePageModel;
}) {
  return (
    <div className="@container flex flex-col gap-surface-lg">
      <HrSftGovernedListSection
        title={hrSftUiCopy.mySwaps.sectionTitle}
        description={hrSftUiCopy.mySwaps.emptyDescription}
        surfaceKey={hrTimeSftMySwapsSurfaceKey}
        listConfiguration={model.mySwaps}
        loadError={model.mySwapsLoadError}
      />
    </div>
  );
}

/** Shift Scheduling org workbench — architecture surfaces + integration slice. */
export function HrSftWorkbenchSection({ model }: { model: HrSftPageModel }) {
  return (
    <div className="@container flex flex-col gap-surface-lg">
      <HrSftGovernedListSection
        title={hrSftUiCopy.templates.sectionTitle}
        description={hrSftUiCopy.templates.emptyDescription}
        surfaceKey={hrTimeSftTemplatesSurfaceKey}
        listConfiguration={model.templates}
        loadError={model.templatesLoadError}
      />

      <HrSftGovernedListSection
        title={hrSftUiCopy.roster.sectionTitle}
        description={hrSftUiCopy.roster.emptyDescription}
        surfaceKey={hrTimeSftRosterSurfaceKey}
        listConfiguration={model.roster}
        loadError={model.rosterLoadError}
      />

      <HrSftGovernedListSection
        title={hrSftUiCopy.recurrenceRules.sectionTitle}
        description={hrSftUiCopy.recurrenceRules.emptyDescription}
        surfaceKey={hrTimeSftRecurrenceRulesSurfaceKey}
        listConfiguration={model.recurrenceRules}
        loadError={model.recurrenceRulesLoadError}
      />

      <HrSftGovernedListSection
        title={hrSftUiCopy.coverage.sectionTitle}
        description={hrSftUiCopy.coverage.emptyDescription}
        surfaceKey={hrTimeSftCoverageSurfaceKey}
        listConfiguration={model.coverage}
        loadError={model.coverageLoadError}
      />

      <HrSftGovernedListSection
        title={hrSftUiCopy.availability.sectionTitle}
        description={hrSftUiCopy.availability.emptyDescription}
        surfaceKey={hrTimeSftAvailabilitySurfaceKey}
        listConfiguration={model.availability}
        loadError={model.availabilityLoadError}
      />

      {model.canApprove ? (
        <>
          <HrSftGovernedListSection
            title={hrSftUiCopy.swapPending.sectionTitle}
            description={hrSftUiCopy.swapPending.emptyDescription}
            surfaceKey={hrTimeSftSwapPendingSurfaceKey}
            listConfiguration={model.swapPending}
            loadError={model.swapPendingLoadError}
          />

          <HrSftGovernedListSection
            title={hrSftUiCopy.scheduleChangePending.sectionTitle}
            description={hrSftUiCopy.scheduleChangePending.emptyDescription}
            surfaceKey={hrTimeSftScheduleChangePendingSurfaceKey}
            listConfiguration={model.scheduleChangePending}
            loadError={model.scheduleChangePendingLoadError}
          />
        </>
      ) : null}

      {model.mySwaps ? (
        <HrSftGovernedListSection
          title={hrSftUiCopy.mySwaps.sectionTitle}
          description={hrSftUiCopy.mySwaps.emptyDescription}
          surfaceKey={hrTimeSftMySwapsSurfaceKey}
          listConfiguration={model.mySwaps}
          loadError={model.mySwapsLoadError}
        />
      ) : null}

      {model.myScheduleChanges ? (
        <HrSftGovernedListSection
          title={hrSftUiCopy.myScheduleChanges.sectionTitle}
          description={hrSftUiCopy.myScheduleChanges.emptyDescription}
          surfaceKey={hrTimeSftMyScheduleChangesSurfaceKey}
          listConfiguration={model.myScheduleChanges}
          loadError={model.myScheduleChangesLoadError}
        />
      ) : null}

      <HrSftGovernedListSection
        title={hrSftUiCopy.publications.sectionTitle}
        description={hrSftUiCopy.publications.emptyDescription}
        surfaceKey={hrSftPublicationsSurfaceKey}
        listConfiguration={model.publications}
        loadError={model.publicationsLoadError}
      />

      <HrSftGovernedListSection
        title={hrSftUiCopy.notifications.sectionTitle}
        description={hrSftUiCopy.notifications.emptyDescription}
        surfaceKey={hrSftNotificationsSurfaceKey}
        listConfiguration={model.notifications}
        loadError={model.notificationsLoadError}
      />

      <HrSftGovernedListSection
        title={hrSftUiCopy.attendanceReconcile.sectionTitle}
        description={hrSftUiCopy.attendanceReconcile.emptyDescription}
        surfaceKey={hrSftAttendanceReconcileSurfaceKey}
        listConfiguration={model.attendanceReconcile}
        loadError={model.attendanceReconcileLoadError}
      />

      {model.canViewPayrollRefs ? (
        <HrSftGovernedListSection
          title={hrSftUiCopy.payrollRefs.sectionTitle}
          description={hrSftUiCopy.payrollRefs.emptyDescription}
          surfaceKey={hrSftPayrollRefsSurfaceKey}
          listConfiguration={model.payrollRefs}
          loadError={model.payrollRefsLoadError}
        />
      ) : null}

      <HrSftGovernedListSection
        title={hrSftUiCopy.reports.sectionTitle}
        description={hrSftUiCopy.reports.emptyDescription}
        surfaceKey={hrSftReportDefinitionsSurfaceKey}
        listConfiguration={model.reportDefinitions}
        loadError={model.reportDefinitionsLoadError}
      />

      {model.canViewAudit ? (
        <HrSftGovernedListSection
          title={hrSftUiCopy.audit.sectionTitle}
          description={hrSftUiCopy.audit.emptyDescription}
          surfaceKey={hrSftAuditTrailSurfaceKey}
          listConfiguration={model.auditTrail}
          loadError={model.auditTrailLoadError}
        />
      ) : null}
    </div>
  );
}
