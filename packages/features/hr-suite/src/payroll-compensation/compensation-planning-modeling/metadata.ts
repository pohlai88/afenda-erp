import { HR_CPM_LIST_SURFACE_KEYS } from "./data/hr.payroll.cpm-search-params.parse.shared";

export {
  HR_CPM_LIST_SURFACE_KEYS,
  hrCpmAuditSearchParam,
  hrCpmAuditSurfaceKey,
  hrCpmCyclesSearchParam,
  hrCpmCyclesSurfaceKey,
  hrCpmParticipantsSearchParam,
  hrCpmParticipantsSurfaceKey,
  hrCpmRecommendationsSearchParam,
  hrCpmRecommendationsSurfaceKey,
  hrCpmReportsSearchParam,
  hrCpmReportsSurfaceKey,
  parseHrCpmSearchParams,
  toHrCpmAuditPageModelInput,
  toHrCpmCycleDetailPageModelInput,
  toHrCpmHubPageModelInput,
  toHrCpmReportsPageModelInput,
  type HrCpmListSurfaceKey,
  type HrCpmSearchParams,
} from "./data/hr.payroll.cpm-search-params.parse.shared";

export {
  hrCpmAuditColumnsId,
  hrCpmCyclesColumnsId,
  hrCpmParticipantsColumnsId,
  hrCpmRecommendationsColumnsId,
  hrCpmReportsColumnsId,
} from "./surface/hr.payroll.cpm-surface-columns.shared";

export const HR_CPM_LIST_SURFACE_COLUMNS_BY_KEY = {
  "hr.payroll.cpm.cycles.list": "hr.payroll.cpm.cycles.list",
  "hr.payroll.cpm.participants.list": "hr.payroll.cpm.participants.list",
  "hr.payroll.cpm.recommendations.list": "hr.payroll.cpm.recommendations.list",
  "hr.payroll.cpm.reports.list": "hr.payroll.cpm.reports.list",
  "hr.payroll.cpm.audit.list": "hr.payroll.cpm.audit.list",
} as const;

export function getHrCpmListSurfaceKeys() {
  return HR_CPM_LIST_SURFACE_KEYS;
}

export { hrCpmUiCopy } from "./surface/hr.payroll.cpm-ui.copy.shared";

export {
  hrCpmParticipantContextSurfaceKey,
  hrCpmSalaryBandSurfaceKey,
} from "./surface/hr.payroll.cpm-surface-columns.shared";

export {
  buildHrCpmParticipantContextStatGroups,
} from "./surface/hr.payroll.cpm-participant-context-stat.surface";

export {
  buildHrCpmSalaryBandStatGroups,
} from "./surface/hr.payroll.cpm-salary-band-stat.surface";

export {
  hrCpmRoutePaths,
  hrCpmCycleDetailRoutePath,
  hrCpmParticipantDetailRoutePath,
  type HrCpmRoutePath,
} from "./contracts/hr.payroll.cpm-route.contract";
