import { HR_SBS_LIST_SURFACE_KEYS } from "./hr.payroll.sbs-search-params.parse.shared";

export {
  HR_SBS_LIST_SURFACE_KEYS,
  hrSbsAnalysesSearchParam,
  hrSbsAnalysesSurfaceKey,
  hrSbsAuditSearchParam,
  hrSbsAuditSurfaceKey,
  hrSbsBenchmarkReportSearchParam,
  hrSbsBenchmarkReportSurfaceKey,
  hrSbsMappingsSearchParam,
  hrSbsMappingsSurfaceKey,
  hrSbsPayEquityReportSearchParam,
  hrSbsPayEquityReportSurfaceKey,
  hrSbsVersionsSearchParam,
  hrSbsVersionsSurfaceKey,
  parseHrSbsSearchParams,
  toHrSbsAuditPageModelInput,
  toHrSbsHubPageModelInput,
  toHrSbsReportsPageModelInput,
  type HrSbsListSurfaceKey,
  type HrSbsSearchParams,
} from "./hr.payroll.sbs-search-params.parse.shared";

export {
  hrSbsAnalysesColumnsId,
  hrSbsAuditColumnsId,
  hrSbsBenchmarkReportColumnsId,
  hrSbsMappingsColumnsId,
  hrSbsPayEquityReportColumnsId,
  hrSbsVersionsColumnsId,
  hrSbsUiCopy,
} from "./hr.payroll.sbs-ui.copy.shared";

export const HR_SBS_LIST_SURFACE_COLUMNS_BY_KEY = {
  "hr.payroll.sbs.versions.list": "hr.payroll.sbs.versions.list",
  "hr.payroll.sbs.mappings.list": "hr.payroll.sbs.mappings.list",
  "hr.payroll.sbs.analyses.list": "hr.payroll.sbs.analyses.list",
  "hr.payroll.sbs.benchmark-report.list": "hr.payroll.sbs.benchmark-report.list",
  "hr.payroll.sbs.pay-equity-report.list": "hr.payroll.sbs.pay-equity-report.list",
  "hr.payroll.sbs.audit.list": "hr.payroll.sbs.audit.list",
} as const;

export function getHrSbsListSurfaceKeys() {
  return HR_SBS_LIST_SURFACE_KEYS;
}

export {
  hrSbsRoutePaths,
  type HrSbsRoutePath,
} from "./hr.payroll.sbs-route.contract";

export {
  buildHrSbsVersionsListSurface,
  buildHrSbsMappingsListSurface,
  buildHrSbsAnalysesListSurface,
  buildHrSbsBenchmarkReportListSurface,
  buildHrSbsPayEquityReportListSurface,
  buildHrSbsAuditListSurface,
} from "./hr.payroll.sbs-lists.surface";
