export const HRM_SUCCESSION_BUSINESS_IMPACTS = [
  "low",
  "medium",
  "high",
  "critical",
] as const

export const HRM_SUCCESSION_VACANCY_RISKS = [
  "low",
  "medium",
  "high",
  "critical",
] as const

export const HRM_SUCCESSION_SUCCESSOR_TYPES = [
  "primary",
  "secondary",
  "emergency",
  "long_term",
] as const

export const HRM_SUCCESSION_READINESS_LEVELS = [
  "ready_now",
  "ready_1y",
  "ready_2_3y",
  "future_potential",
] as const

export const HRM_SUCCESSION_POOL_KINDS = [
  "high_potential",
  "leadership",
  "specialist",
] as const

export const HRM_SUCCESSION_REPLACEMENT_KINDS = ["emergency", "planned"] as const

export const HRM_SUCCESSION_RISK_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
] as const

export type HrmSuccessionBusinessImpact =
  (typeof HRM_SUCCESSION_BUSINESS_IMPACTS)[number]

export type HrmSuccessionVacancyRisk = (typeof HRM_SUCCESSION_VACANCY_RISKS)[number]

export type HrmSuccessionPoolKind = (typeof HRM_SUCCESSION_POOL_KINDS)[number]

export type HrmSuccessionRiskLevel = (typeof HRM_SUCCESSION_RISK_LEVELS)[number]

export type HrmSuccessionSuccessorType =
  (typeof HRM_SUCCESSION_SUCCESSOR_TYPES)[number]

export type HrmSuccessionReadinessLevel =
  (typeof HRM_SUCCESSION_READINESS_LEVELS)[number]

export const HRM_SUCCESSION_NOMINATION_STATUSES = [
  "active",
  "withdrawn",
  "approved",
  "rejected",
] as const

export const HRM_SUCCESSION_CALIBRATION_SESSION_STATUSES = [
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const

export const HRM_SUCCESSION_CALIBRATION_OUTCOMES = [
  "pending",
  "confirmed",
  "deferred",
  "removed",
] as const

export const HRM_SUCCESSION_REPLACEMENT_STATUSES = [
  "draft",
  "active",
  "archived",
] as const

export const HRM_SUCCESSION_REVIEW_CYCLE_STATES = [
  "open",
  "in_review",
  "closed",
] as const

export const HRM_SUCCESSION_DEVELOPMENT_LINK_STATUSES = [
  "active",
  "completed",
  "archived",
] as const

export type HrmSuccessionNominationStatus =
  (typeof HRM_SUCCESSION_NOMINATION_STATUSES)[number]

export type HrmSuccessionCalibrationSessionStatus =
  (typeof HRM_SUCCESSION_CALIBRATION_SESSION_STATUSES)[number]

export type HrmSuccessionCalibrationOutcome =
  (typeof HRM_SUCCESSION_CALIBRATION_OUTCOMES)[number]

export type HrmSuccessionReplacementStatus =
  (typeof HRM_SUCCESSION_REPLACEMENT_STATUSES)[number]

export type HrmSuccessionReviewCycleState =
  (typeof HRM_SUCCESSION_REVIEW_CYCLE_STATES)[number]
