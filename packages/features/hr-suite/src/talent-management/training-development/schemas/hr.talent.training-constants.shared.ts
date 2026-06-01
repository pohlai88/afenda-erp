import type { AppCapability } from "@afenda/auth";

export const HR_TRAINING_READ_CAPABILITY =
  "hr.training.read" satisfies AppCapability;
export const HR_TRAINING_WRITE_CAPABILITY =
  "hr.training.write" satisfies AppCapability;
export const HR_TRAINING_APPROVE_CAPABILITY =
  "hr.training.approve" satisfies AppCapability;
export const HR_TRAINING_AUDIT_READ_CAPABILITY =
  "hr.training.audit.read" satisfies AppCapability;
export const HR_TRAINING_RESTRICTED_READ_CAPABILITY =
  "hr.training.restricted.read" satisfies AppCapability;
export const HR_TRAINING_INTEGRATION_EXPOSE_CAPABILITY =
  "hr.training.integration.expose" satisfies AppCapability;

export const HR_TRAINING_TYPES = [
  "classroom",
  "online",
  "workshop",
  "seminar",
  "external_course",
  "certification",
  "safety_training",
  "compliance_training",
] as const;

export const HR_TRAINING_DELIVERY_MODES = [
  "in_person",
  "virtual",
  "hybrid",
  "self_paced",
  "external",
] as const;

export const HR_TRAINING_PROVIDER_TYPES = [
  "internal",
  "external",
  "lms",
  "regulator",
  "vendor",
] as const;

export const HR_TRAINING_COURSE_STATUSES = [
  "draft",
  "active",
  "retired",
  "suspended",
] as const;

export const HR_TRAINING_REQUIREMENT_SCOPE_KINDS = [
  "legal_entity",
  "department",
  "role",
  "grade",
  "location",
  "employment_type",
  "employee_category",
] as const;

export const HR_TRAINING_ASSIGNMENT_STATUSES = [
  "assigned",
  "accepted",
  "waived",
  "cancelled",
  "overdue",
] as const;

export const HR_TRAINING_ENROLLMENT_STATUSES = [
  "requested",
  "pending_approval",
  "approved",
  "enrolled",
  "waitlisted",
  "rejected",
  "withdrawn",
] as const;

export const HR_TRAINING_ATTENDANCE_STATUSES = [
  "scheduled",
  "present",
  "absent",
  "late",
  "excused",
  "no_show",
] as const;

export const HR_TRAINING_COMPLETION_STATUSES = [
  "not_started",
  "enrolled",
  "in_progress",
  "completed",
  "failed",
  "no_show",
  "withdrawn",
  "expired",
  "renewed",
] as const;

export const HR_TRAINING_ASSESSMENT_RESULTS = [
  "not_required",
  "pending",
  "passed",
  "failed",
  "exempted",
] as const;

export const HR_TRAINING_PROFICIENCY_LEVELS = [
  "none",
  "foundation",
  "working",
  "advanced",
  "expert",
] as const;

export const HR_TRAINING_COMPETENCY_CATEGORIES = [
  "technical",
  "leadership",
  "safety",
  "compliance",
  "behavioral",
] as const;

export const HR_TRAINING_GAP_SEVERITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const HR_TRAINING_GAP_STATUSES = [
  "open",
  "in_development",
  "closed",
  "waived",
] as const;

export const HR_TRAINING_DEVELOPMENT_PLAN_STATUSES = [
  "planned",
  "in_progress",
  "completed",
  "overdue",
  "blocked",
] as const;

export const HR_TRAINING_CERTIFICATION_STATUSES = [
  "valid",
  "expiring",
  "expired",
  "missing",
  "renewal_in_progress",
] as const;

export const HR_TRAINING_ALERT_AUDIENCES = [
  "employee",
  "manager",
  "hr",
  "compliance",
] as const;

export const HR_TRAINING_ALERT_STATUSES = [
  "open",
  "acknowledged",
  "resolved",
] as const;

export const HR_TRAINING_REPORT_GROUP_BY = [
  "employee",
  "department",
  "manager",
  "role",
  "course",
  "certification",
  "status",
  "provider",
  "period",
] as const;

export type HrTrainingType = (typeof HR_TRAINING_TYPES)[number];
export type HrTrainingDeliveryMode =
  (typeof HR_TRAINING_DELIVERY_MODES)[number];
export type HrTrainingProviderType =
  (typeof HR_TRAINING_PROVIDER_TYPES)[number];
export type HrTrainingCourseStatus =
  (typeof HR_TRAINING_COURSE_STATUSES)[number];
export type HrTrainingRequirementScopeKind =
  (typeof HR_TRAINING_REQUIREMENT_SCOPE_KINDS)[number];
export type HrTrainingAssignmentStatus =
  (typeof HR_TRAINING_ASSIGNMENT_STATUSES)[number];
export type HrTrainingEnrollmentStatus =
  (typeof HR_TRAINING_ENROLLMENT_STATUSES)[number];
export type HrTrainingAttendanceStatus =
  (typeof HR_TRAINING_ATTENDANCE_STATUSES)[number];
export type HrTrainingCompletionStatus =
  (typeof HR_TRAINING_COMPLETION_STATUSES)[number];
export type HrTrainingAssessmentResult =
  (typeof HR_TRAINING_ASSESSMENT_RESULTS)[number];
export type HrTrainingProficiencyLevel =
  (typeof HR_TRAINING_PROFICIENCY_LEVELS)[number];
export type HrTrainingCompetencyCategory =
  (typeof HR_TRAINING_COMPETENCY_CATEGORIES)[number];
export type HrTrainingGapSeverity =
  (typeof HR_TRAINING_GAP_SEVERITIES)[number];
export type HrTrainingGapStatus = (typeof HR_TRAINING_GAP_STATUSES)[number];
export type HrTrainingDevelopmentPlanStatus =
  (typeof HR_TRAINING_DEVELOPMENT_PLAN_STATUSES)[number];
export type HrTrainingCertificationStatus =
  (typeof HR_TRAINING_CERTIFICATION_STATUSES)[number];
export type HrTrainingAlertAudience =
  (typeof HR_TRAINING_ALERT_AUDIENCES)[number];
export type HrTrainingAlertStatus =
  (typeof HR_TRAINING_ALERT_STATUSES)[number];
export type HrTrainingReportGroupBy =
  (typeof HR_TRAINING_REPORT_GROUP_BY)[number];

export const HR_TALENT_TRAINING_READ_CAPABILITY =
  HR_TRAINING_READ_CAPABILITY;
export const HR_TALENT_TRAINING_WRITE_CAPABILITY =
  HR_TRAINING_WRITE_CAPABILITY;
export const HR_TALENT_TRAINING_APPROVE_CAPABILITY =
  HR_TRAINING_APPROVE_CAPABILITY;
export const HR_TALENT_TRAINING_AUDIT_READ_CAPABILITY =
  HR_TRAINING_AUDIT_READ_CAPABILITY;
export const HR_TALENT_TRAINING_RESTRICTED_READ_CAPABILITY =
  HR_TRAINING_RESTRICTED_READ_CAPABILITY;
export const HR_TALENT_TRAINING_INTEGRATION_EXPOSE_CAPABILITY =
  HR_TRAINING_INTEGRATION_EXPOSE_CAPABILITY;
