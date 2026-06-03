import type { AppCapability } from "@afenda/auth";

export const HR_FHC_READ_CAPABILITY = "hr.fhc.read" satisfies AppCapability;
export const HR_FHC_WRITE_CAPABILITY = "hr.fhc.write" satisfies AppCapability;
export const HR_FHC_APPROVE_CAPABILITY =
  "hr.fhc.approve" satisfies AppCapability;
export const HR_FHC_AUDIT_READ_CAPABILITY =
  "hr.fhc.audit.read" satisfies AppCapability;
export const HR_FHC_RESTRICTED_READ_CAPABILITY =
  "hr.fhc.restricted.read" satisfies AppCapability;
export const HR_FHC_INTEGRATION_EXPOSE_CAPABILITY =
  "hr.fhc.integration.expose" satisfies AppCapability;

export const HR_FHC_COMPLIANCE_STATUSES = [
  "compliant",
  "pending",
  "missing",
  "expiring",
  "expired",
  "rejected",
  "waived",
  "not_required",
] as const;

export const HR_FHC_ELIGIBILITY_STATUSES = [
  "eligible",
  "pending_review",
  "restricted",
  "not_required",
] as const;

export const HR_FHC_TRAINING_TYPES = [
  "food_hygiene",
  "safe_food_handling",
  "contamination_prevention",
  "allergen_awareness",
  "allergen_handling",
  "cross_contact_prevention",
  "menu_allergen_knowledge",
] as const;

export const HR_FHC_TRAINING_STATUSES = [
  "assigned",
  "completed",
  "overdue",
  "failed",
  "renewed",
  "not_required",
] as const;

export const HR_FHC_EVIDENCE_TYPES = [
  "food_handler_permit",
  "health_certificate",
  "food_hygiene_training",
  "allergen_training",
  "medical_fitness",
] as const;

export const HR_FHC_EVIDENCE_STATUSES = [
  "submitted",
  "verified",
  "rejected",
  "renewal_pending",
] as const;

export const HR_FHC_MEDICAL_FITNESS_STATUSES = [
  "fit",
  "fit_with_restrictions",
  "unfit",
  "pending_review",
] as const;

export const HR_FHC_RENEWAL_STATUSES = [
  "pending_submission",
  "submitted",
  "verified",
  "rejected",
  "closed",
] as const;

export const HR_FHC_ALERT_TYPES = [
  "permit_expiring",
  "permit_expired",
  "health_certificate_expiring",
  "health_certificate_missing",
  "certification_missing",
  "training_overdue",
] as const;

export const HR_FHC_DUTY_RESTRICTION_REASONS = [
  "missing_certification",
  "expired_permit",
  "rejected_evidence",
  "missing_health_certificate",
  "overdue_training",
] as const;

export const HR_FHC_DUTY_RESTRICTION_STATUSES = [
  "active",
  "pending_review",
  "lifted",
  "expired",
] as const;

export const HR_FHC_REPORT_GROUP_BY = [
  "outlet",
  "role",
  "department",
  "manager",
  "legal_entity",
  "status",
] as const;

export type HrFhcComplianceStatus =
  (typeof HR_FHC_COMPLIANCE_STATUSES)[number];
export type HrFhcEligibilityStatus =
  (typeof HR_FHC_ELIGIBILITY_STATUSES)[number];
export type HrFhcTrainingType = (typeof HR_FHC_TRAINING_TYPES)[number];
export type HrFhcTrainingStatus = (typeof HR_FHC_TRAINING_STATUSES)[number];
export type HrFhcEvidenceType = (typeof HR_FHC_EVIDENCE_TYPES)[number];
export type HrFhcEvidenceStatus = (typeof HR_FHC_EVIDENCE_STATUSES)[number];
export type HrFhcMedicalFitnessStatus =
  (typeof HR_FHC_MEDICAL_FITNESS_STATUSES)[number];
export type HrFhcRenewalStatus = (typeof HR_FHC_RENEWAL_STATUSES)[number];
export type HrFhcAlertType = (typeof HR_FHC_ALERT_TYPES)[number];
export type HrFhcDutyRestrictionReason =
  (typeof HR_FHC_DUTY_RESTRICTION_REASONS)[number];
export type HrFhcDutyRestrictionStatus =
  (typeof HR_FHC_DUTY_RESTRICTION_STATUSES)[number];
export type HrFhcReportGroupBy = (typeof HR_FHC_REPORT_GROUP_BY)[number];

export const HR_INDUSTRY_FHC_READ_CAPABILITY = HR_FHC_READ_CAPABILITY;
export const HR_INDUSTRY_FHC_WRITE_CAPABILITY = HR_FHC_WRITE_CAPABILITY;
export const HR_INDUSTRY_FHC_APPROVE_CAPABILITY = HR_FHC_APPROVE_CAPABILITY;
export const HR_INDUSTRY_FHC_AUDIT_READ_CAPABILITY =
  HR_FHC_AUDIT_READ_CAPABILITY;
export const HR_INDUSTRY_FHC_RESTRICTED_READ_CAPABILITY =
  HR_FHC_RESTRICTED_READ_CAPABILITY;
export const HR_INDUSTRY_FHC_INTEGRATION_EXPOSE_CAPABILITY =
  HR_FHC_INTEGRATION_EXPOSE_CAPABILITY;
