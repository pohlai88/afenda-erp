export const hrLamAttendanceDaysColumnsId = "hr.time.lam.attendance-days.columns";
export const hrLamLeaveRequestsColumnsId = "hr.time.lam.leave-requests.columns";
export const hrLamLeaveBalancesColumnsId = "hr.time.lam.leave-balances.columns";

export const hrLamAttendanceDaysSurfaceKey = "hr.time.lam.attendance_days.list";
export const hrLamLeaveRequestsSurfaceKey = "hr.time.lam.leave_requests.list";
export const hrLamLeaveBalancesSurfaceKey = "hr.time.lam.leave_balances.list";

export const hrLamAttendanceDaysSearchParam = "lamAttendanceDaysSearch";
export const hrLamLeaveRequestsSearchParam = "lamLeaveRequestsSearch";
export const hrLamLeaveBalancesSearchParam = "lamLeaveBalancesSearch";

export { hrLamAuditTrailSurfaceKey } from "./hr.time.attendance.lam-audit-trail-list.surface";
export { hrLamCorrectionsSurfaceKey } from "./hr.time.attendance.lam-corrections-list.surface";
export { hrLamExceptionsSurfaceKey } from "./hr.time.attendance.lam-exceptions-list.surface";
export { hrLamPayrollRefsSurfaceKey } from "./hr.time.attendance.lam-payroll-refs-list.surface";
export { hrLamReportsSurfaceKey } from "./hr.time.attendance.lam-reports-list.surface";

import { hrLamAuditTrailSurfaceKey } from "./hr.time.attendance.lam-audit-trail-list.surface";
import { hrLamCorrectionsSurfaceKey } from "./hr.time.attendance.lam-corrections-list.surface";
import { hrLamExceptionsSurfaceKey } from "./hr.time.attendance.lam-exceptions-list.surface";
import { hrLamPayrollRefsSurfaceKey } from "./hr.time.attendance.lam-payroll-refs-list.surface";
import { hrLamReportsSurfaceKey } from "./hr.time.attendance.lam-reports-list.surface";

export const hrLamExceptionsColumnsId = "hr.time.lam.exceptions.columns";
export const hrLamCorrectionsColumnsId = "hr.time.lam.corrections.columns";
export const hrLamPayrollRefsColumnsId = "hr.time.lam.payroll-refs.columns";
export const hrLamReportsColumnsId = "hr.time.lam.reports.columns";
export const hrLamAuditTrailColumnsId = "hr.time.lam.audit-trail.columns";

export const HR_LAM_LIST_SURFACE_KEYS = [
  hrLamAttendanceDaysSurfaceKey,
  hrLamLeaveRequestsSurfaceKey,
  hrLamLeaveBalancesSurfaceKey,
  hrLamExceptionsSurfaceKey,
  hrLamCorrectionsSurfaceKey,
  hrLamPayrollRefsSurfaceKey,
  hrLamReportsSurfaceKey,
  hrLamAuditTrailSurfaceKey,
] as const;

export type HrLamListSurfaceKey = (typeof HR_LAM_LIST_SURFACE_KEYS)[number];

export const HR_LAM_WORKBENCH_READ_ONLY_SURFACE_KEYS = [
  hrLamLeaveBalancesSurfaceKey,
] as const;

export const HR_LAM_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrLamAttendanceDaysSurfaceKey]: hrLamAttendanceDaysSearchParam,
  [hrLamLeaveRequestsSurfaceKey]: hrLamLeaveRequestsSearchParam,
  [hrLamLeaveBalancesSurfaceKey]: hrLamLeaveBalancesSearchParam,
} as const;

export const HR_LAM_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  [hrLamAttendanceDaysSearchParam]: "attendanceDaysSearch",
  [hrLamLeaveRequestsSearchParam]: "leaveRequestsSearch",
  [hrLamLeaveBalancesSearchParam]: "leaveBalancesSearch",
} as const;

export const HR_LAM_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrLamAttendanceDaysSurfaceKey]: hrLamAttendanceDaysColumnsId,
  [hrLamLeaveRequestsSurfaceKey]: hrLamLeaveRequestsColumnsId,
  [hrLamLeaveBalancesSurfaceKey]: hrLamLeaveBalancesColumnsId,
  [hrLamExceptionsSurfaceKey]: hrLamExceptionsColumnsId,
  [hrLamCorrectionsSurfaceKey]: hrLamCorrectionsColumnsId,
  [hrLamPayrollRefsSurfaceKey]: hrLamPayrollRefsColumnsId,
  [hrLamReportsSurfaceKey]: hrLamReportsColumnsId,
  [hrLamAuditTrailSurfaceKey]: hrLamAuditTrailColumnsId,
} as const;

export function getHrLamListSurfaceKeys(): readonly HrLamListSurfaceKey[] {
  return HR_LAM_LIST_SURFACE_KEYS;
}
