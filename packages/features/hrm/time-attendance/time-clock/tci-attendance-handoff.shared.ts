/**
 * HRM-TCI-021 — expose validated device punches to Leave & Attendance Management.
 *
 * Accepted punches write `hrm_attendance_event` (`source = device`) then call
 * `regenerateAttendanceDayFromEvents` to materialize `hrm_attendance_day` for LAM.
 */

import { TCI_ATTENDANCE_EVENT_DEVICE_SOURCE } from "./tci-clock-punch-capture.shared"
import {
  TCI_LIST_SURFACE_IDS,
  TCI_STAT_SURFACE_KEY,
} from "./data/tci-surface-metadata.shared"

export const TCI_LAM_ATTENDANCE_EVENT_TABLE = "hrm_attendance_event" as const

export const TCI_LAM_ATTENDANCE_DAY_TABLE = "hrm_attendance_day" as const

export const TCI_LAM_HANDOFF_SYMBOL =
  "regenerateAttendanceDayFromEvents" as const

export const TCI_LAM_AGGREGATOR_SYMBOL = "aggregateAttendanceDay" as const

export const TCI_LAM_REGENERATE_RESULTS = [
  "skipped",
  "updated",
  "locked",
] as const

export type TciLamRegenerateResult = (typeof TCI_LAM_REGENERATE_RESULTS)[number]

export const TCI_ATTENDANCE_HANDOFF_PERSIST_SYMBOL =
  "persistTimeClockPunch" as const

export const TCI_ATTENDANCE_HANDOFF_IMPORT_ADAPTER_SYMBOL =
  "attendanceImportAdapter" as const

export const TCI_LAM_EXPOSURE_STATUSES = [
  "exposed",
  "locked",
  "not_exposed",
] as const

export type TciLamExposureStatus = (typeof TCI_LAM_EXPOSURE_STATUSES)[number]

export function isTciLamRegenerateResult(
  value: string
): value is TciLamRegenerateResult {
  return (TCI_LAM_REGENERATE_RESULTS as readonly string[]).includes(value)
}

export function isTciLamExposureStatus(
  value: string
): value is TciLamExposureStatus {
  return (TCI_LAM_EXPOSURE_STATUSES as readonly string[]).includes(value)
}

export function resolveTimeClockLamExposureStatus(input: {
  readonly lamDayState: string | null
}): TciLamExposureStatus {
  if (input.lamDayState === null) {
    return "not_exposed"
  }
  if (input.lamDayState === "locked") {
    return "locked"
  }
  return "exposed"
}

export type TciAttendanceHandoffSurface =
  | {
      readonly door: "persist"
      readonly symbol: typeof TCI_ATTENDANCE_HANDOFF_PERSIST_SYMBOL
      readonly requirementCodes: readonly [
        "HRM-TCI-006",
        "HRM-TCI-021",
        "HRM-TCI-029",
      ]
    }
  | {
      readonly door: "lam_handoff"
      readonly symbol: typeof TCI_LAM_HANDOFF_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-021"]
    }
  | {
      readonly door: "csv_import"
      readonly symbol: typeof TCI_ATTENDANCE_HANDOFF_IMPORT_ADAPTER_SYMBOL
      readonly requirementCodes: readonly [
        "HRM-TCI-009",
        "HRM-TCI-021",
        "HRM-TCI-029",
      ]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.attendanceHandoffFindings
      readonly requirementCodes: readonly ["HRM-TCI-021"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_STAT_SURFACE_KEY
      readonly requirementCodes: readonly ["HRM-TCI-021"]
    }
  | {
      readonly door: "report_csv"
      readonly symbol: "attendance_handoff"
      readonly requirementCodes: readonly ["HRM-TCI-021", "HRM-TCI-028"]
    }
  | {
      readonly door: "lam_read_api"
      readonly symbol: "listDevicePunchesForEmployeeDate"
      readonly requirementCodes: readonly ["HRM-TCI-021"]
    }

export const TCI_ATTENDANCE_HANDOFF_SURFACES = [
  {
    door: "persist",
    symbol: TCI_ATTENDANCE_HANDOFF_PERSIST_SYMBOL,
    requirementCodes: ["HRM-TCI-006", "HRM-TCI-021", "HRM-TCI-029"],
  },
  {
    door: "lam_handoff",
    symbol: TCI_LAM_HANDOFF_SYMBOL,
    requirementCodes: ["HRM-TCI-021"],
  },
  {
    door: "csv_import",
    symbol: TCI_ATTENDANCE_HANDOFF_IMPORT_ADAPTER_SYMBOL,
    requirementCodes: ["HRM-TCI-009", "HRM-TCI-021", "HRM-TCI-029"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.attendanceHandoffFindings,
    requirementCodes: ["HRM-TCI-021"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_STAT_SURFACE_KEY,
    requirementCodes: ["HRM-TCI-021"],
  },
  {
    door: "report_csv",
    symbol: "attendance_handoff",
    requirementCodes: ["HRM-TCI-021", "HRM-TCI-028"],
  },
  {
    door: "lam_read_api",
    symbol: "listDevicePunchesForEmployeeDate",
    requirementCodes: ["HRM-TCI-021"],
  },
] as const satisfies readonly TciAttendanceHandoffSurface[]

export function assertHrmTci021AttendanceHandoff(): void {
  if (TCI_ATTENDANCE_EVENT_DEVICE_SOURCE !== "device") {
    throw new Error(
      "TCI device attendance events must use source device for LAM handoff"
    )
  }

  for (const surface of TCI_ATTENDANCE_HANDOFF_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-021")) {
      throw new Error(
        `TCI attendance handoff surface "${surface.symbol}" must cite HRM-TCI-021`
      )
    }
  }

  if (
    resolveTimeClockLamExposureStatus({ lamDayState: "computed" }) !== "exposed"
  ) {
    throw new Error("computed LAM day must resolve exposed")
  }
  if (
    resolveTimeClockLamExposureStatus({ lamDayState: "locked" }) !== "locked"
  ) {
    throw new Error("locked LAM day must resolve locked")
  }
  if (
    resolveTimeClockLamExposureStatus({ lamDayState: null }) !== "not_exposed"
  ) {
    throw new Error("missing LAM day must resolve not_exposed")
  }
}
