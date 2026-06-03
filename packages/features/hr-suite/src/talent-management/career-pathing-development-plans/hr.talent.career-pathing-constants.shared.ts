/** HRM-CAR-002 — career path progression kinds. */
export const HR_CAREER_PATH_KINDS = [
  "vertical",
  "lateral",
  "specialist",
  "leadership",
  "functional",
  "cross_functional",
] as const;

export type HrCareerPathKind = (typeof HR_CAREER_PATH_KINDS)[number];

export const HR_CAREER_PATH_FRAMEWORK_STATUSES = [
  "draft",
  "active",
  "archived",
] as const;

export type HrCareerPathFrameworkStatus =
  (typeof HR_CAREER_PATH_FRAMEWORK_STATUSES)[number];

/** HRM-CAR-010 — development goal types. */
export const HR_DEVELOPMENT_GOAL_TYPES = [
  "skill",
  "competency",
  "certification",
  "leadership",
  "project",
  "mentoring",
  "coaching",
] as const;

export type HrDevelopmentGoalType = (typeof HR_DEVELOPMENT_GOAL_TYPES)[number];

/** HRM-CAR-012 — development goal lifecycle. */
export const HR_DEVELOPMENT_GOAL_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "overdue",
  "blocked",
  "cancelled",
  "deferred",
] as const;

export type HrDevelopmentGoalStatus =
  (typeof HR_DEVELOPMENT_GOAL_STATUSES)[number];

export const HR_EMPLOYEE_TARGET_ROLE_SOURCES = [
  "employee",
  "manager",
  "hr",
] as const;

export type HrEmployeeTargetRoleSource =
  (typeof HR_EMPLOYEE_TARGET_ROLE_SOURCES)[number];

export const HR_TALENT_CAREER_PATH_READ_CAPABILITY =
  "hr.talent.career_path.read" as const;
export const HR_TALENT_CAREER_PATH_WRITE_CAPABILITY =
  "hr.talent.career_path.write" as const;

export const HR_CAREER_PATHING_AUDIT_PREFIX = "erp.hrm.career_path" as const;
export const HR_CAREER_PATHING_ROUTE_SEGMENT = "career-pathing" as const;

/** HRM-CAR-024 — readiness classification. */
export const HR_CAREER_READINESS_LEVELS = [
  "not_ready",
  "developing",
  "near_ready",
  "ready",
  "role_ready",
] as const;

export type HrCareerReadinessLevel = (typeof HR_CAREER_READINESS_LEVELS)[number];


/** Deep link to Training & Development hub (HRM-CAR-014 / CAR-028). */
export const HR_CAREER_PATHING_TRAINING_ROUTE = "/apps/hrm/training" as const;

export const HR_DEVELOPMENT_LEARNING_ACTION_STATUSES = [
  "planned",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type HrDevelopmentLearningActionStatus =
  (typeof HR_DEVELOPMENT_LEARNING_ACTION_STATUSES)[number];

export const HR_DEVELOPMENT_STRETCH_ASSIGNMENT_KINDS = [
  "project",
  "acting_role",
  "cross_functional",
  "leadership_exposure",
] as const;

export type HrDevelopmentStretchAssignmentKind =
  (typeof HR_DEVELOPMENT_STRETCH_ASSIGNMENT_KINDS)[number];

export const HR_DEVELOPMENT_STRETCH_ASSIGNMENT_STATUSES = [
  "planned",
  "active",
  "completed",
  "cancelled",
] as const;

export type HrDevelopmentStretchAssignmentStatus =
  (typeof HR_DEVELOPMENT_STRETCH_ASSIGNMENT_STATUSES)[number];

export const HR_DEVELOPMENT_SESSION_KINDS = ["mentor", "coach"] as const;

export type HrDevelopmentSessionKind = (typeof HR_DEVELOPMENT_SESSION_KINDS)[number];

export const HR_DEVELOPMENT_MENTOR_COACH_STATUSES = [
  "active",
  "completed",
  "cancelled",
] as const;

export type HrDevelopmentMentorCoachStatus =
  (typeof HR_DEVELOPMENT_MENTOR_COACH_STATUSES)[number];

/** HRM-CAR-029 — report grouping dimensions (extended for CAR-013+ reports). */
export const HR_CAREER_REPORT_GROUP_BY = [
  "employee",
  "manager",
  "department",
  "job_family",
  "target_role",
  "readiness",
  "status",
  "period",
] as const;

export type HrCareerReportGroupBy = (typeof HR_CAREER_REPORT_GROUP_BY)[number];

export const HR_CAREER_REPORT_KINDS = ["readiness", "development", "milestones"] as const;

export type HrCareerReportKind = (typeof HR_CAREER_REPORT_KINDS)[number];
