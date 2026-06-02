import React from "react";

import {
  buildHrLamPageModel,
} from "./data/hr.time.lam.page-model.server";
import { toHrLamPageModelInput } from "./data/hr.time.lam-search-params.parse.shared";
import {
  requireHrLamAttendanceRead,
  requireHrLamRead,
} from "./policies/hr.time.lam-access.policy.server";

export * from "./actions";
export * from "./actions/hr.time.attendance.lam.actions.server";
export * from "./actions/hr.time.attendance.lam.mutation.shared.server";
export * from "./data/hr.time.lam.page-model.server";
export * from "./data/hr.time.attendance.lam-audit-trail.shared.server";
export * from "./data/hr.time.lam-acceptance-coverage.shared";
export * from "./events/hr.time.attendance.lam.event";
export * from "./policies/hr.time.lam-access.policy.server";
export * from "./contracts/hr.time.lam.contract";

export {
  HrLamAccessDeniedPanel,
  HrLamWorkbenchSection,
  HrLeaveWorkbenchSection,
  HrAttendanceWorkbenchSection,
} from "./components/hr.time.lam-section.component.server";

export {
  buildHrLamExceptionsListSurface,
  hrLamExceptionsSurfaceKey,
} from "./surface/hr.time.attendance.lam-exceptions-list.surface";
export {
  buildHrLamCorrectionsListSurface,
  hrLamCorrectionsSurfaceKey,
} from "./surface/hr.time.attendance.lam-corrections-list.surface";
export {
  buildHrLamPayrollRefsListSurface,
  hrLamPayrollRefsSurfaceKey,
} from "./surface/hr.time.attendance.lam-payroll-refs-list.surface";
export {
  buildHrLamReportsListSurface,
  hrLamReportsSurfaceKey,
} from "./surface/hr.time.attendance.lam-reports-list.surface";
export {
  buildHrLamAuditTrailListSurface,
  hrLamAuditTrailSurfaceKey,
} from "./surface/hr.time.attendance.lam-audit-trail-list.surface";

import { HrLamAccessDeniedPanel } from "./components/hr.time.lam-section.component.server";
import {
  HrAttendanceWorkbenchSection,
  HrLamWorkbenchSection,
  HrLeaveWorkbenchSection,
} from "./components/hr.time.lam-section.component.server";

export function HrLamAccessDenied() {
  return React.createElement(HrLamAccessDeniedPanel);
}

type HrRawSearchParams = Record<string, string | string[] | undefined> | undefined;
type HrSearchParamsInput = HrRawSearchParams | Promise<HrRawSearchParams>;

export async function renderHrLamPage(searchParams?: HrSearchParamsInput) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  try {
    const guard = await requireHrLamRead();
    const model = await buildHrLamPageModel(
      toHrLamPageModelInput({
        organizationId: guard.organization.id,
        canWriteLeave: guard.canWriteLeave,
        canWriteAttendance: guard.canWriteAttendance,
        canReadPayrollRefs: guard.canReadPayrollRefs,
        canReadAudit: guard.canReadAudit,
        searchParams: resolvedSearchParams,
      }),
    );

    return React.createElement(HrLamWorkbenchSection, { model });
  } catch {
    return React.createElement(HrLamAccessDeniedPanel);
  }
}

export async function renderHrLeavePage(searchParams?: HrSearchParamsInput) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  try {
    const guard = await requireHrLamRead();
    const model = await buildHrLamPageModel(
      toHrLamPageModelInput({
        organizationId: guard.organization.id,
        canWriteLeave: guard.canWriteLeave,
        canWriteAttendance: false,
        canReadPayrollRefs: guard.canReadPayrollRefs,
        canReadAudit: guard.canReadAudit,
        searchParams: resolvedSearchParams,
      }),
    );

    return React.createElement(HrLeaveWorkbenchSection, { model });
  } catch {
    return React.createElement(HrLamAccessDeniedPanel);
  }
}

export async function renderHrAttendancePage(searchParams?: HrSearchParamsInput) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  try {
    const guard = await requireHrLamAttendanceRead();
    const model = await buildHrLamPageModel(
      toHrLamPageModelInput({
        organizationId: guard.organization.id,
        canWriteLeave: false,
        canWriteAttendance: guard.canWriteAttendance,
        searchParams: resolvedSearchParams,
      }),
    );

    return React.createElement(HrAttendanceWorkbenchSection, { model });
  } catch {
    return React.createElement(HrLamAccessDeniedPanel);
  }
}
