export const HRM_FRM_WORKSITE_TYPES = [
  "project",
  "client",
  "branch",
  "field_zone",
  "service_area",
  "approved_remote",
] as const

export type HrmFrmWorksiteType = (typeof HRM_FRM_WORKSITE_TYPES)[number]

export const HRM_FRM_ASSIGNMENT_TYPES = [
  "temporary",
  "recurring",
  "project",
  "client",
  "travel",
] as const

export type HrmFrmAssignmentType = (typeof HRM_FRM_ASSIGNMENT_TYPES)[number]

export const HRM_FRM_TRAVEL_CLASSES = [
  "local_field_visit",
  "outstation",
  "overnight",
  "cross_border",
  "temporary_relocation",
] as const

export type HrmFrmTravelClass = (typeof HRM_FRM_TRAVEL_CLASSES)[number]

export const HRM_FRM_EXCEPTION_CODES = [
  "outside_site",
  "missing_check_in",
  "missing_check_out",
  "late_check_in",
  "incomplete_attendance",
  "manual_correction",
] as const

export type HrmFrmExceptionCode = (typeof HRM_FRM_EXCEPTION_CODES)[number]

export const HRM_FRM_SYNC_STATUSES = [
  "pending",
  "synced",
  "failed",
  "reconciled",
] as const

export type HrmFrmSyncStatus = (typeof HRM_FRM_SYNC_STATUSES)[number]

export const HRM_FRM_SAFETY_EVENT_TYPES = ["arrival", "site_departure"] as const

export type HrmFrmSafetyEventType = (typeof HRM_FRM_SAFETY_EVENT_TYPES)[number]
