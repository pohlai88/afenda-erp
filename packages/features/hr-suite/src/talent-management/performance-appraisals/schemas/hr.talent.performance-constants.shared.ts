export const HR_PER_REVIEW_TYPES = [
  "annual",
  "mid_year",
  "quarterly",
  "probation",
  "project",
  "ad_hoc",
] as const;

export type HrPerReviewType = (typeof HR_PER_REVIEW_TYPES)[number];

export const HR_PER_REVIEW_STATUSES = [
  "draft",
  "pending",
  "goal_setting",
  "self_assessment",
  "manager_evaluation",
  "hr_review",
  "calibration",
  "approved",
  "returned",
  "finalized",
  "acknowledged",
] as const;

export type HrPerReviewStatus = (typeof HR_PER_REVIEW_STATUSES)[number];

export const HR_PER_GOAL_STATUSES = [
  "draft",
  "pending_manager_approval",
  "approved",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type HrPerGoalStatus = (typeof HR_PER_GOAL_STATUSES)[number];

export const HR_PER_MANDATORY_SECTIONS = [
  "goals",
  "self_assessment",
  "manager_evaluation",
  "competency_assessment",
  "kpi_assessment",
  "meeting",
  "hr_review",
  "calibration",
  "acknowledgment",
] as const;

export type HrPerMandatorySection = (typeof HR_PER_MANDATORY_SECTIONS)[number];

export const HR_PER_RECOMMENDATION_TYPES = [
  "development",
  "promotion",
  "compensation_review",
  "performance_improvement",
] as const;

export type HrPerRecommendationType =
  (typeof HR_PER_RECOMMENDATION_TYPES)[number];

export const HR_PER_APPROVAL_ROLES = [
  "employee",
  "manager",
  "hr",
  "calibration_panel",
  "leadership",
  "final_approver",
] as const;

export type HrPerApprovalRole = (typeof HR_PER_APPROVAL_ROLES)[number];

export const HR_PER_NOTIFICATION_EVENTS = [
  "pending",
  "submitted",
  "returned",
  "overdue",
  "acknowledged",
  "finalized",
] as const;

export type HrPerNotificationEvent =
  (typeof HR_PER_NOTIFICATION_EVENTS)[number];

export const HR_PER_REPORT_GROUP_BY = [
  "employee",
  "manager",
  "department",
  "legal_entity",
  "cycle",
  "rating",
  "completion_status",
  "period",
] as const;

export type HrPerReportGroupBy = (typeof HR_PER_REPORT_GROUP_BY)[number];

export const HR_PER_ACCESS_ROLES = [
  "employee",
  "manager",
  "hr",
  "leadership",
  "compensation",
  "auditor",
] as const;

export type HrPerAccessRole = (typeof HR_PER_ACCESS_ROLES)[number];

export const HR_PER_READ_CAPABILITY = "hr.performance.read" as const;
export const HR_PER_WRITE_CAPABILITY = "hr.performance.write" as const;
export const HR_PER_APPROVE_CAPABILITY = "hr.performance.approve" as const;
export const HR_PER_CALIBRATE_CAPABILITY = "hr.performance.calibrate" as const;
export const HR_PER_COMPENSATION_READ_CAPABILITY =
  "hr.performance.compensation.read" as const;
export const HR_PER_AUDIT_READ_CAPABILITY =
  "hr.performance.audit.read" as const;
