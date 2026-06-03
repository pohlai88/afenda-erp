import {
  compareEmployeeCurrentRoleToTarget,
  countHrmReadinessByLevel,
  countOverdueHrmDevelopmentMilestones,
  listHrmCareerDiscussionsWindow,
  listHrmCareerPathFrameworksWindow,
  listHrmDevelopmentGoalsWindow,
  listHrmDevelopmentLearningActionsWindow,
  listHrmDevelopmentPlansWindow,
  listHrmDevelopmentSessionsWindow,
  listHrmDevelopmentStretchAssignmentsWindow,
  listHrmEmployeeTargetRolesWindow,
  listSkillGapsForEmployee,
  loadHrmDevelopmentCoachAssignmentForPlan,
  loadHrmDevelopmentMentorAssignmentForPlan,
} from "@afenda/db";

const DEFAULT_PAGE_SIZE = 25;

export async function loadHrCareerPathFrameworksWindow(input: {
  organizationId: string;
  search?: string;
  pageSize?: number;
}) {
  return listHrmCareerPathFrameworksWindow({
    organizationId: input.organizationId,
    search: input.search,
    limit: input.pageSize ?? DEFAULT_PAGE_SIZE,
  });
}

export async function loadHrCareerPathTargetRolesWindow(input: {
  organizationId: string;
  employeeId?: string;
  pageSize?: number;
}) {
  return listHrmEmployeeTargetRolesWindow({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    limit: input.pageSize ?? DEFAULT_PAGE_SIZE,
  });
}

export async function loadHrCareerPathPlansWindow(input: {
  organizationId: string;
  employeeId?: string;
  search?: string;
  pageSize?: number;
}) {
  return listHrmDevelopmentPlansWindow({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    search: input.search,
    limit: input.pageSize ?? DEFAULT_PAGE_SIZE,
  });
}

export async function loadHrCareerPathPlanGoalsWindow(input: {
  organizationId: string;
  planId: string;
  pageSize?: number;
}) {
  return listHrmDevelopmentGoalsWindow({
    organizationId: input.organizationId,
    planId: input.planId,
    limit: input.pageSize ?? DEFAULT_PAGE_SIZE,
  });
}

export async function loadHrCareerPathSkillGapCompare(input: {
  organizationId: string;
  employeeId: string;
  targetRoleId?: string;
}) {
  return listSkillGapsForEmployee({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    targetRoleId: input.targetRoleId,
  });
}

export async function loadHrCareerPathRoleCompare(input: {
  organizationId: string;
  employeeId: string;
  targetRoleId?: string;
}) {
  return compareEmployeeCurrentRoleToTarget({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    targetRoleId: input.targetRoleId,
  });
}

export async function loadHrCareerPathOverviewSnapshot(input: {
  organizationId: string;
}) {
  const [frameworks, targetRoles, plans, overdueMilestones, readinessByLevel] =
    await Promise.all([
      listHrmCareerPathFrameworksWindow({
        organizationId: input.organizationId,
        limit: 1,
      }),
      listHrmEmployeeTargetRolesWindow({
        organizationId: input.organizationId,
        limit: 1,
      }),
      listHrmDevelopmentPlansWindow({
        organizationId: input.organizationId,
        planStatus: "active",
        limit: 1,
      }),
      countOverdueHrmDevelopmentMilestones({
        organizationId: input.organizationId,
      }),
      countHrmReadinessByLevel({
        organizationId: input.organizationId,
      }),
    ]);

  const nearReadyCount =
    (readinessByLevel.near_ready ?? 0) + (readinessByLevel.ready ?? 0);

  return {
    frameworkCount: frameworks.totalCount,
    targetRoleCount: targetRoles.totalCount,
    activePlanCount: plans.totalCount,
    overdueMilestoneCount: overdueMilestones,
    nearReadyCount,
  };
}

export async function loadHrCareerPathLearningActionsWindow(input: {
  organizationId: string;
  planId: string;
  pageSize?: number;
}) {
  return listHrmDevelopmentLearningActionsWindow({
    organizationId: input.organizationId,
    planId: input.planId,
    limit: input.pageSize ?? DEFAULT_PAGE_SIZE,
  });
}

export async function loadHrCareerPathStretchAssignmentsWindow(input: {
  organizationId: string;
  planId: string;
  pageSize?: number;
}) {
  return listHrmDevelopmentStretchAssignmentsWindow({
    organizationId: input.organizationId,
    planId: input.planId,
    limit: input.pageSize ?? DEFAULT_PAGE_SIZE,
  });
}

export async function loadHrCareerPathDiscussionsWindow(input: {
  organizationId: string;
  employeeId?: string;
  pageSize?: number;
}) {
  return listHrmCareerDiscussionsWindow({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    limit: input.pageSize ?? DEFAULT_PAGE_SIZE,
  });
}

export async function loadHrCareerPathDevelopmentSessionsWindow(input: {
  organizationId: string;
  planId: string;
  pageSize?: number;
}) {
  return listHrmDevelopmentSessionsWindow({
    organizationId: input.organizationId,
    planId: input.planId,
    limit: input.pageSize ?? DEFAULT_PAGE_SIZE,
  });
}

export {
  loadHrmDevelopmentCoachAssignmentForPlan,
  loadHrmDevelopmentMentorAssignmentForPlan,
};
