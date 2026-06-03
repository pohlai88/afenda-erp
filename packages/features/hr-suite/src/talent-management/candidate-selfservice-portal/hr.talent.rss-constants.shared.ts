import type { AppCapability } from "@afenda/auth";

export const HR_TALENT_RSS_READ_CAPABILITY =
  "hr.rss.read" satisfies AppCapability;
export const HR_TALENT_RSS_WRITE_CAPABILITY =
  "hr.rss.write" satisfies AppCapability;
export const HR_TALENT_RSS_APPROVE_CAPABILITY =
  "hr.rss.approve" satisfies AppCapability;
export const HR_TALENT_RSS_AUDIT_READ_CAPABILITY =
  "hr.rss.audit.read" satisfies AppCapability;
export const HR_TALENT_RSS_RESTRICTED_READ_CAPABILITY =
  "hr.rss.restricted.read" satisfies AppCapability;
export const HR_TALENT_RSS_INTEGRATION_EXPOSE_CAPABILITY =
  "hr.rss.integration.expose" satisfies AppCapability;

export const HR_TALENT_RSS_ACCOUNT_STATUSES = [
  "active",
  "locked",
  "closure_requested",
  "closed",
  "retention_hold",
] as const;

export const HR_TALENT_RSS_PROFILE_STATUSES = [
  "draft",
  "complete",
  "needs_update",
  "verified",
  "closed",
] as const;

export const HR_TALENT_RSS_POSTING_VISIBILITIES = [
  "external",
  "internal",
  "both",
] as const;

export const HR_TALENT_RSS_POSTING_STATUSES = [
  "open",
  "closing_soon",
  "closed",
  "internal_only",
] as const;

export const HR_TALENT_RSS_APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "screening",
  "interview",
  "assessment",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
] as const;

export const HR_TALENT_RSS_INTERVIEW_STATUSES = [
  "invited",
  "confirmed",
  "reschedule_requested",
  "completed",
  "no_show",
] as const;

export const HR_TALENT_RSS_ASSESSMENT_STATUSES = [
  "not_required",
  "assigned",
  "accessed",
  "submitted",
  "reviewed",
  "expired",
] as const;

export const HR_TALENT_RSS_SCORECARD_STATUSES = [
  "not_started",
  "in_progress",
  "submitted",
  "returned",
] as const;

export const HR_TALENT_RSS_OFFER_STATUSES = [
  "not_applicable",
  "draft",
  "pending_approval",
  "approved",
  "sent",
  "viewed",
  "accepted",
  "declined",
  "withdrawn",
  "expired",
] as const;

export const HR_TALENT_RSS_TASK_TYPES = [
  "application",
  "interview",
  "feedback",
  "approval",
  "offer_action",
  "document",
  "assessment",
  "privacy",
] as const;

export const HR_TALENT_RSS_TASK_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "overdue",
  "blocked",
] as const;

export const HR_TALENT_RSS_APPROVAL_TYPES = [
  "requisition",
  "offer",
  "exception",
] as const;

export const HR_TALENT_RSS_APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "returned",
  "clarification_requested",
] as const;

export const HR_TALENT_RSS_CONSENT_STATUSES = [
  "not_required",
  "pending",
  "captured",
  "withdrawn",
  "expired",
] as const;

export const HR_TALENT_RSS_RETENTION_STATUSES = [
  "active",
  "retention_review",
  "closure_requested",
  "closed",
  "legal_hold",
] as const;

export const HR_TALENT_RSS_NOTIFICATION_EVENTS = [
  "application_update",
  "interview_invitation",
  "interview_reminder",
  "assessment_assigned",
  "offer_sent",
  "approval_request",
  "rejection_notice",
  "task_due",
] as const;

export const HR_TALENT_RSS_NOTIFICATION_STATUSES = [
  "queued",
  "sent",
  "delivered",
  "read",
  "failed",
] as const;

export const HR_TALENT_RSS_PORTAL_ROLES = [
  "candidate",
  "internal_employee",
  "hiring_manager",
  "interviewer",
  "recruiter",
  "approver",
  "auditor",
] as const;

export const HR_TALENT_RSS_PRIVACY_TIERS = [
  "standard",
  "restricted",
  "masked",
] as const;

export const HR_TALENT_RSS_REPORT_GROUP_BY = [
  "role",
  "status",
  "stage",
  "posting",
  "privacy",
  "consent",
  "period",
] as const;

export const HR_TALENT_RSS_STATUS_FILTERS = [
  "all",
  ...HR_TALENT_RSS_APPLICATION_STATUSES,
] as const;

export type HrTalentRssAccountStatus =
  (typeof HR_TALENT_RSS_ACCOUNT_STATUSES)[number];
export type HrTalentRssProfileStatus =
  (typeof HR_TALENT_RSS_PROFILE_STATUSES)[number];
export type HrTalentRssPostingVisibility =
  (typeof HR_TALENT_RSS_POSTING_VISIBILITIES)[number];
export type HrTalentRssPostingStatus =
  (typeof HR_TALENT_RSS_POSTING_STATUSES)[number];
export type HrTalentRssApplicationStatus =
  (typeof HR_TALENT_RSS_APPLICATION_STATUSES)[number];
export type HrTalentRssInterviewStatus =
  (typeof HR_TALENT_RSS_INTERVIEW_STATUSES)[number];
export type HrTalentRssAssessmentStatus =
  (typeof HR_TALENT_RSS_ASSESSMENT_STATUSES)[number];
export type HrTalentRssScorecardStatus =
  (typeof HR_TALENT_RSS_SCORECARD_STATUSES)[number];
export type HrTalentRssOfferStatus =
  (typeof HR_TALENT_RSS_OFFER_STATUSES)[number];
export type HrTalentRssTaskType = (typeof HR_TALENT_RSS_TASK_TYPES)[number];
export type HrTalentRssTaskStatus =
  (typeof HR_TALENT_RSS_TASK_STATUSES)[number];
export type HrTalentRssApprovalType =
  (typeof HR_TALENT_RSS_APPROVAL_TYPES)[number];
export type HrTalentRssApprovalStatus =
  (typeof HR_TALENT_RSS_APPROVAL_STATUSES)[number];
export type HrTalentRssConsentStatus =
  (typeof HR_TALENT_RSS_CONSENT_STATUSES)[number];
export type HrTalentRssRetentionStatus =
  (typeof HR_TALENT_RSS_RETENTION_STATUSES)[number];
export type HrTalentRssNotificationEvent =
  (typeof HR_TALENT_RSS_NOTIFICATION_EVENTS)[number];
export type HrTalentRssNotificationStatus =
  (typeof HR_TALENT_RSS_NOTIFICATION_STATUSES)[number];
export type HrTalentRssPortalRole =
  (typeof HR_TALENT_RSS_PORTAL_ROLES)[number];
export type HrTalentRssPrivacyTier =
  (typeof HR_TALENT_RSS_PRIVACY_TIERS)[number];
export type HrTalentRssReportGroupBy =
  (typeof HR_TALENT_RSS_REPORT_GROUP_BY)[number];
export type HrTalentRssStatusFilter =
  (typeof HR_TALENT_RSS_STATUS_FILTERS)[number];
