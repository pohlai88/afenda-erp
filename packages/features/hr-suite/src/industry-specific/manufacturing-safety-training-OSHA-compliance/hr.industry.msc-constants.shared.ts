import type { AppCapability } from "@afenda/kernel";

export const HR_MSC_READ_CAPABILITY = "hr.msc.read" satisfies AppCapability;
export const HR_MSC_WRITE_CAPABILITY = "hr.msc.write" satisfies AppCapability;
export const HR_MSC_APPROVE_CAPABILITY =
  "hr.msc.approve" satisfies AppCapability;
export const HR_MSC_AUDIT_READ_CAPABILITY =
  "hr.msc.audit.read" satisfies AppCapability;
export const HR_MSC_RESTRICTED_READ_CAPABILITY =
  "hr.msc.restricted.read" satisfies AppCapability;
export const HR_MSC_INTEGRATION_EXPOSE_CAPABILITY =
  "hr.msc.integration.expose" satisfies AppCapability;

export const HR_MSC_TRAINING_REQUIREMENT_STATUSES = [
  "active",
  "waived",
  "retired",
] as const;

export const HR_MSC_TRAINING_TYPES = [
  "machine_safety",
  "lockout_tagout",
  "chemical_handling",
  "ppe",
  "fire_safety",
  "emergency_response",
  "ergonomics",
  "workplace_hazard",
  "forklift",
  "confined_space",
  "first_aid",
] as const;

export const HR_MSC_TRAINING_STATUSES = [
  "assigned",
  "completed",
  "overdue",
  "expired",
  "failed",
  "renewed",
  "waived",
] as const;

export const HR_MSC_CERTIFICATION_STATUSES = [
  "active",
  "expiring",
  "expired",
  "renewal_due",
  "suspended",
  "waived",
] as const;

export const HR_MSC_RISK_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const HR_MSC_COMPLIANCE_REFERENCE_TYPES = [
  "osha",
  "osh",
  "local_standard",
  "company_policy",
] as const;

export const HR_MSC_HAZARD_ASSESSMENT_TYPES = [
  "workplace_hazard",
  "ppe_hazard",
  "job_hazard_analysis",
] as const;

export const HR_MSC_HAZARD_ASSESSMENT_STATUSES = [
  "draft",
  "active",
  "reviewed",
  "expired",
  "superseded",
  "closed",
] as const;

export const HR_MSC_INCIDENT_TYPES = [
  "injury",
  "near_miss",
  "unsafe_condition",
  "property_damage",
  "exposure_event",
  "safety_observation",
] as const;

export const HR_MSC_INCIDENT_STATUSES = [
  "reported",
  "under_review",
  "corrective_action_pending",
  "closed",
  "recordable_reference",
] as const;

export const HR_MSC_OSHA_RECORDKEEPING_FORMS = [
  "osha_300",
  "osha_300a",
  "osha_301",
] as const;

export const HR_MSC_CORRECTIVE_ACTION_SOURCE_TYPES = [
  "incident",
  "hazard_assessment",
  "training_gap",
  "audit_finding",
] as const;

export const HR_MSC_CORRECTIVE_ACTION_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const HR_MSC_CORRECTIVE_ACTION_STATUSES = [
  "assigned",
  "in_progress",
  "overdue",
  "completed",
  "verified",
  "cancelled",
] as const;

export const HR_MSC_WORK_RESTRICTION_REASONS = [
  "missing_training",
  "expired_certification",
  "failed_training",
  "missing_ppe_acknowledgment",
  "open_incident",
  "hazard_exposure",
] as const;

export const HR_MSC_WORK_RESTRICTION_STATUSES = [
  "active",
  "pending_review",
  "released",
] as const;

export const HR_MSC_RESTRICTION_SCOPES = [
  "machine",
  "work_area",
  "duty",
] as const;

export const HR_MSC_NOTIFICATION_TYPES = [
  "overdue_training",
  "expiring_certification",
  "reported_incident",
  "overdue_corrective_action",
] as const;

export const HR_MSC_NOTIFICATION_STATUSES = [
  "queued",
  "sent",
  "acknowledged",
  "closed",
] as const;

export const HR_MSC_EVIDENCE_TYPES = [
  "training_proof",
  "attendance_sheet",
  "certificate",
  "ppe_acknowledgment",
  "incident_evidence",
  "hazard_assessment",
  "corrective_action",
] as const;

export const HR_MSC_INTEGRATION_TARGETS = [
  "compliance_regulatory_tracking",
  "learning_management_system",
  "training_development",
  "shift_scheduling",
  "document_management",
] as const;

export const HR_MSC_ELIGIBILITY_STATUSES = [
  "eligible",
  "pending_review",
  "restricted",
  "not_required",
] as const;

export const HR_MSC_REPORT_GROUP_BY = [
  "site",
  "department",
  "role",
  "manager",
  "training_type",
  "incident_type",
  "hazard_status",
  "risk_level",
] as const;

export const HR_MSC_STATUS_FILTERS = [
  "all",
  "active",
  "waived",
  "retired",
  "assigned",
  "completed",
  "overdue",
  "expired",
  "failed",
  "renewed",
  "expiring",
  "renewal_due",
  "suspended",
  "draft",
  "reviewed",
  "superseded",
  "closed",
  "reported",
  "under_review",
  "corrective_action_pending",
  "recordable_reference",
  "in_progress",
  "verified",
  "cancelled",
  "pending_review",
  "released",
  "eligible",
  "restricted",
  "not_required",
] as const;

export type HrMscTrainingRequirementStatus =
  (typeof HR_MSC_TRAINING_REQUIREMENT_STATUSES)[number];
export type HrMscTrainingType = (typeof HR_MSC_TRAINING_TYPES)[number];
export type HrMscTrainingStatus = (typeof HR_MSC_TRAINING_STATUSES)[number];
export type HrMscCertificationStatus =
  (typeof HR_MSC_CERTIFICATION_STATUSES)[number];
export type HrMscRiskLevel = (typeof HR_MSC_RISK_LEVELS)[number];
export type HrMscComplianceReferenceType =
  (typeof HR_MSC_COMPLIANCE_REFERENCE_TYPES)[number];
export type HrMscHazardAssessmentType =
  (typeof HR_MSC_HAZARD_ASSESSMENT_TYPES)[number];
export type HrMscHazardAssessmentStatus =
  (typeof HR_MSC_HAZARD_ASSESSMENT_STATUSES)[number];
export type HrMscIncidentType = (typeof HR_MSC_INCIDENT_TYPES)[number];
export type HrMscIncidentStatus = (typeof HR_MSC_INCIDENT_STATUSES)[number];
export type HrMscOshaRecordkeepingForm =
  (typeof HR_MSC_OSHA_RECORDKEEPING_FORMS)[number];
export type HrMscCorrectiveActionSourceType =
  (typeof HR_MSC_CORRECTIVE_ACTION_SOURCE_TYPES)[number];
export type HrMscCorrectiveActionPriority =
  (typeof HR_MSC_CORRECTIVE_ACTION_PRIORITIES)[number];
export type HrMscCorrectiveActionStatus =
  (typeof HR_MSC_CORRECTIVE_ACTION_STATUSES)[number];
export type HrMscWorkRestrictionReason =
  (typeof HR_MSC_WORK_RESTRICTION_REASONS)[number];
export type HrMscWorkRestrictionStatus =
  (typeof HR_MSC_WORK_RESTRICTION_STATUSES)[number];
export type HrMscRestrictionScope =
  (typeof HR_MSC_RESTRICTION_SCOPES)[number];
export type HrMscNotificationType =
  (typeof HR_MSC_NOTIFICATION_TYPES)[number];
export type HrMscNotificationStatus =
  (typeof HR_MSC_NOTIFICATION_STATUSES)[number];
export type HrMscEvidenceType = (typeof HR_MSC_EVIDENCE_TYPES)[number];
export type HrMscIntegrationTarget =
  (typeof HR_MSC_INTEGRATION_TARGETS)[number];
export type HrMscEligibilityStatus =
  (typeof HR_MSC_ELIGIBILITY_STATUSES)[number];
export type HrMscReportGroupBy = (typeof HR_MSC_REPORT_GROUP_BY)[number];
export type HrMscStatusFilter = (typeof HR_MSC_STATUS_FILTERS)[number];

export const HR_INDUSTRY_MSC_READ_CAPABILITY = HR_MSC_READ_CAPABILITY;
export const HR_INDUSTRY_MSC_WRITE_CAPABILITY = HR_MSC_WRITE_CAPABILITY;
export const HR_INDUSTRY_MSC_APPROVE_CAPABILITY = HR_MSC_APPROVE_CAPABILITY;
export const HR_INDUSTRY_MSC_AUDIT_READ_CAPABILITY =
  HR_MSC_AUDIT_READ_CAPABILITY;
export const HR_INDUSTRY_MSC_RESTRICTED_READ_CAPABILITY =
  HR_MSC_RESTRICTED_READ_CAPABILITY;
export const HR_INDUSTRY_MSC_INTEGRATION_EXPOSE_CAPABILITY =
  HR_MSC_INTEGRATION_EXPOSE_CAPABILITY;
