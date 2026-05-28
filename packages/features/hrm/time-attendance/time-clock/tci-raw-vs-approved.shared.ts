/**
 * HRM-TCI-029 — raw device punches stay on `hrm_attendance_event`; approved attendance
 * outcomes materialize on `hrm_attendance_day` via LAM. Payroll and OTM read day aggregates,
 * not the raw punch ledger alone.
 */

import { TCI_ATTENDANCE_EVENT_DEVICE_SOURCE } from "./tci-clock-punch-capture.shared"
import {
  TCI_LAM_ATTENDANCE_DAY_TABLE,
  TCI_LAM_ATTENDANCE_EVENT_TABLE,
  TCI_LAM_HANDOFF_SYMBOL,
} from "./tci-attendance-handoff.shared"
import {
  TCI_LIST_SURFACE_IDS,
  TCI_STAT_SURFACE_KEY,
} from "./data/tci-surface-metadata.shared"
import { TCI_PAYROLL_READINESS_SYMBOL } from "./tci-payroll-reference.shared"

export const TCI_RAW_PUNCH_LEDGER_TABLE = TCI_LAM_ATTENDANCE_EVENT_TABLE

export const TCI_RAW_PUNCH_LEDGER_SOURCE = TCI_ATTENDANCE_EVENT_DEVICE_SOURCE

export const TCI_APPROVED_ATTENDANCE_OUTCOME_TABLE =
  TCI_LAM_ATTENDANCE_DAY_TABLE

export const TCI_RAW_VS_APPROVED_PERSIST_SYMBOL =
  "persistTimeClockPunch" as const

export const TCI_RAW_VS_APPROVED_REGENERATE_SYMBOL = TCI_LAM_HANDOFF_SYMBOL

export const TCI_RAW_VS_APPROVED_PAYROLL_READ_SYMBOL =
  TCI_PAYROLL_READINESS_SYMBOL

/** Per employee-day: how raw device punches relate to the LAM day aggregate. */
export const TCI_RAW_VS_APPROVED_RELATIONSHIPS = [
  "raw_without_approved_day",
  "approved_day_open",
  "approved_day_computed",
  "approved_day_locked",
] as const

export type TciRawVsApprovedRelationship =
  (typeof TCI_RAW_VS_APPROVED_RELATIONSHIPS)[number]

export function isTciRawVsApprovedRelationship(
  value: string
): value is TciRawVsApprovedRelationship {
  return (TCI_RAW_VS_APPROVED_RELATIONSHIPS as readonly string[]).includes(
    value
  )
}

export function resolveTimeClockRawVsApprovedRelationship(input: {
  readonly lamDayState: string | null
}): TciRawVsApprovedRelationship {
  if (input.lamDayState === null) {
    return "raw_without_approved_day"
  }
  if (input.lamDayState === "open") {
    return "approved_day_open"
  }
  if (input.lamDayState === "locked") {
    return "approved_day_locked"
  }
  return "approved_day_computed"
}

export type TciRawVsApprovedSurface =
  | {
      readonly door: "raw_ledger"
      readonly symbol: typeof TCI_RAW_VS_APPROVED_PERSIST_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-006", "HRM-TCI-029"]
    }
  | {
      readonly door: "lam_materialize"
      readonly symbol: typeof TCI_RAW_VS_APPROVED_REGENERATE_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-021", "HRM-TCI-029"]
    }
  | {
      readonly door: "approved_consume"
      readonly symbol: typeof TCI_RAW_VS_APPROVED_PAYROLL_READ_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-023", "HRM-TCI-029"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.rawVsApprovedFindings
      readonly requirementCodes: readonly ["HRM-TCI-029"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_STAT_SURFACE_KEY
      readonly requirementCodes: readonly ["HRM-TCI-029"]
    }
  | {
      readonly door: "report_csv"
      readonly symbol: "raw_vs_approved"
      readonly requirementCodes: readonly ["HRM-TCI-028", "HRM-TCI-029"]
    }

export const TCI_RAW_VS_APPROVED_SURFACES = [
  {
    door: "raw_ledger",
    symbol: TCI_RAW_VS_APPROVED_PERSIST_SYMBOL,
    requirementCodes: ["HRM-TCI-006", "HRM-TCI-029"],
  },
  {
    door: "lam_materialize",
    symbol: TCI_RAW_VS_APPROVED_REGENERATE_SYMBOL,
    requirementCodes: ["HRM-TCI-021", "HRM-TCI-029"],
  },
  {
    door: "approved_consume",
    symbol: TCI_RAW_VS_APPROVED_PAYROLL_READ_SYMBOL,
    requirementCodes: ["HRM-TCI-023", "HRM-TCI-029"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.rawVsApprovedFindings,
    requirementCodes: ["HRM-TCI-029"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_STAT_SURFACE_KEY,
    requirementCodes: ["HRM-TCI-029"],
  },
  {
    door: "report_csv",
    symbol: "raw_vs_approved",
    requirementCodes: ["HRM-TCI-028", "HRM-TCI-029"],
  },
] as const satisfies readonly TciRawVsApprovedSurface[]

export function assertHrmTci029RawVsApprovedSeparation(): void {
  if (TCI_RAW_PUNCH_LEDGER_SOURCE !== "device") {
    throw new Error("TCI raw punch ledger must use source device")
  }
  if (TCI_RAW_PUNCH_LEDGER_TABLE !== "hrm_attendance_event") {
    throw new Error("TCI raw punches must live on hrm_attendance_event")
  }
  if (TCI_APPROVED_ATTENDANCE_OUTCOME_TABLE !== "hrm_attendance_day") {
    throw new Error("TCI approved outcomes must live on hrm_attendance_day")
  }

  for (const surface of TCI_RAW_VS_APPROVED_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-029")) {
      throw new Error(
        `TCI raw vs approved surface "${surface.symbol}" must cite HRM-TCI-029`
      )
    }
  }

  if (
    resolveTimeClockRawVsApprovedRelationship({ lamDayState: null }) !==
    "raw_without_approved_day"
  ) {
    throw new Error("missing LAM day must resolve raw_without_approved_day")
  }
  if (
    resolveTimeClockRawVsApprovedRelationship({ lamDayState: "open" }) !==
    "approved_day_open"
  ) {
    throw new Error("open LAM day must resolve approved_day_open")
  }
  if (
    resolveTimeClockRawVsApprovedRelationship({ lamDayState: "locked" }) !==
    "approved_day_locked"
  ) {
    throw new Error("locked LAM day must resolve approved_day_locked")
  }
  if (
    resolveTimeClockRawVsApprovedRelationship({ lamDayState: "computed" }) !==
    "approved_day_computed"
  ) {
    throw new Error("computed LAM day must resolve approved_day_computed")
  }
}
