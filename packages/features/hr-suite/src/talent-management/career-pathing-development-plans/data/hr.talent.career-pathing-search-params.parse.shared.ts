import {
  hrCareerPathingEmployeeIdSearchParam,
  hrCareerPathingFrameworkIdSearchParam,
  hrCareerPathingFrameworksSearchParam,
  hrCareerPathingPlanGoalsSearchParam,
  hrCareerPathingPlanIdSearchParam,
  hrCareerPathingPlansSearchParam,
  hrCareerPathingReadinessSearchParam,
  hrCareerPathingSkillGapsSearchParam,
  hrCareerPathingFrameworksSurfaceKey,
  hrCareerPathingOverviewKpiSurfaceKey,
  hrCareerPathingPlanGoalsSurfaceKey,
  hrCareerPathingPlansSurfaceKey,
  hrCareerPathingSkillGapsSurfaceKey,
  hrCareerPathingTargetRolesSurfaceKey,
} from "../surface/hr.talent.career-pathing-surface-metadata.shared";
import { hrCareerPathingAuditTrailSurfaceKey } from "../surface/hr.talent.career-pathing-audit-trail-list.surface";
import { hrCareerPathingReadinessSurfaceKey } from "../surface/hr.talent.career-pathing-readiness-list.surface";
import { hrCareerPathingReportsSurfaceKey } from "../surface/hr.talent.career-pathing-reports-list.surface";

export {
  hrCareerPathingEmployeeIdSearchParam,
  hrCareerPathingFrameworkIdSearchParam,
  hrCareerPathingFrameworksSearchParam,
  hrCareerPathingPlanGoalsSearchParam,
  hrCareerPathingPlanIdSearchParam,
  hrCareerPathingPlansSearchParam,
  hrCareerPathingReadinessSearchParam,
  hrCareerPathingSkillGapsSearchParam,
  hrCareerPathingFrameworksSurfaceKey,
  hrCareerPathingOverviewKpiSurfaceKey,
  hrCareerPathingPlanGoalsSurfaceKey,
  hrCareerPathingPlansSurfaceKey,
  hrCareerPathingSkillGapsSurfaceKey,
  hrCareerPathingTargetRolesSurfaceKey,
  hrCareerPathingReadinessSurfaceKey,
  hrCareerPathingReportsSurfaceKey,
  hrCareerPathingAuditTrailSurfaceKey as hrCareerPathingAuditSurfaceKey,
};

/** @deprecated Use `hrCareerPathing*SearchParam` names. */
export const hrCareerPathFrameworksSearchParam = hrCareerPathingFrameworksSearchParam;
export const hrCareerPathPlansSearchParam = hrCareerPathingPlansSearchParam;
export const hrCareerPathSkillGapsSearchParam = hrCareerPathingSkillGapsSearchParam;

/** @deprecated Use `hrCareerPathing*SurfaceKey` names. */
export const hrCareerPathFrameworksSurfaceKey = hrCareerPathingFrameworksSurfaceKey;
export const hrCareerPathOverviewKpiSurfaceKey = hrCareerPathingOverviewKpiSurfaceKey;
export const hrCareerPathPlanGoalsSurfaceKey = hrCareerPathingPlanGoalsSurfaceKey;
export const hrCareerPathPlansSurfaceKey = hrCareerPathingPlansSurfaceKey;
export const hrCareerPathSkillGapsSurfaceKey = hrCareerPathingSkillGapsSurfaceKey;
export const hrCareerPathTargetRolesSurfaceKey = hrCareerPathingTargetRolesSurfaceKey;

export const hrCareerPathingReportsSearchParam = "careerReportsSearch" as const;
export const hrCareerPathingAuditSearchParam = "careerAuditSearch" as const;
export const hrCareerPathingReportGroupByParam = "careerReportGroupBy" as const;

export const HR_CAREER_PATHING_LIST_SURFACE_KEYS = [
  hrCareerPathingOverviewKpiSurfaceKey,
  hrCareerPathingFrameworksSurfaceKey,
  hrCareerPathingTargetRolesSurfaceKey,
  hrCareerPathingSkillGapsSurfaceKey,
  hrCareerPathingPlansSurfaceKey,
  hrCareerPathingPlanGoalsSurfaceKey,
  hrCareerPathingReadinessSurfaceKey,
  hrCareerPathingReportsSurfaceKey,
  hrCareerPathingAuditTrailSurfaceKey,
] as const;

export type HrCareerPathingListSurfaceKey =
  (typeof HR_CAREER_PATHING_LIST_SURFACE_KEYS)[number];

export type HrCareerPathingSearchParams = {
  careerFrameworksSearch?: string;
  careerPlansSearch?: string;
  careerSkillGapsSearch?: string;
  careerPlanGoalsSearch?: string;
  careerReadinessSearch?: string;
  careerReportsSearch?: string;
  careerAuditSearch?: string;
  careerReportGroupBy?: string;
  employeeId?: string;
  planId?: string;
  frameworkId?: string;
};

/** @deprecated Use `HrCareerPathingSearchParams`. */
export type HrCareerPathSearchParams = HrCareerPathingSearchParams;

function readSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parseHrCareerPathingSearchParams(
  params: Record<string, string | string[] | undefined>,
): HrCareerPathingSearchParams {
  return {
    careerFrameworksSearch: readSearchParam(params, hrCareerPathingFrameworksSearchParam),
    careerPlansSearch: readSearchParam(params, hrCareerPathingPlansSearchParam),
    careerSkillGapsSearch: readSearchParam(params, hrCareerPathingSkillGapsSearchParam),
    careerPlanGoalsSearch: readSearchParam(params, hrCareerPathingPlanGoalsSearchParam),
    careerReadinessSearch: readSearchParam(params, hrCareerPathingReadinessSearchParam),
    careerReportsSearch: readSearchParam(params, hrCareerPathingReportsSearchParam),
    careerAuditSearch: readSearchParam(params, hrCareerPathingAuditSearchParam),
    careerReportGroupBy: readSearchParam(params, hrCareerPathingReportGroupByParam),
    employeeId: readSearchParam(params, hrCareerPathingEmployeeIdSearchParam),
    planId: readSearchParam(params, hrCareerPathingPlanIdSearchParam),
    frameworkId: readSearchParam(params, hrCareerPathingFrameworkIdSearchParam),
  };
}

/** @deprecated Use `parseHrCareerPathingSearchParams`. */
export const parseHrCareerPathSearchParams = parseHrCareerPathingSearchParams;

/** @deprecated Use `parseHrCareerPathingSearchParams`. */
export const parseHrTalentCareerPathingSearchParams = parseHrCareerPathingSearchParams;

export type HrTalentCareerPathingPageModelInput = {
  organizationId: string;
  actorAuthUserId: string;
  canWrite: boolean;
  search: HrCareerPathingSearchParams;
  pageSize?: number;
};

/** @deprecated Use `HrTalentCareerPathingPageModelInput`. */
export type HrCareerPathPageModelInput = HrTalentCareerPathingPageModelInput;

export function toHrCareerPathingPageModelInput(input: {
  organizationId: string;
  actorAuthUserId: string;
  canWrite: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
  pageSize?: number;
}): HrTalentCareerPathingPageModelInput {
  return {
    organizationId: input.organizationId,
    actorAuthUserId: input.actorAuthUserId,
    canWrite: input.canWrite,
    search: parseHrCareerPathingSearchParams(input.searchParams ?? {}),
    pageSize: input.pageSize,
  };
}

/** @deprecated Use `toHrCareerPathingPageModelInput`. */
export const toHrCareerPathPageModelInput = toHrCareerPathingPageModelInput;

/** @deprecated Use `toHrCareerPathingPageModelInput`. */
export const toHrTalentCareerPathingPageModelInput = toHrCareerPathingPageModelInput;

export function getHrCareerPathingListSurfaceKeys(): readonly HrCareerPathingListSurfaceKey[] {
  return HR_CAREER_PATHING_LIST_SURFACE_KEYS;
}

/** @deprecated Use `getHrCareerPathingListSurfaceKeys`. */
export const getHrCareerPathListSurfaceKeys = getHrCareerPathingListSurfaceKeys;
