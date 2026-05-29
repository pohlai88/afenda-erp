export const HRM_UCB_UNION_STATUSES = ["active", "inactive", "archived"] as const

export const HRM_UCB_CBA_STATUSES = [
  "draft",
  "active",
  "expired",
  "terminated",
] as const

export const HRM_UCB_NEGOTIATION_STATUSES = [
  "not_started",
  "in_progress",
  "ratified",
  "failed",
] as const

export const HRM_UCB_MEMBERSHIP_STATUSES = [
  "active",
  "inactive",
  "withdrawn",
  "pending",
] as const

export const HRM_UCB_RULE_DOMAINS = [
  "pay",
  "overtime",
  "leave",
  "work_hours",
  "rest",
  "holiday",
  "allowance",
  "benefit",
  "schedule",
] as const

export const HRM_UCB_SENIORITY_USE_CASES = [
  "shift_preference",
  "ot_priority",
  "layoff",
  "recall",
  "vacation_bid",
  "promotion_consideration",
] as const

export const HRM_UCB_COMPLIANCE_SEVERITIES = [
  "info",
  "warning",
  "critical",
] as const

export const HRM_UCB_DUES_APPROVAL_STATES = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "exported",
] as const

export const HRM_UCB_GRIEVANCE_STATUSES = [
  "submitted",
  "under_review",
  "meeting_scheduled",
  "pending_decision",
  "escalated",
  "resolved",
  "withdrawn",
  "closed",
] as const

export const HRM_UCB_GRIEVANCE_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const

export const HRM_UCB_REPRESENTATIVE_ROLES = [
  "steward",
  "union_rep",
  "officer",
] as const

export const HRM_UCB_LR_MEETING_STATUSES = [
  "scheduled",
  "completed",
  "cancelled",
] as const

export type HrmUcbUnionStatus = (typeof HRM_UCB_UNION_STATUSES)[number]
export type HrmUcbCbaStatus = (typeof HRM_UCB_CBA_STATUSES)[number]
export type HrmUcbRuleDomain = (typeof HRM_UCB_RULE_DOMAINS)[number]
export type HrmUcbGrievanceStatus = (typeof HRM_UCB_GRIEVANCE_STATUSES)[number]
