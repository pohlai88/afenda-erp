import { z } from "zod"

/** HRM-MSC-003 training completion lifecycle. */
export const HRM_MSC_TRAINING_COMPLETION_STATUSES = [
  "assigned",
  "completed",
  "overdue",
  "expired",
  "failed",
  "renewed",
  "waived",
] as const

export type HrmMscTrainingCompletionStatus =
  (typeof HRM_MSC_TRAINING_COMPLETION_STATUSES)[number]

export const hrmMscTrainingCompletionStatusSchema = z.enum(
  HRM_MSC_TRAINING_COMPLETION_STATUSES
)

/** HRM-MSC-005–007 training categories on rules and completions. */
export const HRM_MSC_TRAINING_CATEGORIES = [
  "machine_safety",
  "ppe",
  "chemical",
  "fire",
  "ergonomics",
  "workplace_hazard",
  "lockout_tagout",
  "emergency_response",
] as const

export type HrmMscTrainingCategory =
  (typeof HRM_MSC_TRAINING_CATEGORIES)[number]

export const hrmMscTrainingCategorySchema = z.enum(HRM_MSC_TRAINING_CATEGORIES)

/** Obligation / compliance rollup status (shared with FHC shape). */
export const HRM_MSC_COMPLIANCE_STATUSES = [
  "compliant",
  "pending",
  "missing",
  "expiring",
  "expired",
  "rejected",
  "waived",
  "not_required",
] as const

export type HrmMscComplianceStatus =
  (typeof HRM_MSC_COMPLIANCE_STATUSES)[number]

export const hrmMscComplianceStatusSchema = z.enum(HRM_MSC_COMPLIANCE_STATUSES)

/** HRM-MSC-008 safety certification status. */
export const HRM_MSC_CERT_STATUSES = [
  "active",
  "pending",
  "expired",
  "revoked",
  "waived",
] as const

export type HrmMscCertStatus = (typeof HRM_MSC_CERT_STATUSES)[number]

export const hrmMscCertStatusSchema = z.enum(HRM_MSC_CERT_STATUSES)

/** HRM-MSC-012–014 hazard assessment types. */
export const HRM_MSC_HAZARD_ASSESSMENT_TYPES = [
  "workplace",
  "ppe",
  "jha",
] as const

export type HrmMscHazardAssessmentType =
  (typeof HRM_MSC_HAZARD_ASSESSMENT_TYPES)[number]

export const hrmMscHazardAssessmentTypeSchema = z.enum(
  HRM_MSC_HAZARD_ASSESSMENT_TYPES
)

/** HRM-MSC-015 hazard assessment workflow status. */
export const HRM_MSC_HAZARD_ASSESSMENT_STATUSES = [
  "draft",
  "active",
  "reviewed",
  "expired",
  "superseded",
  "closed",
] as const

export type HrmMscHazardAssessmentStatus =
  (typeof HRM_MSC_HAZARD_ASSESSMENT_STATUSES)[number]

export const hrmMscHazardAssessmentStatusSchema = z.enum(
  HRM_MSC_HAZARD_ASSESSMENT_STATUSES
)

/** HRM-MSC-017 incident types. */
export const HRM_MSC_INCIDENT_TYPES = [
  "injury",
  "near_miss",
  "unsafe_condition",
  "property_damage",
  "exposure_event",
  "safety_observation",
] as const

export type HrmMscIncidentType = (typeof HRM_MSC_INCIDENT_TYPES)[number]

export const hrmMscIncidentTypeSchema = z.enum(HRM_MSC_INCIDENT_TYPES)

/** HRM-MSC-020 incident status workflow. */
export const HRM_MSC_INCIDENT_STATUSES = [
  "reported",
  "under_review",
  "corrective_action_pending",
  "closed",
  "recordable_reference",
] as const

export type HrmMscIncidentStatus = (typeof HRM_MSC_INCIDENT_STATUSES)[number]

export const hrmMscIncidentStatusSchema = z.enum(HRM_MSC_INCIDENT_STATUSES)

/** HRM-MSC-022 corrective action priority and status. */
export const HRM_MSC_CORRECTIVE_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const

export type HrmMscCorrectivePriority =
  (typeof HRM_MSC_CORRECTIVE_PRIORITIES)[number]

export const hrmMscCorrectivePrioritySchema = z.enum(
  HRM_MSC_CORRECTIVE_PRIORITIES
)

export const HRM_MSC_CORRECTIVE_STATUSES = [
  "open",
  "in_progress",
  "completed",
  "cancelled",
] as const

export type HrmMscCorrectiveStatus =
  (typeof HRM_MSC_CORRECTIVE_STATUSES)[number]

export const hrmMscCorrectiveStatusSchema = z.enum(HRM_MSC_CORRECTIVE_STATUSES)

/** HRM-MSC-021 corrective action source kinds. */
export const HRM_MSC_CORRECTIVE_SOURCE_KINDS = [
  "incident",
  "hazard",
  "training_gap",
  "audit_finding",
] as const

export type HrmMscCorrectiveActionSourceKind =
  (typeof HRM_MSC_CORRECTIVE_SOURCE_KINDS)[number]

export const hrmMscCorrectiveActionSourceKindSchema = z.enum(
  HRM_MSC_CORRECTIVE_SOURCE_KINDS
)

/** HRM-MSC-011 work restriction scope. */
export const HRM_MSC_RESTRICTION_SCOPES = [
  "machine",
  "work_area",
  "duty",
] as const

export type HrmMscRestrictionScope = (typeof HRM_MSC_RESTRICTION_SCOPES)[number]

export const hrmMscRestrictionScopeSchema = z.enum(HRM_MSC_RESTRICTION_SCOPES)

/** HRM-MSC-004 regulatory frameworks. */
export const HRM_MSC_REGULATORY_FRAMEWORKS = [
  "osha",
  "osh",
  "malaysia_osh_1994",
  "other",
] as const

export type HrmMscRegulatoryFramework =
  (typeof HRM_MSC_REGULATORY_FRAMEWORKS)[number]

export const hrmMscRegulatoryFrameworkSchema = z.enum(
  HRM_MSC_REGULATORY_FRAMEWORKS
)
