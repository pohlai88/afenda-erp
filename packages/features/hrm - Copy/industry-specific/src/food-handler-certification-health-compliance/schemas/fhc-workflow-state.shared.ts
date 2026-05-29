import { z } from "zod"

/** HRM-FHC-008 certification / obligation compliance status. */
export const HRM_FHC_COMPLIANCE_STATUSES = [
  "compliant",
  "pending",
  "missing",
  "expiring",
  "expired",
  "rejected",
  "waived",
  "not_required",
] as const

export type HrmFhcComplianceStatus =
  (typeof HRM_FHC_COMPLIANCE_STATUSES)[number]

export const hrmFhcComplianceStatusSchema = z.enum(HRM_FHC_COMPLIANCE_STATUSES)

/** HRM-FHC-003 food handler permit lifecycle status. */
export const HRM_FHC_PERMIT_STATUSES = [
  "active",
  "pending",
  "expired",
  "revoked",
  "waived",
] as const

export type HrmFhcPermitStatus = (typeof HRM_FHC_PERMIT_STATUSES)[number]

export const hrmFhcPermitStatusSchema = z.enum(HRM_FHC_PERMIT_STATUSES)

/** HRM-FHC-004–005 training completion types. */
export const HRM_FHC_TRAINING_TYPES = ["hygiene", "allergen"] as const

export type HrmFhcTrainingType = (typeof HRM_FHC_TRAINING_TYPES)[number]

export const hrmFhcTrainingTypeSchema = z.enum(HRM_FHC_TRAINING_TYPES)

/** HRM-FHC-015 renewal workflow states. */
export const HRM_FHC_RENEWAL_STATES = [
  "not_due",
  "pending",
  "submitted",
  "verified",
  "rejected",
] as const

export type HrmFhcRenewalState = (typeof HRM_FHC_RENEWAL_STATES)[number]

export const hrmFhcRenewalStateSchema = z.enum(HRM_FHC_RENEWAL_STATES)

/** HRM-FHC-016–017 verification workflow states. */
export const HRM_FHC_VERIFICATION_STATES = [
  "not_submitted",
  "pending_review",
  "verified",
  "rejected",
] as const

export type HrmFhcVerificationState =
  (typeof HRM_FHC_VERIFICATION_STATES)[number]

export const hrmFhcVerificationStateSchema = z.enum(HRM_FHC_VERIFICATION_STATES)

/** HRM-FHC-018 temporary duty restriction scope. */
export const HRM_FHC_RESTRICTION_SCOPES = [
  "food_handling",
  "kitchen",
  "service_floor",
  "all_food_duties",
] as const

export type HrmFhcRestrictionScope = (typeof HRM_FHC_RESTRICTION_SCOPES)[number]

export const hrmFhcRestrictionScopeSchema = z.enum(HRM_FHC_RESTRICTION_SCOPES)
