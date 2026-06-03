import {
  hrPerformanceAppraisalsApprovalsSearchParam,
  hrPerformanceAppraisalsApprovalsSurfaceKey,
  hrPerformanceAppraisalsAuditTrailSearchParam,
  hrPerformanceAppraisalsAuditTrailSurfaceKey,
  hrPerformanceAppraisalsCyclesSearchParam,
  hrPerformanceAppraisalsCyclesSurfaceKey,
  hrPerformanceAppraisalsGoalsSearchParam,
  hrPerformanceAppraisalsGoalsSurfaceKey,
  hrPerformanceAppraisalsOutcomesSearchParam,
  hrPerformanceAppraisalsOutcomesSurfaceKey,
  hrPerformanceAppraisalsReportsSearchParam,
  hrPerformanceAppraisalsReportsSurfaceKey,
  hrPerformanceAppraisalsReviewsSearchParam,
  hrPerformanceAppraisalsReviewsSurfaceKey,
} from "./hr.talent.performance-search-params.parse.shared";

export const HR_PERFORMANCE_APPRAISALS_LIST_SURFACE_KEYS = [
  hrPerformanceAppraisalsCyclesSurfaceKey,
  hrPerformanceAppraisalsReviewsSurfaceKey,
  hrPerformanceAppraisalsGoalsSurfaceKey,
  hrPerformanceAppraisalsApprovalsSurfaceKey,
  hrPerformanceAppraisalsOutcomesSurfaceKey,
  hrPerformanceAppraisalsReportsSurfaceKey,
  hrPerformanceAppraisalsAuditTrailSurfaceKey,
] as const;

export type HrPerformanceAppraisalsListSurfaceKey =
  (typeof HR_PERFORMANCE_APPRAISALS_LIST_SURFACE_KEYS)[number];

export const HR_PERFORMANCE_APPRAISALS_WORKBENCH_READ_ONLY_SURFACE_KEYS = [
  hrPerformanceAppraisalsCyclesSurfaceKey,
  hrPerformanceAppraisalsReviewsSurfaceKey,
  hrPerformanceAppraisalsGoalsSurfaceKey,
  hrPerformanceAppraisalsApprovalsSurfaceKey,
  hrPerformanceAppraisalsOutcomesSurfaceKey,
  hrPerformanceAppraisalsReportsSurfaceKey,
  hrPerformanceAppraisalsAuditTrailSurfaceKey,
] as const satisfies readonly HrPerformanceAppraisalsListSurfaceKey[];

export const HR_PERFORMANCE_APPRAISALS_LIST_SURFACE_COLUMNS_BY_KEY = {
  [hrPerformanceAppraisalsCyclesSurfaceKey]:
    "hr.talent.performance-appraisals.cycles.columns",
  [hrPerformanceAppraisalsReviewsSurfaceKey]:
    "hr.talent.performance-appraisals.reviews.columns",
  [hrPerformanceAppraisalsGoalsSurfaceKey]:
    "hr.talent.performance-appraisals.goals.columns",
  [hrPerformanceAppraisalsApprovalsSurfaceKey]:
    "hr.talent.performance-appraisals.approvals.columns",
  [hrPerformanceAppraisalsOutcomesSurfaceKey]:
    "hr.talent.performance-appraisals.outcomes.columns",
  [hrPerformanceAppraisalsReportsSurfaceKey]:
    "hr.talent.performance-appraisals.reports.columns",
  [hrPerformanceAppraisalsAuditTrailSurfaceKey]:
    "hr.talent.performance-appraisals.audit-trail.columns",
} as const satisfies Record<HrPerformanceAppraisalsListSurfaceKey, string>;

export const HR_PERFORMANCE_APPRAISALS_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrPerformanceAppraisalsCyclesSurfaceKey]:
    hrPerformanceAppraisalsCyclesSearchParam,
  [hrPerformanceAppraisalsReviewsSurfaceKey]:
    hrPerformanceAppraisalsReviewsSearchParam,
  [hrPerformanceAppraisalsGoalsSurfaceKey]:
    hrPerformanceAppraisalsGoalsSearchParam,
  [hrPerformanceAppraisalsApprovalsSurfaceKey]:
    hrPerformanceAppraisalsApprovalsSearchParam,
  [hrPerformanceAppraisalsOutcomesSurfaceKey]:
    hrPerformanceAppraisalsOutcomesSearchParam,
  [hrPerformanceAppraisalsReportsSurfaceKey]:
    hrPerformanceAppraisalsReportsSearchParam,
  [hrPerformanceAppraisalsAuditTrailSurfaceKey]:
    hrPerformanceAppraisalsAuditTrailSearchParam,
} as const satisfies Record<HrPerformanceAppraisalsListSurfaceKey, string>;

export const HR_PERFORMANCE_APPRAISALS_LIST_SEARCH_PARAM_MODEL_FIELDS = [
  "performanceCyclesSearch",
  "performanceReviewsSearch",
  "performanceGoalsSearch",
  "performanceApprovalsSearch",
  "performanceOutcomesSearch",
  "performanceReportsSearch",
  "performanceAuditTrailSearch",
] as const;

export function getHrPerformanceAppraisalsListSurfaceKeys() {
  return HR_PERFORMANCE_APPRAISALS_LIST_SURFACE_KEYS;
}
