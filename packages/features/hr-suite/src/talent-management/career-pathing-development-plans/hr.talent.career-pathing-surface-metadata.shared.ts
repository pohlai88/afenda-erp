/** Governed surface keys (HRM career pathing hub). */
export const hrCareerPathingOverviewKpiSurfaceKey =
  "hrm:career-pathing:overview-kpi" as const;
export const hrCareerPathingFrameworksSurfaceKey =
  "hrm:career-pathing:frameworks" as const;
export const hrCareerPathingTargetRolesSurfaceKey =
  "hrm:career-pathing:target-roles" as const;
export const hrCareerPathingSkillGapsSurfaceKey =
  "hrm:career-pathing:skill-gaps" as const;
export const hrCareerPathingPlansSurfaceKey = "hrm:career-pathing:plans" as const;
export const hrCareerPathingPlanGoalsSurfaceKey =
  "hrm:career-pathing:plan-goals" as const;
export const hrCareerPathingLearningActionsSurfaceKey =
  "hrm:career-pathing:learning-actions" as const;
export const hrCareerPathingStretchAssignmentsSurfaceKey =
  "hrm:career-pathing:stretch-assignments" as const;
export const hrCareerPathingReadinessSurfaceKey =
  "hrm:career-pathing:readiness" as const;
export const hrCareerPathingFrameworkStagesSurfaceKey =
  "hrm:career-pathing:framework-stages" as const;
export const hrCareerPathingDiscussionsSurfaceKey =
  "hrm:career-pathing:discussions" as const;

export const HR_CAREER_PATHING_GOVERNED_SURFACE_KEYS = [
  hrCareerPathingOverviewKpiSurfaceKey,
  hrCareerPathingFrameworksSurfaceKey,
  hrCareerPathingTargetRolesSurfaceKey,
  hrCareerPathingSkillGapsSurfaceKey,
  hrCareerPathingPlansSurfaceKey,
  hrCareerPathingPlanGoalsSurfaceKey,
  hrCareerPathingLearningActionsSurfaceKey,
  hrCareerPathingStretchAssignmentsSurfaceKey,
  hrCareerPathingReadinessSurfaceKey,
  hrCareerPathingFrameworkStagesSurfaceKey,
  hrCareerPathingDiscussionsSurfaceKey,
] as const;

export type HrCareerPathingGovernedSurfaceKey =
  (typeof HR_CAREER_PATHING_GOVERNED_SURFACE_KEYS)[number];

export const hrCareerPathingFrameworksColumnsId =
  "hr.talent.career-pathing.frameworks.columns";
export const hrCareerPathingFrameworkStagesColumnsId =
  "hr.talent.career-pathing.framework-stages.columns";
export const hrCareerPathingTargetRolesColumnsId =
  "hr.talent.career-pathing.target-roles.columns";
export const hrCareerPathingSkillGapsColumnsId =
  "hr.talent.career-pathing.skill-gaps.columns";
export const hrCareerPathingPlansColumnsId =
  "hr.talent.career-pathing.plans.columns";
export const hrCareerPathingPlanGoalsColumnsId =
  "hr.talent.career-pathing.plan-goals.columns";
export const hrCareerPathingLearningActionsColumnsId =
  "hr.talent.career-pathing.learning-actions.columns";
export const hrCareerPathingStretchAssignmentsColumnsId =
  "hr.talent.career-pathing.stretch-assignments.columns";
export const hrCareerPathingReadinessColumnsId =
  "hr.talent.career-pathing.readiness.columns";
export const hrCareerPathingDiscussionsColumnsId =
  "hr.talent.career-pathing.discussions.columns";

export const hrCareerPathingFrameworksSearchParam = "careerFrameworksSearch";
export const hrCareerPathingPlansSearchParam = "careerPlansSearch";
export const hrCareerPathingSkillGapsSearchParam = "careerSkillGapsSearch";
export const hrCareerPathingPlanGoalsSearchParam = "careerPlanGoalsSearch";
export const hrCareerPathingReadinessSearchParam = "careerReadinessSearch";
export const hrCareerPathingEmployeeIdSearchParam = "employeeId";
export const hrCareerPathingPlanIdSearchParam = "planId";
export const hrCareerPathingFrameworkIdSearchParam = "frameworkId";
