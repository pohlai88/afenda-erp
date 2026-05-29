/**
 * HRM-TCI-020 — match device punches against `hrm_shift_assignment` when present.
 *
 * When no assignment exists for (org, employee, attendance date), ingest proceeds without
 * shift window checks. When assignment exists, `isTimeClockPunchWithinShiftWindow` gates
 * ingest (`outside_shift_window` → exception inbox; HRM-TCI-019 surfaces early/late via LAM).
 */

import {
  TCI_LIST_SURFACE_IDS,
  TCI_STAT_SURFACE_KEY,
} from "./data/tci-surface-metadata.shared"
import {
  TCI_SHIFT_WINDOW_MS,
  isTimeClockPunchWithinShiftWindow,
} from "./data/tci-punch-validation.shared"

export { TCI_SHIFT_WINDOW_MS, isTimeClockPunchWithinShiftWindow }

export const TCI_SHIFT_ASSIGNMENT_TABLE = "hrm_shift_assignment" as const

export const TCI_SHIFT_MATCH_LOOKUP_SYMBOL =
  "findShiftAssignmentForTimeClockPunch" as const

export const TCI_SHIFT_MATCH_VALIDATION_SYMBOL =
  "evaluateTimeClockPunch" as const

export const TCI_SHIFT_MATCH_OUTSIDE_OUTCOME = "outside_shift_window" as const

export const TCI_SHIFT_MATCH_STATUSES = [
  "no_assignment",
  "within_window",
  "outside_window",
] as const

export type TciShiftMatchStatus = (typeof TCI_SHIFT_MATCH_STATUSES)[number]

export type TciShiftAssignmentWindow = {
  readonly scheduledStartAt: Date
  readonly scheduledEndAt: Date
}

export function isTciShiftMatchStatus(
  value: string
): value is TciShiftMatchStatus {
  return (TCI_SHIFT_MATCH_STATUSES as readonly string[]).includes(value)
}

export function resolveTimeClockShiftMatchStatus(input: {
  readonly occurredAt: Date
  readonly shift: TciShiftAssignmentWindow | null
  readonly windowMs?: number
}): TciShiftMatchStatus {
  if (!input.shift) {
    return "no_assignment"
  }
  return isTimeClockPunchWithinShiftWindow({
    occurredAt: input.occurredAt,
    scheduledStartAt: input.shift.scheduledStartAt,
    scheduledEndAt: input.shift.scheduledEndAt,
    windowMs: input.windowMs,
  })
    ? "within_window"
    : "outside_window"
}

export type TciShiftMatchingSurface =
  | {
      readonly door: "validation"
      readonly symbol: typeof TCI_SHIFT_MATCH_VALIDATION_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-020"]
    }
  | {
      readonly door: "persist"
      readonly symbol: "persistTimeClockPunch"
      readonly requirementCodes: readonly ["HRM-TCI-020", "HRM-TCI-024"]
    }
  | {
      readonly door: "pattern_c_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.exceptions
      readonly requirementCodes: readonly [
        "HRM-TCI-019",
        "HRM-TCI-020",
        "HRM-TCI-024",
      ]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.shiftMatchFindings
      readonly requirementCodes: readonly ["HRM-TCI-020"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_STAT_SURFACE_KEY
      readonly requirementCodes: readonly ["HRM-TCI-020"]
    }
  | {
      readonly door: "report_csv"
      readonly symbol: "shift_match"
      readonly requirementCodes: readonly ["HRM-TCI-020", "HRM-TCI-028"]
    }

export const TCI_SHIFT_MATCHING_SURFACES = [
  {
    door: "validation",
    symbol: TCI_SHIFT_MATCH_VALIDATION_SYMBOL,
    requirementCodes: ["HRM-TCI-020"],
  },
  {
    door: "persist",
    symbol: "persistTimeClockPunch",
    requirementCodes: ["HRM-TCI-020", "HRM-TCI-024"],
  },
  {
    door: "pattern_c_ui",
    symbol: TCI_LIST_SURFACE_IDS.exceptions,
    requirementCodes: ["HRM-TCI-019", "HRM-TCI-020", "HRM-TCI-024"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.shiftMatchFindings,
    requirementCodes: ["HRM-TCI-020"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_STAT_SURFACE_KEY,
    requirementCodes: ["HRM-TCI-020"],
  },
  {
    door: "report_csv",
    symbol: "shift_match",
    requirementCodes: ["HRM-TCI-020", "HRM-TCI-028"],
  },
] as const satisfies readonly TciShiftMatchingSurface[]

export function assertHrmTci020ShiftMatching(): void {
  if (TCI_SHIFT_WINDOW_MS !== 60 * 60 * 1000) {
    throw new Error(
      "TCI_SHIFT_WINDOW_MS must remain one hour unless ARCHITECTURE is updated"
    )
  }

  for (const surface of TCI_SHIFT_MATCHING_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-020")) {
      throw new Error(
        `TCI shift matching surface "${surface.symbol}" must cite HRM-TCI-020`
      )
    }
  }

  const within = resolveTimeClockShiftMatchStatus({
    occurredAt: new Date("2026-03-02T09:00:00.000Z"),
    shift: {
      scheduledStartAt: new Date("2026-03-02T08:00:00.000Z"),
      scheduledEndAt: new Date("2026-03-02T17:00:00.000Z"),
    },
  })
  if (within !== "within_window") {
    throw new Error("punch inside shift ± window must resolve within_window")
  }

  const outside = resolveTimeClockShiftMatchStatus({
    occurredAt: new Date("2026-03-02T06:00:00.000Z"),
    shift: {
      scheduledStartAt: new Date("2026-03-02T08:00:00.000Z"),
      scheduledEndAt: new Date("2026-03-02T17:00:00.000Z"),
    },
  })
  if (outside !== "outside_window") {
    throw new Error("punch before shift window must resolve outside_window")
  }

  const none = resolveTimeClockShiftMatchStatus({
    occurredAt: new Date("2026-03-02T09:00:00.000Z"),
    shift: null,
  })
  if (none !== "no_assignment") {
    throw new Error("missing shift assignment must resolve no_assignment")
  }
}
