import type { AppCapability } from "@afenda/auth";

export const HR_UCB_READ_CAPABILITY = "hr.ucb.read" satisfies AppCapability;
export const HR_UCB_WRITE_CAPABILITY = "hr.ucb.write" satisfies AppCapability;
export const HR_UCB_APPROVE_CAPABILITY =
  "hr.ucb.approve" satisfies AppCapability;
export const HR_UCB_AUDIT_READ_CAPABILITY =
  "hr.ucb.audit.read" satisfies AppCapability;
export const HR_UCB_RESTRICTED_READ_CAPABILITY =
  "hr.ucb.restricted.read" satisfies AppCapability;
export const HR_UCB_GRIEVANCE_MANAGE_CAPABILITY =
  "hr.ucb.grievance.manage" satisfies AppCapability;
export const HR_UCB_LEGAL_REFERENCE_READ_CAPABILITY =
  "hr.ucb.legal-reference.read" satisfies AppCapability;
export const HR_UCB_PAYROLL_EXPOSE_CAPABILITY =
  "hr.ucb.payroll.expose" satisfies AppCapability;
export const HR_UCB_INTEGRATION_EXPOSE_CAPABILITY =
  "hr.ucb.integration.expose" satisfies AppCapability;
export const HR_UCB_REPORT_EXPORT_CAPABILITY =
  "hr.ucb.report.export" satisfies AppCapability;

export const HR_UCB_UNION_STATUSES = [
  "active",
  "inactive",
  "merged",
  "dissolved",
] as const;

export const HR_UCB_CBA_STATUSES = [
  "draft",
  "active",
  "expiring",
  "expired",
  "renegotiation",
  "archived",
] as const;

export const HR_UCB_MEMBERSHIP_STATUSES = [
  "active",
  "pending",
  "resigned",
  "inactive",
  "exempt",
] as const;

export const HR_UCB_RULE_TYPES = [
  "pay",
  "overtime",
  "leave",
  "work_hours",
  "rest_days",
  "holidays",
  "allowances",
  "benefits",
  "scheduling",
] as const;

export const HR_UCB_DOWNSTREAM_TARGETS = [
  "payroll_processing",
  "overtime_management",
  "leave_attendance_management",
  "shift_scheduling",
  "document_management",
  "legal_reference",
] as const;

export const HR_UCB_SENIORITY_DECISION_TYPES = [
  "shift_preference",
  "overtime_priority",
  "layoff_order",
  "recall_order",
  "vacation_bidding",
  "promotion_consideration",
] as const;

export const HR_UCB_CONFLICT_SEVERITIES = [
  "info",
  "warning",
  "blocker",
] as const;

export const HR_UCB_APPROVAL_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "rejected",
] as const;

export const HR_UCB_DUES_STATUSES = [
  "draft",
  "approved",
  "exposed",
  "suspended",
  "expired",
] as const;

export const HR_UCB_GRIEVANCE_CATEGORIES = [
  "discipline",
  "contract_interpretation",
  "scheduling",
  "pay_deduction",
  "seniority",
  "safety",
  "harassment",
] as const;

export const HR_UCB_GRIEVANCE_STATUSES = [
  "submitted",
  "under_review",
  "meeting_scheduled",
  "pending_decision",
  "escalated",
  "resolved",
  "withdrawn",
  "closed",
] as const;

export const HR_UCB_GRIEVANCE_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const HR_UCB_DISPUTE_TYPES = [
  "grievance",
  "mediation",
  "arbitration",
  "legal_reference",
  "unresolved_issue",
] as const;

export const HR_UCB_REPRESENTATIVE_ROLES = [
  "steward",
  "union_rep",
  "chief_steward",
  "bargaining_committee",
  "legal_liaison",
] as const;

export const HR_UCB_MEETING_STATUSES = [
  "scheduled",
  "held",
  "action_pending",
  "closed",
  "cancelled",
] as const;

export const HR_UCB_NEGOTIATION_STATUSES = [
  "not_started",
  "preparing",
  "in_negotiation",
  "tentative_agreement",
  "ratified",
  "stalled",
] as const;

export const HR_UCB_ALERT_TYPES = [
  "cba_expiring",
  "grievance_deadline",
  "unresolved_dispute",
  "overdue_action",
] as const;

export const HR_UCB_REPORT_GROUP_BY = [
  "union",
  "bargaining_unit",
  "agreement",
  "department",
  "location",
  "grievance_status",
  "renewal_status",
  "dues_status",
] as const;

export const HR_UCB_STATUS_FILTERS = [
  "all",
  ...HR_UCB_UNION_STATUSES,
  ...HR_UCB_CBA_STATUSES,
  ...HR_UCB_MEMBERSHIP_STATUSES,
  ...HR_UCB_APPROVAL_STATUSES,
  ...HR_UCB_DUES_STATUSES,
  ...HR_UCB_GRIEVANCE_STATUSES,
  ...HR_UCB_GRIEVANCE_SEVERITIES,
  ...HR_UCB_CONFLICT_SEVERITIES,
  ...HR_UCB_MEETING_STATUSES,
  ...HR_UCB_NEGOTIATION_STATUSES,
  "open",
  "ready",
  "exposed",
  "blocked",
  "overdue",
  "acknowledged",
] as const;

export type HrUcbUnionStatus = (typeof HR_UCB_UNION_STATUSES)[number];
export type HrUcbCbaStatus = (typeof HR_UCB_CBA_STATUSES)[number];
export type HrUcbMembershipStatus =
  (typeof HR_UCB_MEMBERSHIP_STATUSES)[number];
export type HrUcbRuleType = (typeof HR_UCB_RULE_TYPES)[number];
export type HrUcbDownstreamTarget = (typeof HR_UCB_DOWNSTREAM_TARGETS)[number];
export type HrUcbSeniorityDecisionType =
  (typeof HR_UCB_SENIORITY_DECISION_TYPES)[number];
export type HrUcbConflictSeverity =
  (typeof HR_UCB_CONFLICT_SEVERITIES)[number];
export type HrUcbApprovalStatus = (typeof HR_UCB_APPROVAL_STATUSES)[number];
export type HrUcbDuesStatus = (typeof HR_UCB_DUES_STATUSES)[number];
export type HrUcbGrievanceCategory =
  (typeof HR_UCB_GRIEVANCE_CATEGORIES)[number];
export type HrUcbGrievanceStatus =
  (typeof HR_UCB_GRIEVANCE_STATUSES)[number];
export type HrUcbGrievanceSeverity =
  (typeof HR_UCB_GRIEVANCE_SEVERITIES)[number];
export type HrUcbDisputeType = (typeof HR_UCB_DISPUTE_TYPES)[number];
export type HrUcbRepresentativeRole =
  (typeof HR_UCB_REPRESENTATIVE_ROLES)[number];
export type HrUcbMeetingStatus = (typeof HR_UCB_MEETING_STATUSES)[number];
export type HrUcbNegotiationStatus =
  (typeof HR_UCB_NEGOTIATION_STATUSES)[number];
export type HrUcbAlertType = (typeof HR_UCB_ALERT_TYPES)[number];
export type HrUcbReportGroupBy = (typeof HR_UCB_REPORT_GROUP_BY)[number];
export type HrUcbStatusFilter = (typeof HR_UCB_STATUS_FILTERS)[number];

export const HR_INDUSTRY_UCB_READ_CAPABILITY = HR_UCB_READ_CAPABILITY;
export const HR_INDUSTRY_UCB_WRITE_CAPABILITY = HR_UCB_WRITE_CAPABILITY;
export const HR_INDUSTRY_UCB_APPROVE_CAPABILITY = HR_UCB_APPROVE_CAPABILITY;
export const HR_INDUSTRY_UCB_AUDIT_READ_CAPABILITY =
  HR_UCB_AUDIT_READ_CAPABILITY;
export const HR_INDUSTRY_UCB_RESTRICTED_READ_CAPABILITY =
  HR_UCB_RESTRICTED_READ_CAPABILITY;
export const HR_INDUSTRY_UCB_GRIEVANCE_MANAGE_CAPABILITY =
  HR_UCB_GRIEVANCE_MANAGE_CAPABILITY;
export const HR_INDUSTRY_UCB_LEGAL_REFERENCE_READ_CAPABILITY =
  HR_UCB_LEGAL_REFERENCE_READ_CAPABILITY;
export const HR_INDUSTRY_UCB_PAYROLL_EXPOSE_CAPABILITY =
  HR_UCB_PAYROLL_EXPOSE_CAPABILITY;
export const HR_INDUSTRY_UCB_INTEGRATION_EXPOSE_CAPABILITY =
  HR_UCB_INTEGRATION_EXPOSE_CAPABILITY;
export const HR_INDUSTRY_UCB_REPORT_EXPORT_CAPABILITY =
  HR_UCB_REPORT_EXPORT_CAPABILITY;
