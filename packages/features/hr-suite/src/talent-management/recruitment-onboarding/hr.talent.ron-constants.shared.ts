export const HR_RON_REQUISITION_TYPES = [
  "new_headcount",
  "replacement",
  "temporary_role",
  "contract_role",
  "internship",
  "internal_transfer",
] as const;

export type HrRonRequisitionType =
  (typeof HR_RON_REQUISITION_TYPES)[number];

export const HR_RON_REQUISITION_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "returned",
  "cancelled",
  "closed",
] as const;

export type HrRonRequisitionStatus =
  (typeof HR_RON_REQUISITION_STATUSES)[number];

export const HR_RON_POSTING_CHANNELS = ["internal", "external"] as const;

export type HrRonPostingChannel = (typeof HR_RON_POSTING_CHANNELS)[number];

export const HR_RON_POSTING_STATUSES = [
  "draft",
  "published",
  "closed",
] as const;

export type HrRonPostingStatus = (typeof HR_RON_POSTING_STATUSES)[number];

export const HR_RON_CANDIDATE_SOURCES = [
  "career_site",
  "referral",
  "recruiter",
  "agency",
  "job_board",
  "internal_application",
] as const;

export type HrRonCandidateSource =
  (typeof HR_RON_CANDIDATE_SOURCES)[number];

export const HR_RON_PIPELINE_STAGES = [
  "applied",
  "screening",
  "shortlisted",
  "interview",
  "assessment",
  "offer",
  "hired",
  "rejected",
] as const;

export type HrRonPipelineStage = (typeof HR_RON_PIPELINE_STAGES)[number];

export const HR_RON_CANDIDATE_STATUSES = [
  "applied",
  "screened",
  "shortlisted",
  "interview",
  "assessment",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
  "archived",
] as const;

export type HrRonCandidateStatus =
  (typeof HR_RON_CANDIDATE_STATUSES)[number];

export const HR_RON_INTERVIEW_TYPES = [
  "phone",
  "video",
  "onsite",
  "panel",
  "technical",
  "hiring_manager",
] as const;

export type HrRonInterviewType = (typeof HR_RON_INTERVIEW_TYPES)[number];

export const HR_RON_HIRING_RECOMMENDATIONS = [
  "strong_hire",
  "hire",
  "hold",
  "reject",
] as const;

export type HrRonHiringRecommendation =
  (typeof HR_RON_HIRING_RECOMMENDATIONS)[number];

export const HR_RON_ASSESSMENT_STATUSES = [
  "assigned",
  "submitted",
  "passed",
  "failed",
  "waived",
] as const;

export type HrRonAssessmentStatus =
  (typeof HR_RON_ASSESSMENT_STATUSES)[number];

export const HR_RON_COMMUNICATION_EVENTS = [
  "application_received",
  "interview_invitation",
  "rejection",
  "offer",
  "withdrawal",
  "onboarding_start",
] as const;

export type HrRonCommunicationEvent =
  (typeof HR_RON_COMMUNICATION_EVENTS)[number];

export const HR_RON_OFFER_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "sent",
  "accepted",
  "declined",
  "withdrawn",
  "expired",
] as const;

export type HrRonOfferStatus = (typeof HR_RON_OFFER_STATUSES)[number];

export const HR_RON_CHECK_TYPES = [
  "reference_check",
  "background_check",
  "right_to_work_check",
  "medical_check",
] as const;

export type HrRonCheckType = (typeof HR_RON_CHECK_TYPES)[number];

export const HR_RON_ONBOARDING_OWNER_ROLES = [
  "new_hire",
  "hr",
  "manager",
  "it",
  "payroll",
  "admin",
  "document_owner",
] as const;

export type HrRonOnboardingOwnerRole =
  (typeof HR_RON_ONBOARDING_OWNER_ROLES)[number];

export const HR_RON_ONBOARDING_TASK_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "overdue",
  "blocked",
  "waived",
  "cancelled",
] as const;

export type HrRonOnboardingTaskStatus =
  (typeof HR_RON_ONBOARDING_TASK_STATUSES)[number];

export const HR_RON_READINESS_DOMAINS = [
  "employee_records",
  "payroll",
  "iam",
  "document_management",
  "employee_lifecycle",
] as const;

export type HrRonReadinessDomain =
  (typeof HR_RON_READINESS_DOMAINS)[number];

export const HR_RON_REPORT_GROUP_BY = [
  "requisition",
  "source",
  "stage",
  "recruiter",
  "hiring_manager",
  "department",
  "onboarding_status",
  "period",
] as const;

export type HrRonReportGroupBy = (typeof HR_RON_REPORT_GROUP_BY)[number];

export const HR_RON_ACCESS_ROLES = [
  "candidate",
  "recruiter",
  "hiring_manager",
  "interviewer",
  "hr",
  "finance",
  "it",
  "auditor",
] as const;

export type HrRonAccessRole = (typeof HR_RON_ACCESS_ROLES)[number];

export const HR_RON_READ_CAPABILITY = "hr.recruitment.read" as const;
export const HR_RON_WRITE_CAPABILITY = "hr.recruitment.write" as const;
export const HR_RON_APPROVE_CAPABILITY = "hr.recruitment.approve" as const;
export const HR_RON_INTERVIEW_WRITE_CAPABILITY =
  "hr.recruitment.interview.write" as const;
export const HR_RON_OFFER_READ_CAPABILITY =
  "hr.recruitment.offer.read" as const;
export const HR_RON_OFFER_WRITE_CAPABILITY =
  "hr.recruitment.offer.write" as const;
export const HR_RON_OFFER_APPROVE_CAPABILITY =
  "hr.recruitment.offer.approve" as const;
export const HR_RON_ONBOARDING_READ_CAPABILITY =
  "hr.recruitment.onboarding.read" as const;
export const HR_RON_ONBOARDING_WRITE_CAPABILITY =
  "hr.recruitment.onboarding.write" as const;
export const HR_RON_FINANCE_READ_CAPABILITY =
  "hr.recruitment.finance.read" as const;
export const HR_RON_IT_READ_CAPABILITY = "hr.recruitment.it.read" as const;
export const HR_RON_AUDIT_READ_CAPABILITY =
  "hr.recruitment.audit.read" as const;
export const HR_RON_SENSITIVE_READ_CAPABILITY =
  "hr.recruitment.sensitive.read" as const;
export const HR_RON_CONVERT_CAPABILITY =
  "hr.recruitment.convert" as const;
