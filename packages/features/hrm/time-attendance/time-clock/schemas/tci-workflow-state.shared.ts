export const TCI_DEVICE_TYPES = [
  "biometric",
  "card",
  "rfid",
  "kiosk",
  "web",
  "api",
] as const

export type TciDeviceType = (typeof TCI_DEVICE_TYPES)[number]

export const TCI_DEVICE_STATES = ["active", "inactive", "revoked"] as const

export type TciDeviceState = (typeof TCI_DEVICE_STATES)[number]

/** Mutable registry states (revoke is a dedicated command). */
export const TCI_DEVICE_REGISTRY_STATES = ["active", "inactive"] as const

export type TciDeviceRegistryState = (typeof TCI_DEVICE_REGISTRY_STATES)[number]

export const TCI_DEVICE_SYNC_STATUSES = [
  "idle",
  "syncing",
  "failed",
  "ok",
] as const

export type TciDeviceSyncStatus = (typeof TCI_DEVICE_SYNC_STATUSES)[number]

export const TCI_MAPPING_STATES = ["active", "inactive"] as const

export type TciMappingState = (typeof TCI_MAPPING_STATES)[number]

/** HRM-TCI-006 — clock-in / clock-out capture (device ingest). */
export const TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES = [
  "clock_in",
  "clock_out",
] as const

export type TciClockInOutPunchEventType =
  (typeof TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES)[number]

/** HRM-TCI-007 — break start / break end capture (device ingest when enabled). */
export const TCI_BREAK_PUNCH_EVENT_TYPES = ["break_start", "break_end"] as const

export type TciBreakPunchEventType =
  (typeof TCI_BREAK_PUNCH_EVENT_TYPES)[number]

/** HRM-TCI-016 — site/role transfer punch (distinct from clock-in/out). */
export const TCI_TRANSFER_PUNCH_EVENT_TYPE = "transfer" as const

export type TciTransferPunchEventType = typeof TCI_TRANSFER_PUNCH_EVENT_TYPE

export const TCI_CORRECTION_PUNCH_EVENT_TYPE = "correction" as const

export type TciCorrectionPunchEventType = typeof TCI_CORRECTION_PUNCH_EVENT_TYPE

export const TCI_PUNCH_EVENT_TYPES = [
  ...TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES,
  ...TCI_BREAK_PUNCH_EVENT_TYPES,
  TCI_TRANSFER_PUNCH_EVENT_TYPE,
  TCI_CORRECTION_PUNCH_EVENT_TYPE,
] as const

export type TciPunchEventType = (typeof TCI_PUNCH_EVENT_TYPES)[number]

export function isTciClassifiedPunchEventType(
  value: string
): value is TciPunchEventType {
  return (TCI_PUNCH_EVENT_TYPES as readonly string[]).includes(value)
}

export function isTciTransferPunchEventType(
  value: string
): value is TciTransferPunchEventType {
  return value === TCI_TRANSFER_PUNCH_EVENT_TYPE
}

export function isTciClockInOutPunchEventType(
  value: string
): value is TciClockInOutPunchEventType {
  return (TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES as readonly string[]).includes(
    value
  )
}

export function isTciBreakPunchEventType(
  value: string
): value is TciBreakPunchEventType {
  return (TCI_BREAK_PUNCH_EVENT_TYPES as readonly string[]).includes(value)
}

export const TCI_EXCEPTION_STATES = [
  "submitted",
  "approved",
  "rejected",
  "cancelled",
] as const

export type TciExceptionState = (typeof TCI_EXCEPTION_STATES)[number]

export const TCI_DETECTION_OUTCOMES = [
  "verified",
  "unknown_employee",
  "inactive_employee",
  "unmapped_device_user",
  "duplicate_punch",
  "outside_shift_window",
  "inactive_device",
  "break_capture_disabled",
] as const

export type TciDetectionOutcome = (typeof TCI_DETECTION_OUTCOMES)[number]

export const TCI_SYNC_SOURCE_KINDS = [
  "api",
  "manual_import",
  "scheduled",
  "offline_replay",
] as const

export type TciSyncSourceKind = (typeof TCI_SYNC_SOURCE_KINDS)[number]
