import {
  buildHrCareerPathFrameworksListSurface,
  buildHrCareerPathPlanGoalsListSurface,
  buildHrCareerPathPlansListSurface,
  buildHrCareerPathSkillGapsListSurface,
  buildHrCareerPathTargetRolesListSurface,
} from "./hr.talent.career-pathing-lists.surface";
import { buildHrCareerPathOverviewStatGrid } from "./hr.talent.career-pathing-overview-stat.surface";
import {
  loadHrCareerPathFrameworksWindow,
  loadHrCareerPathOverviewSnapshot,
  loadHrCareerPathPlanGoalsWindow,
  loadHrCareerPathPlansWindow,
  loadHrCareerPathRoleCompare,
  loadHrCareerPathSkillGapCompare,
  loadHrCareerPathTargetRolesWindow,
} from "./hrs-hr-talent-career-pathing-queries-server";
import type { HrCareerPathPageModelInput } from "./hr.talent.career-pathing-search-params.parse.shared";

export type HrCareerPathFoundationPageModel = {
  overview: ReturnType<typeof buildHrCareerPathOverviewStatGrid>;
  frameworks: ReturnType<typeof buildHrCareerPathFrameworksListSurface>;
  targetRoles: ReturnType<typeof buildHrCareerPathTargetRolesListSurface>;
  skillGaps: ReturnType<typeof buildHrCareerPathSkillGapsListSurface>;
  plans: ReturnType<typeof buildHrCareerPathPlansListSurface>;
  planGoals: ReturnType<typeof buildHrCareerPathPlanGoalsListSurface> | null;
  roleCompare: Awaited<ReturnType<typeof loadHrCareerPathRoleCompare>> | null;
  gapCompare: Awaited<ReturnType<typeof loadHrCareerPathSkillGapCompare>> | null;
};

export async function buildHrCareerPathPageModel(
  input: HrCareerPathPageModelInput,
): Promise<HrCareerPathFoundationPageModel> {
  const pageSize = input.pageSize ?? 25;
  const employeeId = input.search.employeeId;
  const planId = input.search.planId;

  const [
    overviewSnapshot,
    frameworksWindow,
    targetRolesWindow,
    plansWindow,
    roleCompare,
    gapCompare,
    planGoalsWindow,
  ] = await Promise.all([
    loadHrCareerPathOverviewSnapshot({ organizationId: input.organizationId }),
    loadHrCareerPathFrameworksWindow({
      organizationId: input.organizationId,
      search: input.search.careerFrameworksSearch,
      pageSize,
    }),
    loadHrCareerPathTargetRolesWindow({
      organizationId: input.organizationId,
      employeeId,
      pageSize,
    }),
    loadHrCareerPathPlansWindow({
      organizationId: input.organizationId,
      search: input.search.careerPlansSearch,
      pageSize,
    }),
    employeeId
      ? loadHrCareerPathRoleCompare({
          organizationId: input.organizationId,
          employeeId,
        })
      : Promise.resolve(null),
    employeeId
      ? loadHrCareerPathSkillGapCompare({
          organizationId: input.organizationId,
          employeeId,
        })
      : Promise.resolve(null),
    planId
      ? loadHrCareerPathPlanGoalsWindow({
          organizationId: input.organizationId,
          planId,
          pageSize,
        })
      : Promise.resolve(null),
  ]);

  return {
    overview: buildHrCareerPathOverviewStatGrid({ snapshot: overviewSnapshot }),
    frameworks: buildHrCareerPathFrameworksListSurface({
      window: { ...frameworksWindow, rows: [...frameworksWindow.rows] },
      searchValue: input.search.careerFrameworksSearch,
    }),
    targetRoles: buildHrCareerPathTargetRolesListSurface({
      window: { ...targetRolesWindow, rows: [...targetRolesWindow.rows] },
    }),
    skillGaps: buildHrCareerPathSkillGapsListSurface({
      gapCompare,
      roleCompare,
      searchValue: input.search.careerSkillGapsSearch,
    }),
    plans: buildHrCareerPathPlansListSurface({
      window: { ...plansWindow, rows: [...plansWindow.rows] },
      searchValue: input.search.careerPlansSearch,
    }),
    planGoals: planGoalsWindow
      ? buildHrCareerPathPlanGoalsListSurface({
          window: { ...planGoalsWindow, rows: [...planGoalsWindow.rows] },
          canWrite: input.canWrite,
        })
      : null,
    roleCompare,
    gapCompare,
  };
}

export type HrCareerPathPageModel = HrCareerPathFoundationPageModel;
