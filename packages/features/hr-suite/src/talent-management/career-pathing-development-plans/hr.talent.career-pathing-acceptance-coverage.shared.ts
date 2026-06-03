/** HRM-CAR-001 … HRM-CAR-031 requirement coverage (code-verified). */
export type CareerPathingCoverageStatus = "shipped" | "partial" | "deferred";

export type CareerPathingRequirementCoverage = {
  readonly code: `HRM-CAR-${string}`;
  readonly status: CareerPathingCoverageStatus;
  readonly evidence: readonly string[];
};

export const CAREER_PATHING_REQUIREMENT_COVERAGE: readonly CareerPathingRequirementCoverage[] = [
  { code: "HRM-CAR-001", status: "shipped", evidence: [
    "packages/db/src/schema/hr-career-pathing.ts (hrm_career_path_framework)",
    "packages/db/src/hr-career-pathing-foundation.ts (upsertHrmCareerPathFrameworkInTx)",
    "packages/features/hr-suite/.../actions/hr.talent.career-pathing.actions.server.ts (upsertCareerPathFrameworkAction)",
    "packages/features/hr-suite/.../surface/hr.talent.career-pathing-lists.surface.ts (frameworks list)",
  ] },
  { code: "HRM-CAR-002", status: "shipped", evidence: [
    "packages/db/src/schema/hr-career-pathing.ts (hr_career_path_kind enum)",
    "packages/features/hr-suite/.../schemas/hr.talent.career-pathing-constants.shared.ts (HR_CAREER_PATH_KINDS)",
  ] },
  { code: "HRM-CAR-003", status: "shipped", evidence: [
    "packages/db/src/hr-career-pathing-foundation.ts (upsertHrmEmployeeCareerAspirationInTx)",
    "packages/features/hr-suite/.../actions/hr.talent.career-pathing.actions.server.ts (upsertEmployeeCareerAspirationAction)",
  ] },
  { code: "HRM-CAR-004", status: "shipped", evidence: [
    "packages/db/src/schema/hr-career-pathing.ts (hr_employee_target_role_source enum)",
    "packages/features/hr-suite/.../policies/hr.talent.career-pathing-access.policy.server.ts (assertCanRecommendTargetRole)",
    "packages/features/hr-suite/.../actions/hr.talent.career-pathing.actions.server.ts (recommendEmployeeTargetRoleAction)",
  ] },
  { code: "HRM-CAR-005", status: "shipped", evidence: [
    "packages/db/src/schema/hr-career-pathing.ts (hrm_employee_target_role jobFamily, grade, departmentId, positionId)",
    "packages/features/hr-suite/.../schemas/hr.talent.career-pathing-target-role.schema.ts",
    "packages/features/hr-suite/.../surface/hr.talent.career-pathing-lists.surface.ts (target-roles list)",
  ] },
  { code: "HRM-CAR-006", status: "shipped", evidence: [
    "packages/db/src/hr-career-pathing-foundation.ts (compareEmployeeCurrentRoleToTarget)",
    "packages/features/hr-suite/.../data/hr.talent.career-pathing-queries.server.ts (loadHrCareerPathRoleCompare)",
    "packages/features/hr-suite/.../surface/hr.talent.career-pathing-lists.surface.ts (structure gap rows)",
  ] },
  { code: "HRM-CAR-007", status: "shipped", evidence: [
    "packages/db/src/hr-career-pathing-foundation.ts (listSkillGapsForEmployee, loadEmployeeSkillProficiencyMap via hr_csf_employee_skill_profiles)",
    "packages/features/hr-suite/.../data/hr.talent.career-pathing-queries.server.ts (loadHrCareerPathSkillGapCompare)",
  ] },
  { code: "HRM-CAR-008", status: "shipped", evidence: [
    "packages/db/src/hr-career-pathing-foundation.ts (buildCompetencyGapRows, loadEmployeeCompetencyProficiencyMap)",
    "packages/features/hr-suite/.../surface/hr.talent.career-pathing-lists.surface.ts (competency gap rows)",
  ] },
  { code: "HRM-CAR-009", status: "shipped", evidence: [
    "packages/db/src/hr-career-pathing-foundation.ts (createHrmDevelopmentPlanInTx)",
    "packages/features/hr-suite/.../actions/hr.talent.career-pathing.actions.server.ts (createDevelopmentPlanAction)",
    "packages/features/hr-suite/.../surface/hr.talent.career-pathing-lists.surface.ts (plans list)",
  ] },
  { code: "HRM-CAR-010", status: "shipped", evidence: [
    "packages/db/src/schema/hr-career-pathing.ts (hr_development_goal_type enum)",
    "packages/features/hr-suite/.../schemas/hr.talent.career-pathing-constants.shared.ts (HR_DEVELOPMENT_GOAL_TYPES)",
    "packages/features/hr-suite/.../actions/hr.talent.career-pathing.actions.server.ts (createDevelopmentGoalAction)",
  ] },
  { code: "HRM-CAR-011", status: "shipped", evidence: [
    "packages/db/src/hr-career-pathing-foundation.ts (createHrmDevelopmentMilestoneInTx)",
    "packages/features/hr-suite/.../actions/hr.talent.career-pathing.actions.server.ts (createDevelopmentMilestoneAction)",
  ] },
  { code: "HRM-CAR-012", status: "shipped", evidence: [
    "packages/db/src/schema/hr-career-pathing.ts (hr_development_goal_status enum)",
    "packages/features/hr-suite/.../schemas/hr.talent.career-pathing-constants.shared.ts (HR_DEVELOPMENT_GOAL_STATUSES)",
    "packages/features/hr-suite/.../actions/hr.talent.career-pathing.actions.server.ts (updateDevelopmentGoalStatusAction)",
    "packages/features/hr-suite/.../surface/hr.talent.career-pathing-lists.surface.ts (plan-goals Pattern C trailing)",
  ] },
  { code: "HRM-CAR-013", status: "shipped", evidence: ["packages/db/src/hr-career-pathing-assignments.ts (createHrmDevelopmentLearningActionInTx)"] },
  { code: "HRM-CAR-014", status: "shipped", evidence: ["packages/db/src/schema/hr-career-pathing.ts (hrm_development_learning_action trainingCourseId)"] },
  { code: "HRM-CAR-015", status: "shipped", evidence: ["packages/db/src/hr-career-pathing-assignments.ts (assignHrmDevelopmentMentorInTx)"] },
  { code: "HRM-CAR-016", status: "shipped", evidence: ["packages/db/src/hr-career-pathing-assignments.ts (assignHrmDevelopmentCoachInTx)"] },
  { code: "HRM-CAR-017", status: "shipped", evidence: ["packages/db/src/hr-career-pathing-assignments.ts (createHrmDevelopmentSessionInTx)"] },
  { code: "HRM-CAR-018", status: "shipped", evidence: ["packages/db/src/hr-career-pathing-assignments.ts (createHrmDevelopmentStretchAssignmentInTx)"] },
  { code: "HRM-CAR-019", status: "shipped", evidence: ["packages/db/src/hr-career-pathing-foundation.ts (updateHrmDevelopmentGoalStatusInTx)"] },
  { code: "HRM-CAR-020", status: "shipped", evidence: ["packages/db/src/schema/hr-career-pathing.ts (hrm_development_plan managerReviewedAt)"] },
  { code: "HRM-CAR-021", status: "shipped", evidence: ["packages/db/src/hr-career-pathing-assignments.ts (createHrmCareerDiscussionInTx)"] },
  { code: "HRM-CAR-022", status: "shipped", evidence: ["packages/db/src/schema/hr-career-pathing.ts (hrm_career_discussion participants, nextReviewDate)"] },
  {
    code: "HRM-CAR-023",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.talent.career-pathing-readiness.shared.ts (computeCareerPathReadiness)",
      "packages/features/hr-suite/.../data/hr.talent.career-pathing-readiness.server.ts (computeAndPersistEmployeeReadiness)",
      "packages/features/hr-suite/.../surface/hr.talent.career-pathing-readiness-list.surface.ts",
    ],
  },
  {
    code: "HRM-CAR-024",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr-career-pathing.ts (hr_employee_readiness_level enum)",
      "packages/features/hr-suite/.../data/hr.talent.career-pathing-readiness.shared.ts (classifyCareerPathReadinessLevel)",
    ],
  },
  {
    code: "HRM-CAR-025",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-career-pathing-foundation.ts (listHrmCareerPathingDueForNotification)",
      "packages/features/hr-suite/.../data/hr.talent.career-pathing-notification.server.ts (syncHrCareerPathingDueNotifications)",
      "packages/features/hr-suite/.../actions/hr.talent.career-pathing.actions.server.ts (syncCareerPathingDueNotificationsAction)",
    ],
  },
  {
    code: "HRM-CAR-026",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-career-pathing-foundation.ts (listDevelopmentPlanRefsForAppraisal)",
      "packages/features/hr-suite/.../data/hr.talent.career-pathing-integration.server.ts (listCareerPathDevelopmentPlanRefsForAppraisal)",
    ],
  },
  {
    code: "HRM-CAR-027",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-career-pathing-foundation.ts (listReadinessRefsForSuccession)",
      "packages/features/hr-suite/.../data/hr.talent.career-pathing-integration.server.ts (listReadinessRefsForSuccessionPlanning)",
      "packages/features/hr-suite/.../policies/hr.talent.career-pathing-access.policy.server.ts (canExposeSuccession)",
    ],
  },
  {
    code: "HRM-CAR-028",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-career-pathing-foundation.ts (listDevelopmentLearningRefsForEmployee)",
      "packages/features/hr-suite/.../data/hr.talent.career-pathing-integration.server.ts (listDevelopmentLearningRefsForEmployeeTraining)",
    ],
  },
  {
    code: "HRM-CAR-029",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.talent.career-pathing.reports.shared.ts",
      "packages/features/hr-suite/.../data/hr.talent.career-pathing-reports.server.ts (buildHrCareerPathingReportRows)",
      "packages/features/hr-suite/.../surface/hr.talent.career-pathing-reports-list.surface.ts",
    ],
  },
  {
    code: "HRM-CAR-030",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../policies/hr.talent.career-pathing-access.policy.server.ts",
      "packages/auth/src/index.ts (hr.talent.career_path.read, hr.talent.career_path.write)",
    ],
  },
  {
    code: "HRM-CAR-031",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../events/hr.talent.career-pathing.event.ts",
      "packages/features/hr-suite/.../data/hr.talent.career-pathing-audit.server.ts",
      "packages/features/hr-suite/.../surface/hr.talent.career-pathing-audit-trail-list.surface.ts",
    ],
  },
];

export const CAREER_PATHING_ACCEPTANCE_CRITERIA_COVERAGE = [
  { criterion: 1, requirements: ["HRM-CAR-001", "HRM-CAR-002"], status: "shipped" as const },
  { criterion: 2, requirements: ["HRM-CAR-003"], status: "shipped" as const },
  { criterion: 3, requirements: ["HRM-CAR-004"], status: "shipped" as const },
  { criterion: 4, requirements: ["HRM-CAR-005"], status: "shipped" as const },
  { criterion: 5, requirements: ["HRM-CAR-006", "HRM-CAR-007", "HRM-CAR-008"], status: "shipped" as const },
  { criterion: 6, requirements: ["HRM-CAR-007"], status: "shipped" as const },
  { criterion: 7, requirements: ["HRM-CAR-008"], status: "shipped" as const },
  { criterion: 8, requirements: ["HRM-CAR-009"], status: "shipped" as const },
  { criterion: 9, requirements: ["HRM-CAR-010"], status: "shipped" as const },
  { criterion: 10, requirements: ["HRM-CAR-011"], status: "shipped" as const },
  { criterion: 11, requirements: ["HRM-CAR-012"], status: "shipped" as const },
  { criterion: 12, requirements: ["HRM-CAR-013"], status: "shipped" as const },
  { criterion: 13, requirements: ["HRM-CAR-014"], status: "shipped" as const },
  { criterion: 14, requirements: ["HRM-CAR-015"], status: "shipped" as const },
  { criterion: 15, requirements: ["HRM-CAR-016"], status: "shipped" as const },
  { criterion: 16, requirements: ["HRM-CAR-017"], status: "shipped" as const },
  { criterion: 17, requirements: ["HRM-CAR-018"], status: "shipped" as const },
  { criterion: 18, requirements: ["HRM-CAR-019"], status: "shipped" as const },
  { criterion: 19, requirements: ["HRM-CAR-020"], status: "shipped" as const },
  { criterion: 20, requirements: ["HRM-CAR-021", "HRM-CAR-022"], status: "shipped" as const },
  { criterion: 21, requirements: ["HRM-CAR-023"], status: "shipped" as const },
  { criterion: 22, requirements: ["HRM-CAR-024"], status: "shipped" as const },
  { criterion: 23, requirements: ["HRM-CAR-025"], status: "shipped" as const },
  { criterion: 24, requirements: ["HRM-CAR-026"], status: "shipped" as const },
  { criterion: 25, requirements: ["HRM-CAR-027"], status: "shipped" as const },
  { criterion: 26, requirements: ["HRM-CAR-028"], status: "shipped" as const },
  { criterion: 27, requirements: ["HRM-CAR-029"], status: "shipped" as const },
  { criterion: 28, requirements: ["HRM-CAR-030"], status: "shipped" as const },
  { criterion: 29, requirements: ["HRM-CAR-031"], status: "shipped" as const },
] as const;

export function assertCareerPathingCoverageComplete(): void {
  const incomplete = CAREER_PATHING_REQUIREMENT_COVERAGE.filter(
    (row) => row.status !== "shipped",
  );
  if (incomplete.length > 0) {
    throw new Error(
      `Career pathing coverage incomplete: ${incomplete.map((row) => row.code).join(", ")}`,
    );
  }
}

export function assertCareerPathingAcceptanceCriteriaComplete(): void {
  const incomplete = CAREER_PATHING_ACCEPTANCE_CRITERIA_COVERAGE.filter(
    (row) => row.status !== "shipped",
  );
  if (incomplete.length > 0) {
    throw new Error(
      `Career pathing acceptance criteria incomplete: ${incomplete.map((row) => row.criterion).join(", ")}`,
    );
  }
}
