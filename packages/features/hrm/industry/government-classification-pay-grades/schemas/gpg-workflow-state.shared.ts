import { z } from "zod"

export const HRM_GPG_CLASSIFICATION_SCHEMES = [
  "civil_service",
  "general_schedule",
  "senior_executive",
  "agency_specific",
] as const

export const HRM_GPG_MASTER_STATES = ["draft", "active", "retired"] as const

export const HRM_GPG_SALARY_TABLE_VERSION_STATES = [
  "draft",
  "published",
  "superseded",
] as const

export const HRM_GPG_LOCALITY_TYPES = [
  "locality_area",
  "region",
  "country",
  "city",
  "duty_station",
] as const

export const HRM_GPG_ADJUSTMENT_TYPES = [
  "regional",
  "hardship",
  "remote_area",
  "cost_of_living",
] as const

export const HRM_GPG_MOVEMENT_TYPES = [
  "promotion",
  "reclassification",
  "demotion",
  "pay_retention",
  "acting_higher_duty",
  "step_increase",
] as const

export const HRM_GPG_APPOINTMENT_TYPES = [
  "permanent",
  "temporary",
  "contract",
  "acting",
] as const

export const HRM_GPG_RECLASSIFICATION_STATES = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "closed",
] as const

export const HRM_GPG_STEP_INCREASE_EVENT_STATES = [
  "pending",
  "approved",
  "rejected",
  "processed",
  "cancelled",
] as const

export const HRM_GPG_MOVEMENT_STATES = [
  "draft",
  "applied",
  "cancelled",
] as const

export const hrmGpgClassificationSchemeSchema = z.enum(
  HRM_GPG_CLASSIFICATION_SCHEMES
)
export const hrmGpgMasterStateSchema = z.enum(HRM_GPG_MASTER_STATES)
export const hrmGpgSalaryTableVersionStateSchema = z.enum(
  HRM_GPG_SALARY_TABLE_VERSION_STATES
)
export const hrmGpgLocalityTypeSchema = z.enum(HRM_GPG_LOCALITY_TYPES)
export const hrmGpgAdjustmentTypeSchema = z.enum(HRM_GPG_ADJUSTMENT_TYPES)
export const hrmGpgMovementTypeSchema = z.enum(HRM_GPG_MOVEMENT_TYPES)
export const hrmGpgAppointmentTypeSchema = z.enum(HRM_GPG_APPOINTMENT_TYPES)
export const hrmGpgReclassificationStateSchema = z.enum(
  HRM_GPG_RECLASSIFICATION_STATES
)
export const hrmGpgStepIncreaseEventStateSchema = z.enum(
  HRM_GPG_STEP_INCREASE_EVENT_STATES
)
export const hrmGpgMovementStateSchema = z.enum(HRM_GPG_MOVEMENT_STATES)

export type HrmGpgClassificationScheme = z.infer<
  typeof hrmGpgClassificationSchemeSchema
>
export type HrmGpgMasterState = z.infer<typeof hrmGpgMasterStateSchema>
export type HrmGpgSalaryTableVersionState = z.infer<
  typeof hrmGpgSalaryTableVersionStateSchema
>
export type HrmGpgLocalityType = z.infer<typeof hrmGpgLocalityTypeSchema>
export type HrmGpgAdjustmentType = z.infer<typeof hrmGpgAdjustmentTypeSchema>
export type HrmGpgMovementType = z.infer<typeof hrmGpgMovementTypeSchema>
export type HrmGpgAppointmentType = z.infer<typeof hrmGpgAppointmentTypeSchema>
export type HrmGpgReclassificationState = z.infer<
  typeof hrmGpgReclassificationStateSchema
>
export type HrmGpgStepIncreaseEventState = z.infer<
  typeof hrmGpgStepIncreaseEventStateSchema
>
export type HrmGpgMovementState = z.infer<typeof hrmGpgMovementStateSchema>
