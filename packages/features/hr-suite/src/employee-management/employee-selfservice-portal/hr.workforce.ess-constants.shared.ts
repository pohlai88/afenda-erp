import type { AppCapability } from "@afenda/auth";

export const HR_WORKFORCE_ESS_READ_CAPABILITY =
  "hr.ess.read" satisfies AppCapability;
export const HR_WORKFORCE_ESS_WRITE_CAPABILITY =
  "hr.ess.write" satisfies AppCapability;
export const HR_WORKFORCE_ESS_APPROVE_CAPABILITY =
  "hr.ess.approve" satisfies AppCapability;
export const HR_WORKFORCE_ESS_AUDIT_READ_CAPABILITY =
  "hr.ess.audit.read" satisfies AppCapability;
export const HR_WORKFORCE_ESS_RESTRICTED_READ_CAPABILITY =
  "hr.ess.restricted.read" satisfies AppCapability;
export const HR_WORKFORCE_ESS_INTEGRATION_EXPOSE_CAPABILITY =
  "hr.ess.integration.expose" satisfies AppCapability;

export const HR_WORKFORCE_ESS_EMPLOYMENT_STATUSES = [
  "active",
  "probation",
  "on_leave",
  "notice_period",
  "terminated",
] as const;

export const HR_WORKFORCE_ESS_PRIVACY_TIERS = [
  "public",
  "standard",
  "restricted",
  "payroll_sensitive",
  "identity_sensitive",
] as const;

export const HR_WORKFORCE_ESS_PROFILE_UPDATE_FIELDS = [
  "address",
  "phone",
  "personal_email",
  "marital_status",
  "dependents",
  "emergency_contact",
] as const;

export const HR_WORKFORCE_ESS_REQUEST_STATUSES = [
  "draft",
  "submitted",
  "pending_approval",
  "approved",
  "rejected",
  "returned",
  "cancelled",
  "amended",
  "completed",
] as const;

export const HR_WORKFORCE_ESS_LEAVE_TYPES = [
  "annual",
  "medical",
  "emergency",
  "parental",
  "unpaid",
] as const;

export const HR_WORKFORCE_ESS_PAY_DOCUMENT_TYPES = [
  "payslip",
  "salary_statement",
  "tax_form",
  "payroll_summary",
] as const;

export const HR_WORKFORCE_ESS_ATTENDANCE_STATUSES = [
  "present",
  "late",
  "absent",
  "leave",
  "holiday",
] as const;

export const HR_WORKFORCE_ESS_CLAIM_TYPES = [
  "travel",
  "meal",
  "medical",
  "training",
  "office_supply",
] as const;

export const HR_WORKFORCE_ESS_DOCUMENT_TYPES = [
  "employment_contract",
  "hr_letter",
  "policy",
  "certificate",
  "form",
  "payroll",
] as const;

export const HR_WORKFORCE_ESS_RESOURCE_TYPES = [
  "handbook",
  "policy",
  "faq",
  "benefits",
  "form",
  "notice",
] as const;

export const HR_WORKFORCE_ESS_TASK_TYPES = [
  "onboarding",
  "offboarding",
  "compliance",
  "document_submission",
  "acknowledgement",
  "manager_approval",
] as const;

export const HR_WORKFORCE_ESS_TASK_STATUSES = [
  "not_started",
  "in_progress",
  "pending_approval",
  "completed",
  "overdue",
  "waived",
] as const;

export const HR_WORKFORCE_ESS_NOTIFICATION_EVENTS = [
  "request_submitted",
  "request_approved",
  "request_rejected",
  "request_returned",
  "task_required",
  "document_expiring",
  "pay_document_available",
] as const;

export const HR_WORKFORCE_ESS_NOTIFICATION_STATUSES = [
  "queued",
  "sent",
  "delivered",
  "read",
  "failed",
] as const;

export const HR_WORKFORCE_ESS_APPROVAL_TYPES = [
  "profile_update",
  "leave",
  "claim",
  "document_request",
  "task_completion",
] as const;

export const HR_WORKFORCE_ESS_CONSENT_STATUSES = [
  "not_required",
  "pending",
  "acknowledged",
  "declined",
  "expired",
] as const;

export const HR_WORKFORCE_ESS_REPORT_GROUP_BY = [
  "employee",
  "status",
  "request_type",
  "department",
  "period",
  "privacy",
] as const;

export const HR_WORKFORCE_ESS_STATUS_FILTERS = [
  "all",
  ...HR_WORKFORCE_ESS_REQUEST_STATUSES,
] as const;

export type HrWorkforceEssEmploymentStatus =
  (typeof HR_WORKFORCE_ESS_EMPLOYMENT_STATUSES)[number];
export type HrWorkforceEssPrivacyTier =
  (typeof HR_WORKFORCE_ESS_PRIVACY_TIERS)[number];
export type HrWorkforceEssProfileUpdateField =
  (typeof HR_WORKFORCE_ESS_PROFILE_UPDATE_FIELDS)[number];
export type HrWorkforceEssRequestStatus =
  (typeof HR_WORKFORCE_ESS_REQUEST_STATUSES)[number];
export type HrWorkforceEssReportGroupBy =
  (typeof HR_WORKFORCE_ESS_REPORT_GROUP_BY)[number];
export type HrWorkforceEssStatusFilter =
  (typeof HR_WORKFORCE_ESS_STATUS_FILTERS)[number];
