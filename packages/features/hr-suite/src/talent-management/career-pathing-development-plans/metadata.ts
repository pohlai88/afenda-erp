export {
  HR_CAREER_PATHING_LIST_SURFACE_KEYS,
  hrCareerPathingFrameworksSearchParam,
  hrCareerPathingPlansSearchParam,
  hrCareerPathingSkillGapsSearchParam,
  hrCareerPathingPlanGoalsSearchParam,
  hrCareerPathingReadinessSearchParam,
  hrCareerPathingReportsSearchParam,
  hrCareerPathingAuditSearchParam,
  hrCareerPathingReportGroupByParam,
  hrCareerPathingFrameworksSurfaceKey,
  hrCareerPathingOverviewKpiSurfaceKey,
  hrCareerPathingTargetRolesSurfaceKey,
  hrCareerPathingSkillGapsSurfaceKey,
  hrCareerPathingPlansSurfaceKey,
  hrCareerPathingPlanGoalsSurfaceKey,
  hrCareerPathingReadinessSurfaceKey,
  hrCareerPathingReportsSurfaceKey,
  hrCareerPathingAuditSurfaceKey,
  hrCareerPathFrameworksSearchParam,
  hrCareerPathPlansSearchParam,
  hrCareerPathSkillGapsSearchParam,
  hrCareerPathFrameworksSurfaceKey,
  hrCareerPathOverviewKpiSurfaceKey,
  hrCareerPathTargetRolesSurfaceKey,
  hrCareerPathSkillGapsSurfaceKey,
  hrCareerPathPlansSurfaceKey,
  hrCareerPathPlanGoalsSurfaceKey,
  parseHrCareerPathingSearchParams,
  parseHrCareerPathSearchParams,
  toHrCareerPathingPageModelInput,
  toHrCareerPathPageModelInput,
  getHrCareerPathingListSurfaceKeys,
  getHrCareerPathListSurfaceKeys,
  type HrCareerPathingListSurfaceKey,
  type HrCareerPathingSearchParams,
  type HrCareerPathSearchParams,
} from "./data/hr.talent.career-pathing-search-params.parse.shared";

export {
  buildHrCareerPathFrameworksListSurface,
  buildHrCareerPathPlanGoalsListSurface,
  buildHrCareerPathPlansListSurface,
  buildHrCareerPathSkillGapsListSurface,
  buildHrCareerPathTargetRolesListSurface,
} from "./surface/hr.talent.career-pathing-lists.surface";

export {
  buildHrCareerPathOverviewStatGrid,
} from "./surface/hr.talent.career-pathing-overview-stat.surface";

export { hrCareerPathOverviewKpiSurfaceKey as hrCareerPathOverviewStatSurfaceKey } from "./data/hr.talent.career-pathing-search-params.parse.shared";

export {
  buildHrCareerPathingReadinessListSurface,
} from "./surface/hr.talent.career-pathing-readiness-list.surface";

export {
  buildHrCareerPathingReportsListSurface,
} from "./surface/hr.talent.career-pathing-reports-list.surface";

export {
  buildHrCareerPathingAuditTrailListSurface,
} from "./surface/hr.talent.career-pathing-audit-trail-list.surface";

export {
  hrTalentCareerPathingUiCopy,
  hrCareerPathingUiCopy,
  hrCareerPathUiCopy,
  hrCareerPathFrameworksColumnsId,
  hrCareerPathTargetRolesColumnsId,
  hrCareerPathSkillGapsColumnsId,
  hrCareerPathPlansColumnsId,
  hrCareerPathPlanGoalsColumnsId,
} from "./surface/hr.talent.career-pathing-ui.copy.shared";

export {
  HR_CAREER_READINESS_LEVELS,
  HR_CAREER_REPORT_GROUP_BY,
  type HrCareerReadinessLevel,
  type HrCareerReportGroupBy,
} from "./schemas/hr.talent.career-pathing-constants.shared";

export {
  CAREER_PATHING_REQUIREMENT_COVERAGE,
  CAREER_PATHING_ACCEPTANCE_CRITERIA_COVERAGE,
  assertCareerPathingCoverageComplete,
  assertCareerPathingAcceptanceCriteriaComplete,
} from "./data/hr.talent.career-pathing-acceptance-coverage.shared";

export const HR_CAREER_PATHING_LIST_SURFACE_COLUMNS_BY_KEY = {
  "hrm:career-pathing:overview-kpi": "hr.talent.career-pathing.overview.columns",
  "hrm:career-pathing:frameworks": "hr.talent.career-pathing.frameworks.columns",
  "hrm:career-pathing:target-roles": "hr.talent.career-pathing.target-roles.columns",
  "hrm:career-pathing:skill-gaps": "hr.talent.career-pathing.skill-gaps.columns",
  "hrm:career-pathing:plans": "hr.talent.career-pathing.plans.columns",
  "hrm:career-pathing:plan-goals": "hr.talent.career-pathing.plan-goals.columns",
  "hr.talent.career-pathing.readiness.list":
    "hr.talent.career-pathing.readiness.columns",
  "hr.talent.career-pathing.reports.list": "hr.talent.career-pathing.reports.columns",
  "hr.talent.career-pathing.audit.list": "hr.talent.career-pathing.audit.columns",
} as const;

export {
  hrTalentCareerPathRoutePaths,
  type HrTalentCareerPathRoutePath,
} from "./contracts/hr.talent.career-pathing.contract";
