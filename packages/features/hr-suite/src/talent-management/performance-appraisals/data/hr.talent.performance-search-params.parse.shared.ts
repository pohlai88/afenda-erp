import { HR_PER_REPORT_GROUP_BY } from "../schemas/hr.talent.performance-constants.shared";
import type { HrPerReportGroupBy } from "../schemas/hr.talent.performance-constants.shared";

export const hrPerformanceAppraisalsCyclesSearchParam =
  "performanceCyclesSearch";
export const hrPerformanceAppraisalsReviewsSearchParam =
  "performanceReviewsSearch";
export const hrPerformanceAppraisalsGoalsSearchParam =
  "performanceGoalsSearch";
export const hrPerformanceAppraisalsApprovalsSearchParam =
  "performanceApprovalsSearch";
export const hrPerformanceAppraisalsOutcomesSearchParam =
  "performanceOutcomesSearch";
export const hrPerformanceAppraisalsReportsSearchParam =
  "performanceReportsSearch";
export const hrPerformanceAppraisalsAuditTrailSearchParam =
  "performanceAuditTrailSearch";
export const hrPerformanceAppraisalsReportGroupByParam =
  "performanceReportGroupBy";

export const hrPerformanceAppraisalsCyclesSurfaceKey =
  "hr.talent.performance-appraisals.cycles.list";
export const hrPerformanceAppraisalsReviewsSurfaceKey =
  "hr.talent.performance-appraisals.reviews.list";
export const hrPerformanceAppraisalsGoalsSurfaceKey =
  "hr.talent.performance-appraisals.goals.list";
export const hrPerformanceAppraisalsApprovalsSurfaceKey =
  "hr.talent.performance-appraisals.approvals.list";
export const hrPerformanceAppraisalsOutcomesSurfaceKey =
  "hr.talent.performance-appraisals.outcomes.list";
export const hrPerformanceAppraisalsReportsSurfaceKey =
  "hr.talent.performance-appraisals.reports.list";
export const hrPerformanceAppraisalsAuditTrailSurfaceKey =
  "hr.talent.performance-appraisals.audit-trail.list";

export type HrPerformanceAppraisalsSearchParams = {
  performanceCyclesSearch?: string;
  performanceReviewsSearch?: string;
  performanceGoalsSearch?: string;
  performanceApprovalsSearch?: string;
  performanceOutcomesSearch?: string;
  performanceReportsSearch?: string;
  performanceAuditTrailSearch?: string;
  performanceReportGroupBy: HrPerReportGroupBy;
};

export type HrPerformanceAppraisalsPageModelInput =
  HrPerformanceAppraisalsSearchParams & {
    organizationId: string;
    visibleEmployeeIds?: readonly string[] | null;
    canWritePerformance: boolean;
    canReadAudit: boolean;
    canReadCompensationOutcome: boolean;
  };

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = searchParams?.[key];
  const raw = Array.isArray(value) ? value[0] : value;
  const text = raw?.trim();
  return text && text.length > 0 ? text : undefined;
}

function readReportGroupBy(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): HrPerReportGroupBy {
  const value = readSearchParam(searchParams, hrPerformanceAppraisalsReportGroupByParam);
  if (value && HR_PER_REPORT_GROUP_BY.includes(value as HrPerReportGroupBy)) {
    return value as HrPerReportGroupBy;
  }
  return "department";
}

export function parseHrPerformanceAppraisalsSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrPerformanceAppraisalsSearchParams {
  return {
    performanceCyclesSearch: readSearchParam(
      searchParams,
      hrPerformanceAppraisalsCyclesSearchParam,
    ),
    performanceReviewsSearch: readSearchParam(
      searchParams,
      hrPerformanceAppraisalsReviewsSearchParam,
    ),
    performanceGoalsSearch: readSearchParam(
      searchParams,
      hrPerformanceAppraisalsGoalsSearchParam,
    ),
    performanceApprovalsSearch: readSearchParam(
      searchParams,
      hrPerformanceAppraisalsApprovalsSearchParam,
    ),
    performanceOutcomesSearch: readSearchParam(
      searchParams,
      hrPerformanceAppraisalsOutcomesSearchParam,
    ),
    performanceReportsSearch: readSearchParam(
      searchParams,
      hrPerformanceAppraisalsReportsSearchParam,
    ),
    performanceAuditTrailSearch: readSearchParam(
      searchParams,
      hrPerformanceAppraisalsAuditTrailSearchParam,
    ),
    performanceReportGroupBy: readReportGroupBy(searchParams),
  };
}

export function toHrPerformanceAppraisalsPageModelInput(input: {
  organizationId: string;
  visibleEmployeeIds?: readonly string[] | null;
  canWritePerformance: boolean;
  canReadAudit: boolean;
  canReadCompensationOutcome: boolean;
  searchParams?: HrPerformanceAppraisalsSearchParams;
}): HrPerformanceAppraisalsPageModelInput {
  return {
    organizationId: input.organizationId,
    visibleEmployeeIds: input.visibleEmployeeIds,
    canWritePerformance: input.canWritePerformance,
    canReadAudit: input.canReadAudit,
    canReadCompensationOutcome: input.canReadCompensationOutcome,
    ...(input.searchParams ??
      parseHrPerformanceAppraisalsSearchParams(undefined)),
  };
}
