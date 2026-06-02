import React from "react";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";

import {
  buildHrSftPageModel,
  buildHrSftSelfServicePageModel,
} from "./data/hr.time.sft.page-model.server";
import {
  toHrSftPageModelInput,
  toHrSftSelfServicePageModelInput,
} from "./data/hr.time.sft-search-params.parse.shared";
import { requireHrSftRead } from "./policies/hr.time.sft-access.policy.server";

export * from "./actions";
export * from "./events";
export * from "./policies";
export * from "./schemas";
export * from "./contracts";

export * from "./data/hr.time.sft.page-model.server";
export * from "./data/hr.time.sft-search-params.parse.shared";
export * from "./data/hr.time.sft-acceptance-coverage.shared";
export * from "./data/hr.time.sft-template.server";
export * from "./data/hr.time.sft-roster.server";
export * from "./data/hr.time.sft-recurrence.server";
export * from "./data/hr.time.sft-rotation.server";
export * from "./data/hr.time.sft-assignment.server";
export * from "./data/hr.time.sft-coverage.server";
export * from "./data/hr.time.sft-swap.server";
export * from "./data/hr.time.sft-schedule-change.server";
export * from "./data/hr.time.sft-availability.server";
export * from "./data/hr.time.sft-conflict.server";
export * from "./data/hr.time.sft-conflict.shared";
export * from "./data/hr.time.sft-policy.server";
export * from "./data/hr.time.sft-lam-boundary.server";
export * from "./data/hr.time.sft-audit.server";
export * from "./data/hr.time.sft-notification.server";
export * from "./data/hr.time.sft-publication.server";
export * from "./data/hr.time.sft-attendance-reconcile.server";
export * from "./data/hr.time.sft-payroll-ref.server";
export * from "./data/hr.time.sft-report.server";

export {
  HrSftAccessDeniedPanel,
  HrSftMySwapsSection,
  HrSftWorkbenchSection,
} from "./components/hr.time.sft-section.component.server";

export {
  requireHrSftRead,
  requireHrSftManage,
  requireHrTimeSftRead,
  requireHrTimeSftManage,
  requireHrSftApprove,
  requireHrSftOverride,
  requireHrSftReportExport,
  requireHrSftPayrollRefRead,
  requireHrSftAuditRead,
} from "./policies/hr.time.sft-access.policy.server";

export {
  buildHrTimeSftTemplatesListSurface,
  hrTimeSftTemplatesSurfaceKey,
} from "./surface/hr.time.sft-templates-list.surface";
export {
  buildHrTimeSftRosterListSurface,
  hrTimeSftRosterSurfaceKey,
} from "./surface/hr.time.sft-roster-list.surface";
export {
  buildHrTimeSftRecurrenceRulesListSurface,
  hrTimeSftRecurrenceRulesSurfaceKey,
} from "./surface/hr.time.sft-recurrence-rules-list.surface";
export {
  buildHrTimeSftCoverageListSurface,
  hrTimeSftCoverageSurfaceKey,
} from "./surface/hr.time.sft-coverage-list.surface";
export {
  buildHrTimeSftAvailabilityListSurface,
  hrTimeSftAvailabilitySurfaceKey,
} from "./surface/hr.time.sft-availability-list.surface";
export {
  buildHrTimeSftSwapPendingListSurface,
  hrTimeSftSwapPendingSurfaceKey,
} from "./surface/hr.time.sft-swap-pending-list.surface";
export {
  buildHrTimeSftMySwapsListSurface,
  hrTimeSftMySwapsSurfaceKey,
} from "./surface/hr.time.sft-my-swaps-list.surface";
export {
  buildHrTimeSftMyScheduleChangesListSurface,
  hrTimeSftMyScheduleChangesSurfaceKey,
} from "./surface/hr.time.sft-my-schedule-changes-list.surface";
export {
  buildHrTimeSftScheduleChangePendingListSurface,
  hrTimeSftScheduleChangePendingSurfaceKey,
} from "./surface/hr.time.sft-schedule-change-pending-list.surface";
export {
  buildHrSftPublicationsListSurface,
  hrSftPublicationsSurfaceKey,
} from "./surface/hr.time.sft-publications-list.surface";
export {
  buildHrSftAttendanceReconcileListSurface,
  hrSftAttendanceReconcileSurfaceKey,
} from "./surface/hr.time.sft-attendance-reconcile-list.surface";
export {
  buildHrSftNotificationsListSurface,
  hrSftNotificationsSurfaceKey,
} from "./surface/hr.time.sft-notifications-list.surface";
export {
  buildHrSftPayrollRefsListSurface,
  hrSftPayrollRefsSurfaceKey,
} from "./surface/hr.time.sft-payroll-refs-list.surface";
export {
  buildHrSftReportDefinitionsListSurface,
  hrSftReportDefinitionsSurfaceKey,
} from "./surface/hr.time.sft-report-definitions-list.surface";
export {
  buildHrSftAuditTrailListSurface,
  hrSftAuditTrailSurfaceKey,
} from "./surface/hr.time.sft-audit-trail-list.surface";

import { HrSftAccessDeniedPanel } from "./components/hr.time.sft-section.component.server";
import {
  HrSftMySwapsSection,
  HrSftWorkbenchSection,
} from "./components/hr.time.sft-section.component.server";

export function HrSftAccessDenied() {
  return React.createElement(HrSftAccessDeniedPanel);
}

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

function isHrSftAccessFailure(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

export async function renderHrSftPage(searchParams?: HrSearchParamsInput) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  try {
    const guard = await requireHrSftRead();
    const actorEmployeeId = guard.actorEmployeeIds[0];

    if (guard.accessScope === "self" && actorEmployeeId) {
      const selfServiceModel = await buildHrSftSelfServicePageModel(
        toHrSftSelfServicePageModelInput({
          organizationId: guard.organization.id,
          actorEmployeeId,
          searchParams: resolvedSearchParams,
        }),
      );

      return React.createElement(HrSftMySwapsSection, {
        model: selfServiceModel,
      });
    }

    const visibleEmployeeIds = await guard.resolveVisibleEmployeeIds();
    const pageModel = await buildHrSftPageModel(
      toHrSftPageModelInput({
        organizationId: guard.organization.id,
        actorAuthUserId: guard.session.id,
        accessScope: guard.accessScope,
        canManage: guard.canManageShifts,
        canApprove: guard.canApprove,
        actorEmployeeId,
        canViewPayrollRefs: guard.canViewPayrollRefs,
        canViewAudit: guard.canViewAudit,
        visibleEmployeeIds,
        searchParams: resolvedSearchParams,
      }),
    );

    return React.createElement(HrSftWorkbenchSection, { model: pageModel });
  } catch (error) {
    if (isHrSftAccessFailure(error)) {
      return React.createElement(HrSftAccessDeniedPanel);
    }
    throw error;
  }
}
