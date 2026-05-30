export {
  getHrLamListSurfaceKeys,
  HR_LAM_LIST_SURFACE_COLUMNS_BY_KEY,
  HR_LAM_LIST_SEARCH_PARAMS_BY_KEY,
  HR_LAM_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_LAM_LIST_SURFACE_KEYS,
  HR_LAM_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrLamAttendanceDaysSurfaceKey,
  hrLamAttendanceDaysSearchParam,
  hrLamLeaveRequestsSurfaceKey,
  hrLamLeaveRequestsSearchParam,
  hrLamLeaveBalancesSurfaceKey,
  hrLamLeaveBalancesSearchParam,
  hrLamExceptionsSurfaceKey,
  hrLamCorrectionsSurfaceKey,
  hrLamPayrollRefsSurfaceKey,
  hrLamReportsSurfaceKey,
  hrLamAuditTrailSurfaceKey,
  type HrLamListSurfaceKey,
} from "./surface/hr.time.lam-surface-metadata.shared";

export { hrLamUiCopy } from "./surface/hr.time.lam-ui.copy.shared";

export {
  parseHrLamSearchParams,
  toHrLamPageModelInput,
  type HrLamSearchParams,
} from "./data/hr.time.lam-search-params.parse.shared";

export {
  hrLamRoutePaths,
  type HrLamRoutePath,
} from "./contracts/hr.time.lam-route.contract";

export {
  buildHrLamExceptionsListSurface,
} from "./surface/hr.time.attendance.lam-exceptions-list.surface";
export {
  buildHrLamCorrectionsListSurface,
} from "./surface/hr.time.attendance.lam-corrections-list.surface";
export {
  buildHrLamPayrollRefsListSurface,
} from "./surface/hr.time.attendance.lam-payroll-refs-list.surface";
export {
  buildHrLamReportsListSurface,
} from "./surface/hr.time.attendance.lam-reports-list.surface";
export {
  buildHrLamAuditTrailListSurface,
} from "./surface/hr.time.attendance.lam-audit-trail-list.surface";

export { assertLamCoverageComplete, LAM_REQUIREMENT_COVERAGE } from "./data/hr.time.lam-acceptance-coverage.shared";
