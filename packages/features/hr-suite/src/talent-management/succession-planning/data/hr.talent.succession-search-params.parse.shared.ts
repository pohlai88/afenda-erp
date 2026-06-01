import { z } from "zod";

import {
  HR_SUCCESSION_REPORT_GROUP_BY,
  type HrSuccessionReportGroupBy,
} from "../schemas/hr.talent.succession-constants.shared";

export const hrSuccessionCriticalRolesSearchParam =
  "successionCriticalRolesSearch";
export const hrSuccessionSuccessorsSearchParam = "successionSuccessorsSearch";
export const hrSuccessionCompetencyGapsSearchParam =
  "successionCompetencyGapsSearch";
export const hrSuccessionDevelopmentPlansSearchParam =
  "successionDevelopmentPlansSearch";
export const hrSuccessionTalentPoolsSearchParam =
  "successionTalentPoolsSearch";
export const hrSuccessionCalibrationReviewsSearchParam =
  "successionCalibrationReviewsSearch";
export const hrSuccessionBenchStrengthSearchParam =
  "successionBenchStrengthSearch";
export const hrSuccessionReplacementPlansSearchParam =
  "successionReplacementPlansSearch";
export const hrSuccessionNotificationsSearchParam =
  "successionNotificationsSearch";
export const hrSuccessionLifecycleRecommendationsSearchParam =
  "successionLifecycleRecommendationsSearch";
export const hrSuccessionReportsSearchParam = "successionReportsSearch";
export const hrSuccessionAuditTrailSearchParam =
  "successionAuditTrailSearch";
export const hrSuccessionReportGroupByParam = "successionReportGroupBy";

export const hrSuccessionOverviewKpiSurfaceKey =
  "hr.talent.succession-planning.overview.kpi";
export const hrSuccessionCriticalRolesSurfaceKey =
  "hr.talent.succession-planning.critical-roles.list";
export const hrSuccessionSuccessorsSurfaceKey =
  "hr.talent.succession-planning.successors.list";
export const hrSuccessionCompetencyGapsSurfaceKey =
  "hr.talent.succession-planning.competency-gaps.list";
export const hrSuccessionDevelopmentPlansSurfaceKey =
  "hr.talent.succession-planning.development-plans.list";
export const hrSuccessionTalentPoolsSurfaceKey =
  "hr.talent.succession-planning.talent-pools.list";
export const hrSuccessionCalibrationReviewsSurfaceKey =
  "hr.talent.succession-planning.calibration-reviews.list";
export const hrSuccessionBenchStrengthSurfaceKey =
  "hr.talent.succession-planning.bench-strength.list";
export const hrSuccessionReplacementPlansSurfaceKey =
  "hr.talent.succession-planning.replacement-plans.list";
export const hrSuccessionNotificationsSurfaceKey =
  "hr.talent.succession-planning.notifications.list";
export const hrSuccessionLifecycleRecommendationsSurfaceKey =
  "hr.talent.succession-planning.lifecycle-recommendations.list";
export const hrSuccessionReportsSurfaceKey =
  "hr.talent.succession-planning.reports.list";
export const hrSuccessionAuditTrailSurfaceKey =
  "hr.talent.succession-planning.audit-trail.list";

export const HR_SUCCESSION_LIST_SURFACE_KEYS = [
  hrSuccessionCriticalRolesSurfaceKey,
  hrSuccessionSuccessorsSurfaceKey,
  hrSuccessionCompetencyGapsSurfaceKey,
  hrSuccessionDevelopmentPlansSurfaceKey,
  hrSuccessionTalentPoolsSurfaceKey,
  hrSuccessionCalibrationReviewsSurfaceKey,
  hrSuccessionBenchStrengthSurfaceKey,
  hrSuccessionReplacementPlansSurfaceKey,
  hrSuccessionNotificationsSurfaceKey,
  hrSuccessionLifecycleRecommendationsSurfaceKey,
  hrSuccessionReportsSurfaceKey,
  hrSuccessionAuditTrailSurfaceKey,
] as const;

export type HrSuccessionListSurfaceKey =
  (typeof HR_SUCCESSION_LIST_SURFACE_KEYS)[number];

export const HR_SUCCESSION_LIST_SEARCH_PARAMS_BY_KEY = {
  [hrSuccessionCriticalRolesSurfaceKey]: hrSuccessionCriticalRolesSearchParam,
  [hrSuccessionSuccessorsSurfaceKey]: hrSuccessionSuccessorsSearchParam,
  [hrSuccessionCompetencyGapsSurfaceKey]:
    hrSuccessionCompetencyGapsSearchParam,
  [hrSuccessionDevelopmentPlansSurfaceKey]:
    hrSuccessionDevelopmentPlansSearchParam,
  [hrSuccessionTalentPoolsSurfaceKey]: hrSuccessionTalentPoolsSearchParam,
  [hrSuccessionCalibrationReviewsSurfaceKey]:
    hrSuccessionCalibrationReviewsSearchParam,
  [hrSuccessionBenchStrengthSurfaceKey]:
    hrSuccessionBenchStrengthSearchParam,
  [hrSuccessionReplacementPlansSurfaceKey]:
    hrSuccessionReplacementPlansSearchParam,
  [hrSuccessionNotificationsSurfaceKey]: hrSuccessionNotificationsSearchParam,
  [hrSuccessionLifecycleRecommendationsSurfaceKey]:
    hrSuccessionLifecycleRecommendationsSearchParam,
  [hrSuccessionReportsSurfaceKey]: hrSuccessionReportsSearchParam,
  [hrSuccessionAuditTrailSurfaceKey]: hrSuccessionAuditTrailSearchParam,
} as const;

export const HR_SUCCESSION_LIST_SEARCH_PARAM_MODEL_FIELDS = {
  [hrSuccessionCriticalRolesSearchParam]: "criticalRolesSearch",
  [hrSuccessionSuccessorsSearchParam]: "successorsSearch",
  [hrSuccessionCompetencyGapsSearchParam]: "competencyGapsSearch",
  [hrSuccessionDevelopmentPlansSearchParam]: "developmentPlansSearch",
  [hrSuccessionTalentPoolsSearchParam]: "talentPoolsSearch",
  [hrSuccessionCalibrationReviewsSearchParam]: "calibrationReviewsSearch",
  [hrSuccessionBenchStrengthSearchParam]: "benchStrengthSearch",
  [hrSuccessionReplacementPlansSearchParam]: "replacementPlansSearch",
  [hrSuccessionNotificationsSearchParam]: "notificationsSearch",
  [hrSuccessionLifecycleRecommendationsSearchParam]:
    "lifecycleRecommendationsSearch",
  [hrSuccessionReportsSearchParam]: "reportsSearch",
  [hrSuccessionAuditTrailSearchParam]: "auditTrailSearch",
} as const;

export const HR_SUCCESSION_WORKBENCH_READ_ONLY_SURFACE_KEYS = [
  hrSuccessionBenchStrengthSurfaceKey,
  hrSuccessionNotificationsSurfaceKey,
  hrSuccessionLifecycleRecommendationsSurfaceKey,
  hrSuccessionReportsSurfaceKey,
  hrSuccessionAuditTrailSurfaceKey,
] as const;

export type HrSuccessionSearchParams = {
  criticalRolesSearch?: string;
  successorsSearch?: string;
  competencyGapsSearch?: string;
  developmentPlansSearch?: string;
  talentPoolsSearch?: string;
  calibrationReviewsSearch?: string;
  benchStrengthSearch?: string;
  replacementPlansSearch?: string;
  notificationsSearch?: string;
  lifecycleRecommendationsSearch?: string;
  reportsSearch?: string;
  auditTrailSearch?: string;
  reportGroupBy: HrSuccessionReportGroupBy;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

const reportGroupBySchema = z
  .enum(HR_SUCCESSION_REPORT_GROUP_BY)
  .catch("department");

export function parseHrSuccessionSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): HrSuccessionSearchParams {
  if (!searchParams) {
    return { reportGroupBy: "department" };
  }

  return {
    criticalRolesSearch: readSearchParam(
      searchParams,
      hrSuccessionCriticalRolesSearchParam,
    ),
    successorsSearch: readSearchParam(
      searchParams,
      hrSuccessionSuccessorsSearchParam,
    ),
    competencyGapsSearch: readSearchParam(
      searchParams,
      hrSuccessionCompetencyGapsSearchParam,
    ),
    developmentPlansSearch: readSearchParam(
      searchParams,
      hrSuccessionDevelopmentPlansSearchParam,
    ),
    talentPoolsSearch: readSearchParam(
      searchParams,
      hrSuccessionTalentPoolsSearchParam,
    ),
    calibrationReviewsSearch: readSearchParam(
      searchParams,
      hrSuccessionCalibrationReviewsSearchParam,
    ),
    benchStrengthSearch: readSearchParam(
      searchParams,
      hrSuccessionBenchStrengthSearchParam,
    ),
    replacementPlansSearch: readSearchParam(
      searchParams,
      hrSuccessionReplacementPlansSearchParam,
    ),
    notificationsSearch: readSearchParam(
      searchParams,
      hrSuccessionNotificationsSearchParam,
    ),
    lifecycleRecommendationsSearch: readSearchParam(
      searchParams,
      hrSuccessionLifecycleRecommendationsSearchParam,
    ),
    reportsSearch: readSearchParam(searchParams, hrSuccessionReportsSearchParam),
    auditTrailSearch: readSearchParam(
      searchParams,
      hrSuccessionAuditTrailSearchParam,
    ),
    reportGroupBy: reportGroupBySchema.parse(
      readSearchParam(searchParams, hrSuccessionReportGroupByParam),
    ),
  };
}

export const parseHrSuccessionPlanningSearchParams =
  parseHrSuccessionSearchParams;

export type HrSuccessionPageModelInput = {
  organizationId: string;
  visibleEmployeeIds: readonly string[] | null;
  canWrite: boolean;
  canReview: boolean;
  canApprove: boolean;
  canReadAudit: boolean;
  canReadRestricted: boolean;
  canExposeLifecycle: boolean;
} & HrSuccessionSearchParams;

export function toHrSuccessionPageModelInput(input: {
  organizationId: string;
  visibleEmployeeIds?: readonly string[] | null;
  canWrite: boolean;
  canReview?: boolean;
  canApprove: boolean;
  canReadAudit: boolean;
  canReadRestricted: boolean;
  canExposeLifecycle: boolean;
  searchParams?:
    | Record<string, string | string[] | undefined>
    | HrSuccessionSearchParams;
}): HrSuccessionPageModelInput {
  const parsed: HrSuccessionSearchParams =
    input.searchParams && "reportGroupBy" in input.searchParams
      ? (input.searchParams as HrSuccessionSearchParams)
      : parseHrSuccessionSearchParams(input.searchParams);
  return {
    organizationId: input.organizationId,
    visibleEmployeeIds: input.visibleEmployeeIds ?? null,
    canWrite: input.canWrite,
    canReview: input.canReview ?? input.canApprove,
    canApprove: input.canApprove,
    canReadAudit: input.canReadAudit,
    canReadRestricted: input.canReadRestricted,
    canExposeLifecycle: input.canExposeLifecycle,
    ...parsed,
  };
}

export const toHrSuccessionPlanningPageModelInput =
  toHrSuccessionPageModelInput;
