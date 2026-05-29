/**
 * HRM-TCI-022 — expose actual work-hour records to Overtime Management for validation.
 *
 * Device punches (TCI-021) materialize `hrm_attendance_day.workedMinutes` and
 * `overtimeMinutes` via LAM aggregation. OTM reads those fields when comparing
 * attendance during approval (`calculateOtmPayableForApproval`).
 */

import { TCI_LAM_ATTENDANCE_DAY_TABLE } from "./tci-attendance-handoff.shared"
import {
  TCI_LIST_SURFACE_IDS,
  TCI_STAT_SURFACE_KEY,
} from "./data/tci-surface-metadata.shared"

export const TCI_OTM_WORK_HOUR_DAY_TABLE = TCI_LAM_ATTENDANCE_DAY_TABLE

export const TCI_OTM_WORKED_MINUTES_FIELD = "workedMinutes" as const

export const TCI_OTM_OVERTIME_MINUTES_FIELD = "overtimeMinutes" as const

export const TCI_OTM_ATTENDANCE_COMPARE_SYMBOL =
  "calculateOtmPayableForApproval" as const

export const TCI_OTM_WORK_HOURS_RANGE_SYMBOL =
  "getDeviceAttendanceHoursForEmployeeDateRange" as const

export const TCI_OTM_WORK_HOUR_EXPOSURE_STATUSES = [
  "exposed",
  "locked",
  "not_exposed",
] as const

export type TciOtmWorkHourExposureStatus =
  (typeof TCI_OTM_WORK_HOUR_EXPOSURE_STATUSES)[number]

export function isTciOtmWorkHourExposureStatus(
  value: string
): value is TciOtmWorkHourExposureStatus {
  return (TCI_OTM_WORK_HOUR_EXPOSURE_STATUSES as readonly string[]).includes(
    value
  )
}

export function resolveTimeClockOtmWorkHourExposureStatus(input: {
  readonly lamDayState: string | null
  readonly workedMinutes: number | null
  readonly overtimeMinutes: number | null
}): TciOtmWorkHourExposureStatus {
  if (input.lamDayState === null) {
    return "not_exposed"
  }
  if (input.lamDayState === "locked") {
    return "locked"
  }
  const worked = input.workedMinutes ?? 0
  const overtime = input.overtimeMinutes ?? 0
  if (worked === 0 && overtime === 0) {
    return "not_exposed"
  }
  return "exposed"
}

export type TciOvertimeReferenceSurface =
  | {
      readonly door: "lam_aggregate"
      readonly symbol: "aggregateAttendanceDay"
      readonly requirementCodes: readonly ["HRM-TCI-021", "HRM-TCI-022"]
    }
  | {
      readonly door: "otm_compare"
      readonly symbol: typeof TCI_OTM_ATTENDANCE_COMPARE_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-022"]
    }
  | {
      readonly door: "otm_read_api"
      readonly symbol: typeof TCI_OTM_WORK_HOURS_RANGE_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-021", "HRM-TCI-022"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.overtimeReferenceFindings
      readonly requirementCodes: readonly ["HRM-TCI-022"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_STAT_SURFACE_KEY
      readonly requirementCodes: readonly ["HRM-TCI-022"]
    }
  | {
      readonly door: "report_csv"
      readonly symbol: "overtime_reference"
      readonly requirementCodes: readonly ["HRM-TCI-022", "HRM-TCI-028"]
    }

export const TCI_OVERTIME_REFERENCE_SURFACES = [
  {
    door: "lam_aggregate",
    symbol: "aggregateAttendanceDay",
    requirementCodes: ["HRM-TCI-021", "HRM-TCI-022"],
  },
  {
    door: "otm_compare",
    symbol: TCI_OTM_ATTENDANCE_COMPARE_SYMBOL,
    requirementCodes: ["HRM-TCI-022"],
  },
  {
    door: "otm_read_api",
    symbol: TCI_OTM_WORK_HOURS_RANGE_SYMBOL,
    requirementCodes: ["HRM-TCI-021", "HRM-TCI-022"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.overtimeReferenceFindings,
    requirementCodes: ["HRM-TCI-022"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_STAT_SURFACE_KEY,
    requirementCodes: ["HRM-TCI-022"],
  },
  {
    door: "report_csv",
    symbol: "overtime_reference",
    requirementCodes: ["HRM-TCI-022", "HRM-TCI-028"],
  },
] as const satisfies readonly TciOvertimeReferenceSurface[]

export function assertHrmTci022OvertimeReference(): void {
  if (TCI_OTM_WORK_HOUR_DAY_TABLE !== "hrm_attendance_day") {
    throw new Error("TCI OTM work hours must read hrm_attendance_day")
  }

  for (const surface of TCI_OVERTIME_REFERENCE_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-022")) {
      throw new Error(
        `TCI overtime reference surface "${surface.symbol}" must cite HRM-TCI-022`
      )
    }
  }

  if (
    resolveTimeClockOtmWorkHourExposureStatus({
      lamDayState: "computed",
      workedMinutes: 480,
      overtimeMinutes: 30,
    }) !== "exposed"
  ) {
    throw new Error("day with worked/overtime minutes must resolve exposed")
  }

  if (
    resolveTimeClockOtmWorkHourExposureStatus({
      lamDayState: "computed",
      workedMinutes: 0,
      overtimeMinutes: 0,
    }) !== "not_exposed"
  ) {
    throw new Error("day with zero minutes must resolve not_exposed")
  }

  if (
    resolveTimeClockOtmWorkHourExposureStatus({
      lamDayState: "locked",
      workedMinutes: 480,
      overtimeMinutes: 0,
    }) !== "locked"
  ) {
    throw new Error("locked payroll day must resolve locked")
  }
}
