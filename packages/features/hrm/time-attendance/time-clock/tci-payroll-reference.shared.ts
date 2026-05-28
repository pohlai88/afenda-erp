/**
 * HRM-TCI-023 — expose approved attendance outcomes to Payroll Processing via LAM.
 *
 * Raw device punches live on `hrm_attendance_event` (HRM-TCI-029). LAM materializes
 * `hrm_attendance_day` (TCI-021). Payroll consumes finalized days through
 * `listAttendanceDaysForEmployee` / `getPayrollRunInputSnapshot` using
 * `isAttendanceDayReadyForPayroll`.
 */

import {
  attendanceSnapshotHasPayrollBlockingException,
  isAttendanceDayReadyForPayroll,
} from "../leave-attendance-management/data/attendance-display.shared"
import { TCI_LAM_ATTENDANCE_DAY_TABLE } from "./tci-attendance-handoff.shared"
import { TCI_ATTENDANCE_EVENT_DEVICE_SOURCE } from "./tci-clock-punch-capture.shared"
import {
  TCI_LIST_SURFACE_IDS,
  TCI_STAT_SURFACE_KEY,
} from "./data/tci-surface-metadata.shared"

export const TCI_PAYROLL_APPROVED_DAY_TABLE = TCI_LAM_ATTENDANCE_DAY_TABLE

export const TCI_PAYROLL_RAW_EVENT_TABLE = "hrm_attendance_event" as const

export const TCI_PAYROLL_RAW_EVENT_SOURCE = TCI_ATTENDANCE_EVENT_DEVICE_SOURCE

export const TCI_PAYROLL_READINESS_SYMBOL =
  "isAttendanceDayReadyForPayroll" as const

export const TCI_PAYROLL_LIST_DAYS_SYMBOL =
  "listAttendanceDaysForEmployee" as const

export const TCI_PAYROLL_RUN_INPUT_SYMBOL =
  "getPayrollRunInputSnapshot" as const

export const TCI_PAYROLL_PERIOD_LOCK_SYMBOL =
  "lockPayrollPeriodAndRunsMutation" as const

export const TCI_PAYROLL_EXPOSURE_STATUSES = [
  "payroll_ready",
  "payroll_blocked",
  "pending",
  "not_materialized",
] as const

export type TciPayrollExposureStatus =
  (typeof TCI_PAYROLL_EXPOSURE_STATUSES)[number]

export function isTciPayrollExposureStatus(
  value: string
): value is TciPayrollExposureStatus {
  return (TCI_PAYROLL_EXPOSURE_STATUSES as readonly string[]).includes(value)
}

export function resolveTimeClockPayrollExposureStatus(input: {
  readonly lamDayState: string | null
  readonly calculationSnapshot: unknown | null
}): TciPayrollExposureStatus {
  if (input.lamDayState === null) {
    return "not_materialized"
  }
  if (input.lamDayState === "open") {
    return "pending"
  }
  if (
    attendanceSnapshotHasPayrollBlockingException(input.calculationSnapshot)
  ) {
    return "payroll_blocked"
  }
  if (
    isAttendanceDayReadyForPayroll(input.lamDayState, input.calculationSnapshot)
  ) {
    return "payroll_ready"
  }
  return "pending"
}

export type TciPayrollReferenceSurface =
  | {
      readonly door: "lam_aggregate"
      readonly symbol: "aggregateAttendanceDay"
      readonly requirementCodes: readonly ["HRM-TCI-021", "HRM-TCI-023"]
    }
  | {
      readonly door: "payroll_readiness"
      readonly symbol: typeof TCI_PAYROLL_READINESS_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-023"]
    }
  | {
      readonly door: "payroll_consume"
      readonly symbol: typeof TCI_PAYROLL_RUN_INPUT_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-023"]
    }
  | {
      readonly door: "payroll_lock"
      readonly symbol: typeof TCI_PAYROLL_PERIOD_LOCK_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-023"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.payrollReferenceFindings
      readonly requirementCodes: readonly ["HRM-TCI-023"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_STAT_SURFACE_KEY
      readonly requirementCodes: readonly ["HRM-TCI-023"]
    }
  | {
      readonly door: "report_csv"
      readonly symbol: "payroll_reference"
      readonly requirementCodes: readonly ["HRM-TCI-023", "HRM-TCI-028"]
    }

export const TCI_PAYROLL_REFERENCE_SURFACES = [
  {
    door: "lam_aggregate",
    symbol: "aggregateAttendanceDay",
    requirementCodes: ["HRM-TCI-021", "HRM-TCI-023"],
  },
  {
    door: "payroll_readiness",
    symbol: TCI_PAYROLL_READINESS_SYMBOL,
    requirementCodes: ["HRM-TCI-023"],
  },
  {
    door: "payroll_consume",
    symbol: TCI_PAYROLL_RUN_INPUT_SYMBOL,
    requirementCodes: ["HRM-TCI-023"],
  },
  {
    door: "payroll_lock",
    symbol: TCI_PAYROLL_PERIOD_LOCK_SYMBOL,
    requirementCodes: ["HRM-TCI-023"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.payrollReferenceFindings,
    requirementCodes: ["HRM-TCI-023"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_STAT_SURFACE_KEY,
    requirementCodes: ["HRM-TCI-023"],
  },
  {
    door: "report_csv",
    symbol: "payroll_reference",
    requirementCodes: ["HRM-TCI-023", "HRM-TCI-028"],
  },
] as const satisfies readonly TciPayrollReferenceSurface[]

export function assertHrmTci023PayrollReference(): void {
  if (TCI_PAYROLL_RAW_EVENT_SOURCE !== "device") {
    throw new Error(
      "TCI payroll reference requires device source for raw events"
    )
  }

  for (const surface of TCI_PAYROLL_REFERENCE_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-023")) {
      throw new Error(
        `TCI payroll reference surface "${surface.symbol}" must cite HRM-TCI-023`
      )
    }
  }

  if (
    resolveTimeClockPayrollExposureStatus({
      lamDayState: "computed",
      calculationSnapshot: { exceptions: [] },
    }) !== "payroll_ready"
  ) {
    throw new Error(
      "computed day without blocking exceptions must be payroll_ready"
    )
  }

  if (
    resolveTimeClockPayrollExposureStatus({
      lamDayState: "computed",
      calculationSnapshot: {
        exceptions: [{ message: "x", payrollBlocking: true }],
      },
    }) !== "payroll_blocked"
  ) {
    throw new Error("payroll-blocking snapshot must resolve payroll_blocked")
  }

  if (
    resolveTimeClockPayrollExposureStatus({
      lamDayState: null,
      calculationSnapshot: null,
    }) !== "not_materialized"
  ) {
    throw new Error("missing LAM day must resolve not_materialized")
  }
}
