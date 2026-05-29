import { z } from "zod"

export const HRM_RWS_PERIOD_KINDS = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "seasonal",
  "campaign",
] as const

export const HRM_RWS_PERIOD_STATES = [
  "draft",
  "published",
  "archived",
] as const

export const HRM_RWS_RETAIL_ROLES = [
  "cashier",
  "supervisor",
  "key_holder",
  "sales_associate",
  "stockroom",
  "visual_merchandising",
] as const

export const HRM_RWS_OPEN_SHIFT_STATUSES = [
  "open",
  "claimed",
  "pending_approval",
  "filled",
  "cancelled",
] as const

export const HRM_RWS_CLAIM_MODES = ["first_come", "approval_required"] as const

export const HRM_RWS_DEMAND_REFERENCE_KINDS = [
  "sales_volume",
  "footfall",
  "promotion",
  "holiday",
  "forecast",
  "manual",
] as const

export const hrmRwsPeriodKindSchema = z.enum(HRM_RWS_PERIOD_KINDS)
export const hrmRwsPeriodStateSchema = z.enum(HRM_RWS_PERIOD_STATES)
export const hrmRwsRetailRoleSchema = z.enum(HRM_RWS_RETAIL_ROLES)
export const hrmRwsOpenShiftStatusSchema = z.enum(HRM_RWS_OPEN_SHIFT_STATUSES)
export const hrmRwsClaimModeSchema = z.enum(HRM_RWS_CLAIM_MODES)
export const hrmRwsDemandReferenceKindSchema = z.enum(
  HRM_RWS_DEMAND_REFERENCE_KINDS
)

export type HrmRwsPeriodKind = z.infer<typeof hrmRwsPeriodKindSchema>
export type HrmRwsPeriodState = z.infer<typeof hrmRwsPeriodStateSchema>
export type HrmRwsRetailRole = z.infer<typeof hrmRwsRetailRoleSchema>
export type HrmRwsOpenShiftStatus = z.infer<typeof hrmRwsOpenShiftStatusSchema>
export type HrmRwsClaimMode = z.infer<typeof hrmRwsClaimModeSchema>
export type HrmRwsDemandReferenceKind = z.infer<
  typeof hrmRwsDemandReferenceKindSchema
>
