export const HR_SUCCESSION_BUSINESS_IMPACTS = [
  "critical",
  "high",
  "medium",
  "low",
] as const;

export type HrSuccessionBusinessImpact =
  (typeof HR_SUCCESSION_BUSINESS_IMPACTS)[number];

export const HR_SUCCESSION_LEADERSHIP_LEVELS = [
  "executive",
  "senior_leadership",
  "people_leader",
  "specialist",
] as const;

export type HrSuccessionLeadershipLevel =
  (typeof HR_SUCCESSION_LEADERSHIP_LEVELS)[number];

export const HR_SUCCESSION_VACANCY_RISKS = [
  "critical",
  "high",
  "medium",
  "low",
] as const;

export type HrSuccessionVacancyRisk =
  (typeof HR_SUCCESSION_VACANCY_RISKS)[number];

export const HR_SUCCESSION_REPLACEMENT_DIFFICULTIES = [
  "hard",
  "moderate",
  "low",
] as const;

export type HrSuccessionReplacementDifficulty =
  (typeof HR_SUCCESSION_REPLACEMENT_DIFFICULTIES)[number];

export const HR_SUCCESSION_SUCCESSOR_TYPES = [
  "primary",
  "secondary",
  "emergency",
  "long_term",
] as const;

export type HrSuccessionSuccessorType =
  (typeof HR_SUCCESSION_SUCCESSOR_TYPES)[number];

export const HR_SUCCESSION_READINESS_LEVELS = [
  "ready_now",
  "ready_within_1_year",
  "ready_2_3_years",
  "future_potential",
] as const;

export type HrSuccessionReadinessLevel =
  (typeof HR_SUCCESSION_READINESS_LEVELS)[number];

export const HR_SUCCESSION_POTENTIAL_LEVELS = [
  "exceptional",
  "high",
  "solid",
  "emerging",
  "watch",
] as const;

export type HrSuccessionPotentialLevel =
  (typeof HR_SUCCESSION_POTENTIAL_LEVELS)[number];

export const HR_SUCCESSION_PERFORMANCE_GRID_CELLS = [
  "star",
  "high_potential",
  "strong_performer",
  "core_talent",
  "developing",
  "risk",
] as const;

export type HrSuccessionPerformanceGridCell =
  (typeof HR_SUCCESSION_PERFORMANCE_GRID_CELLS)[number];

export const HR_SUCCESSION_RETENTION_RISKS = [
  "critical",
  "high",
  "medium",
  "low",
] as const;

export type HrSuccessionRetentionRisk =
  (typeof HR_SUCCESSION_RETENTION_RISKS)[number];

export const HR_SUCCESSION_DEVELOPMENT_ACTION_KINDS = [
  "training",
  "mentoring",
  "coaching",
  "stretch_assignment",
  "leadership_exposure",
] as const;

export type HrSuccessionDevelopmentActionKind =
  (typeof HR_SUCCESSION_DEVELOPMENT_ACTION_KINDS)[number];

export const HR_SUCCESSION_DEVELOPMENT_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "overdue",
  "blocked",
] as const;

export type HrSuccessionDevelopmentStatus =
  (typeof HR_SUCCESSION_DEVELOPMENT_STATUSES)[number];

export const HR_SUCCESSION_TALENT_POOL_TYPES = [
  "high_potential",
  "leadership_candidate",
  "specialist",
] as const;

export type HrSuccessionTalentPoolType =
  (typeof HR_SUCCESSION_TALENT_POOL_TYPES)[number];

export const HR_SUCCESSION_CALIBRATION_REVIEWERS = [
  "hr",
  "manager",
  "leadership_committee",
] as const;

export type HrSuccessionCalibrationReviewer =
  (typeof HR_SUCCESSION_CALIBRATION_REVIEWERS)[number];

export const HR_SUCCESSION_CALIBRATION_OUTCOMES = [
  "approved",
  "approved_with_development",
  "deferred",
  "rejected",
] as const;

export type HrSuccessionCalibrationOutcome =
  (typeof HR_SUCCESSION_CALIBRATION_OUTCOMES)[number];

export const HR_SUCCESSION_REPLACEMENT_PLAN_TYPES = [
  "emergency",
  "planned",
] as const;

export type HrSuccessionReplacementPlanType =
  (typeof HR_SUCCESSION_REPLACEMENT_PLAN_TYPES)[number];

export const HR_SUCCESSION_NOTIFICATION_TYPES = [
  "missing_successor",
  "overdue_review",
  "development_gap",
] as const;

export type HrSuccessionNotificationType =
  (typeof HR_SUCCESSION_NOTIFICATION_TYPES)[number];

export const HR_SUCCESSION_RECOMMENDATION_MOVEMENT_TYPES = [
  "promotion",
  "lateral_move",
  "acting_assignment",
] as const;

export type HrSuccessionRecommendationMovementType =
  (typeof HR_SUCCESSION_RECOMMENDATION_MOVEMENT_TYPES)[number];

export const HR_SUCCESSION_RISK_LEVELS = [
  "critical",
  "high",
  "medium",
  "low",
] as const;

export type HrSuccessionRiskLevel =
  (typeof HR_SUCCESSION_RISK_LEVELS)[number];

export const HR_SUCCESSION_REPORT_GROUP_BY = [
  "role",
  "department",
  "job_family",
  "legal_entity",
  "leadership_level",
  "readiness",
  "risk",
  "bench_strength",
] as const;

export type HrSuccessionReportGroupBy =
  (typeof HR_SUCCESSION_REPORT_GROUP_BY)[number];

export const HR_SUCCESSION_READ_CAPABILITY = "hr.succession.read" as const;
export const HR_SUCCESSION_WRITE_CAPABILITY = "hr.succession.write" as const;
export const HR_SUCCESSION_APPROVE_CAPABILITY =
  "hr.succession.approve" as const;
export const HR_SUCCESSION_AUDIT_READ_CAPABILITY =
  "hr.succession.audit.read" as const;
export const HR_SUCCESSION_RESTRICTED_READ_CAPABILITY =
  "hr.succession.restricted.read" as const;
export const HR_SUCCESSION_LIFECYCLE_EXPOSE_CAPABILITY =
  "hr.succession.lifecycle.expose" as const;
