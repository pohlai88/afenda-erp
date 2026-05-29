/**
 * HRM-TCI-024 — correction workflow for invalid, missing, duplicate, or unmatched punches.
 *
 * Ingest failures land in `hrm_time_clock_punch_exception` (approve/reject via
 * `decideTimeClockPunchException`). Approved rows with `resolvedEventId` and LAM
 * snapshot findings use `AttendanceCorrectionDialog` (HRM-TCI-025 gates
 * `attendance.update`).
 */

import { TCI_ABNORMAL_PUNCH_LAM_CODES } from "./tci-abnormal-punch-detection.shared"
import { TCI_DUPLICATE_SEQUENCE_CODES } from "./tci-duplicate-detection.shared"
import { TCI_MISSING_PUNCH_CODES } from "./tci-missing-punch-detection.shared"
import {
  TCI_LIST_SURFACE_IDS,
  TCI_STAT_SURFACE_KEY,
} from "./data/tci-surface-metadata.shared"
import { TCI_DETECTION_OUTCOMES } from "./schemas/tci-workflow-state.shared"

export const TCI_CORRECTION_EXCEPTION_TABLE =
  "hrm_time_clock_punch_exception" as const

export const TCI_CORRECTION_DECIDE_SYMBOL =
  "decideTimeClockPunchException" as const

export const TCI_CORRECTION_LAM_DIALOG_SYMBOL =
  "AttendanceCorrectionDialog" as const

export const TCI_CORRECTION_LAM_SUBMIT_SYMBOL =
  "submitAttendanceCorrectionForApproval" as const

export const TCI_CORRECTION_HR_OVERRIDE_FIELD = "hrOverrideShiftWindow" as const

export const TCI_CORRECTION_CATEGORIES = [
  "invalid",
  "missing",
  "duplicate",
  "unmatched",
] as const

export type TciCorrectionCategory = (typeof TCI_CORRECTION_CATEGORIES)[number]

export const TCI_CORRECTION_WORKFLOW_STEPS = [
  "needs_decision",
  "needs_lam_correction",
  "lam_snapshot_correct",
] as const

export type TciCorrectionWorkflowStep =
  (typeof TCI_CORRECTION_WORKFLOW_STEPS)[number]

export const TCI_CORRECTION_INVALID_OUTCOMES = [
  "unknown_employee",
  "inactive_employee",
  "unmapped_device_user",
  "inactive_device",
  "break_capture_disabled",
  "outside_shift_window",
] as const

export function isTciCorrectionCategory(
  value: string
): value is TciCorrectionCategory {
  return (TCI_CORRECTION_CATEGORIES as readonly string[]).includes(value)
}

export function resolveCorrectionCategoryFromDetectionOutcome(
  outcome: string
): TciCorrectionCategory {
  if (outcome === "duplicate_punch") return "duplicate"
  if (
    (TCI_CORRECTION_INVALID_OUTCOMES as readonly string[]).includes(outcome)
  ) {
    return "invalid"
  }
  return "invalid"
}

export function resolveCorrectionCategoryFromLamCodes(
  codes: readonly string[]
): TciCorrectionCategory {
  if (
    codes.some((code) =>
      (TCI_MISSING_PUNCH_CODES as readonly string[]).includes(code)
    )
  ) {
    return "missing"
  }
  if (
    codes.some((code) =>
      (TCI_DUPLICATE_SEQUENCE_CODES as readonly string[]).includes(code)
    )
  ) {
    return "duplicate"
  }
  if (codes.includes("clock_out_without_clock_in")) return "unmatched"
  if (
    codes.some((code) =>
      (TCI_ABNORMAL_PUNCH_LAM_CODES as readonly string[]).includes(code)
    )
  ) {
    return "invalid"
  }
  return "invalid"
}

export type TciCorrectionWorkflowSurface =
  | {
      readonly door: "exception_decide"
      readonly symbol: typeof TCI_CORRECTION_DECIDE_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-024", "HRM-TCI-025"]
    }
  | {
      readonly door: "lam_correction"
      readonly symbol: typeof TCI_CORRECTION_LAM_DIALOG_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-024", "HRM-TCI-025"]
    }
  | {
      readonly door: "pattern_c_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.exceptions
      readonly requirementCodes: readonly ["HRM-TCI-024"]
    }
  | {
      readonly door: "pattern_c_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.correctionWorkflow
      readonly requirementCodes: readonly ["HRM-TCI-024"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_STAT_SURFACE_KEY
      readonly requirementCodes: readonly ["HRM-TCI-024"]
    }
  | {
      readonly door: "report_csv"
      readonly symbol: "correction_workflow"
      readonly requirementCodes: readonly ["HRM-TCI-024", "HRM-TCI-028"]
    }

export const TCI_CORRECTION_WORKFLOW_SURFACES = [
  {
    door: "exception_decide",
    symbol: TCI_CORRECTION_DECIDE_SYMBOL,
    requirementCodes: ["HRM-TCI-024", "HRM-TCI-025"],
  },
  {
    door: "lam_correction",
    symbol: TCI_CORRECTION_LAM_DIALOG_SYMBOL,
    requirementCodes: ["HRM-TCI-024", "HRM-TCI-025"],
  },
  {
    door: "pattern_c_ui",
    symbol: TCI_LIST_SURFACE_IDS.exceptions,
    requirementCodes: ["HRM-TCI-024"],
  },
  {
    door: "pattern_c_ui",
    symbol: TCI_LIST_SURFACE_IDS.correctionWorkflow,
    requirementCodes: ["HRM-TCI-024"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_STAT_SURFACE_KEY,
    requirementCodes: ["HRM-TCI-024"],
  },
  {
    door: "report_csv",
    symbol: "correction_workflow",
    requirementCodes: ["HRM-TCI-024", "HRM-TCI-028"],
  },
] as const satisfies readonly TciCorrectionWorkflowSurface[]

export function assertHrmTci024CorrectionWorkflow(): void {
  if (
    !(TCI_DETECTION_OUTCOMES as readonly string[]).includes("duplicate_punch")
  ) {
    throw new Error(
      "TCI correction workflow requires duplicate_punch detection outcome"
    )
  }

  for (const surface of TCI_CORRECTION_WORKFLOW_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-024")) {
      throw new Error(
        `TCI correction workflow surface "${surface.symbol}" must cite HRM-TCI-024`
      )
    }
  }

  if (
    resolveCorrectionCategoryFromDetectionOutcome("duplicate_punch") !==
    "duplicate"
  ) {
    throw new Error("duplicate_punch must map to duplicate correction category")
  }

  if (
    resolveCorrectionCategoryFromLamCodes(["clock_out_without_clock_in"]) !==
    "unmatched"
  ) {
    throw new Error("clock_out_without_clock_in must map to unmatched category")
  }

  if (
    resolveCorrectionCategoryFromLamCodes(["missing_clock_in"]) !== "missing"
  ) {
    throw new Error("missing_clock_in must map to missing correction category")
  }
}
