import React from "react";

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

export function HrLamAccessDenied() {
  return React.createElement(HrLamAccessDeniedPanel);
}
