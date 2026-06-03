import type { AppCapability } from "@afenda/auth";

export const HR_GPG_READ_CAPABILITY = "hr.gpg.read" satisfies AppCapability;
export const HR_GPG_WRITE_CAPABILITY = "hr.gpg.write" satisfies AppCapability;
export const HR_GPG_APPROVE_CAPABILITY =
  "hr.gpg.approve" satisfies AppCapability;
export const HR_GPG_AUDIT_READ_CAPABILITY =
  "hr.gpg.audit.read" satisfies AppCapability;
export const HR_GPG_RESTRICTED_READ_CAPABILITY =
  "hr.gpg.restricted.read" satisfies AppCapability;
export const HR_GPG_INTEGRATION_EXPOSE_CAPABILITY =
  "hr.gpg.integration.expose" satisfies AppCapability;

export const HR_GPG_CLASSIFICATION_STATUSES = [
  "draft",
  "active",
  "under_review",
  "retired",
] as const;

export const HR_GPG_CLASSIFICATION_REFERENCE_TYPES = [
  "gs",
  "ses",
  "civil_service",
  "rank",
  "local_equivalent",
] as const;

export const HR_GPG_PAY_GRADE_STATUSES = [
  "draft",
  "active",
  "retired",
] as const;

export const HR_GPG_SALARY_TABLE_STATUSES = [
  "draft",
  "published",
  "superseded",
  "retired",
] as const;

export const HR_GPG_LOCALITY_ADJUSTMENT_TYPES = [
  "locality_pay",
  "regional_allowance",
  "hardship",
  "remote_area",
  "cost_of_living",
] as const;

export const HR_GPG_STEP_PROCESSING_MODES = [
  "automatic",
  "approval_based",
] as const;

export const HR_GPG_STEP_ELIGIBILITY_STATUSES = [
  "eligible",
  "not_yet_eligible",
  "requires_review",
  "blocked",
] as const;

export const HR_GPG_GRADE_MOVEMENT_TYPES = [
  "promotion",
  "reclassification",
  "demotion",
  "downgrade",
  "acting_grade",
  "pay_retention",
  "grade_retention",
] as const;

export const HR_GPG_GRADE_MOVEMENT_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "processed",
  "rejected",
] as const;

export const HR_GPG_ASSIGNMENT_VALIDATION_STATUSES = [
  "valid",
  "warning",
  "blocked",
] as const;

export const HR_GPG_CLASSIFICATION_REVIEW_TYPES = [
  "classification_review",
  "classification_correction",
  "reclassification_request",
  "appeal",
] as const;

export const HR_GPG_CLASSIFICATION_REVIEW_STATUSES = [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "closed",
] as const;

export const HR_GPG_INTEGRATION_TARGETS = [
  "payroll_processing",
  "employee_lifecycle_management",
] as const;

export const HR_GPG_REPORT_GROUP_BY = [
  "classification",
  "grade",
  "step",
  "pay_band",
  "agency",
  "department",
  "locality",
  "position",
  "effective_date",
] as const;

export type HrGpgClassificationStatus =
  (typeof HR_GPG_CLASSIFICATION_STATUSES)[number];
export type HrGpgClassificationReferenceType =
  (typeof HR_GPG_CLASSIFICATION_REFERENCE_TYPES)[number];
export type HrGpgPayGradeStatus = (typeof HR_GPG_PAY_GRADE_STATUSES)[number];
export type HrGpgSalaryTableStatus =
  (typeof HR_GPG_SALARY_TABLE_STATUSES)[number];
export type HrGpgLocalityAdjustmentType =
  (typeof HR_GPG_LOCALITY_ADJUSTMENT_TYPES)[number];
export type HrGpgStepProcessingMode =
  (typeof HR_GPG_STEP_PROCESSING_MODES)[number];
export type HrGpgStepEligibilityStatus =
  (typeof HR_GPG_STEP_ELIGIBILITY_STATUSES)[number];
export type HrGpgGradeMovementType =
  (typeof HR_GPG_GRADE_MOVEMENT_TYPES)[number];
export type HrGpgGradeMovementStatus =
  (typeof HR_GPG_GRADE_MOVEMENT_STATUSES)[number];
export type HrGpgAssignmentValidationStatus =
  (typeof HR_GPG_ASSIGNMENT_VALIDATION_STATUSES)[number];
export type HrGpgClassificationReviewType =
  (typeof HR_GPG_CLASSIFICATION_REVIEW_TYPES)[number];
export type HrGpgClassificationReviewStatus =
  (typeof HR_GPG_CLASSIFICATION_REVIEW_STATUSES)[number];
export type HrGpgIntegrationTarget =
  (typeof HR_GPG_INTEGRATION_TARGETS)[number];
export type HrGpgReportGroupBy = (typeof HR_GPG_REPORT_GROUP_BY)[number];

export const HR_INDUSTRY_GPG_READ_CAPABILITY = HR_GPG_READ_CAPABILITY;
export const HR_INDUSTRY_GPG_WRITE_CAPABILITY = HR_GPG_WRITE_CAPABILITY;
export const HR_INDUSTRY_GPG_APPROVE_CAPABILITY = HR_GPG_APPROVE_CAPABILITY;
export const HR_INDUSTRY_GPG_AUDIT_READ_CAPABILITY =
  HR_GPG_AUDIT_READ_CAPABILITY;
export const HR_INDUSTRY_GPG_RESTRICTED_READ_CAPABILITY =
  HR_GPG_RESTRICTED_READ_CAPABILITY;
export const HR_INDUSTRY_GPG_INTEGRATION_EXPOSE_CAPABILITY =
  HR_GPG_INTEGRATION_EXPOSE_CAPABILITY;
