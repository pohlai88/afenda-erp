/**
 * HRM-TCI-016 — classify punch records (wire `eventType` on ingest and attendance ledger).
 *
 * Requirement vocabulary maps to persisted values on `hrm_attendance_event.eventType`
 * and `hrm_time_clock_punch_exception.eventType`.
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import {
  TCI_BREAK_PUNCH_EVENT_TYPES,
  TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES,
  TCI_CORRECTION_PUNCH_EVENT_TYPE,
  TCI_PUNCH_EVENT_TYPES,
  TCI_TRANSFER_PUNCH_EVENT_TYPE,
  type TciBreakPunchEventType,
  type TciClockInOutPunchEventType,
  type TciPunchEventType,
} from "./schemas/tci-workflow-state.shared"

export {
  TCI_PUNCH_EVENT_TYPES,
  TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES,
  TCI_BREAK_PUNCH_EVENT_TYPES,
  TCI_TRANSFER_PUNCH_EVENT_TYPE,
  TCI_CORRECTION_PUNCH_EVENT_TYPE,
  type TciPunchEventType,
} from "./schemas/tci-workflow-state.shared"

export const TCI_PUNCH_CLASSIFICATION_ATTENDANCE_COLUMN = "eventType" as const

export const TCI_PUNCH_CLASSIFICATION_INGEST_SCHEMA =
  "timeClockIngestPunchSchema" as const

export const TCI_PUNCH_CLASSIFICATION_MANUAL_ROW_SCHEMA =
  "timeClockManualImportRowSchema" as const

export type TciPunchClassificationRequirement =
  | "clock-in"
  | "clock-out"
  | "break-in"
  | "break-out"
  | "transfer-punch"
  | "correction-punch"

export type TciPunchClassificationEntry = {
  readonly requirement: TciPunchClassificationRequirement
  readonly eventType: TciPunchEventType
  readonly i18nLabelKey: string
}

/** Enterprise requirement ↔ wire value (stable for contract tests and vendor maps). */
export const TCI_PUNCH_CLASSIFICATION_TAXONOMY = [
  {
    requirement: "clock-in",
    eventType: "clock_in",
    i18nLabelKey: "clock_in",
  },
  {
    requirement: "clock-out",
    eventType: "clock_out",
    i18nLabelKey: "clock_out",
  },
  {
    requirement: "break-in",
    eventType: "break_start",
    i18nLabelKey: "break_start",
  },
  {
    requirement: "break-out",
    eventType: "break_end",
    i18nLabelKey: "break_end",
  },
  {
    requirement: "transfer-punch",
    eventType: TCI_TRANSFER_PUNCH_EVENT_TYPE,
    i18nLabelKey: TCI_TRANSFER_PUNCH_EVENT_TYPE,
  },
  {
    requirement: "correction-punch",
    eventType: TCI_CORRECTION_PUNCH_EVENT_TYPE,
    i18nLabelKey: TCI_CORRECTION_PUNCH_EVENT_TYPE,
  },
] as const satisfies readonly TciPunchClassificationEntry[]

export type TciPunchClassificationSurface = {
  readonly door:
    | "workflow_enum"
    | "ingest_schema"
    | "vendor_map"
    | "persist"
    | "pattern_b_ui"
    | "pattern_c_ui"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_PUNCH_CLASSIFICATION_SURFACES = [
  {
    door: "workflow_enum",
    symbol: "TCI_PUNCH_EVENT_TYPES",
    requirementCodes: ["HRM-TCI-016"],
  },
  {
    door: "ingest_schema",
    symbol: TCI_PUNCH_CLASSIFICATION_INGEST_SCHEMA,
    requirementCodes: ["HRM-TCI-016", "HRM-TCI-010", "HRM-TCI-009"],
  },
  {
    door: "ingest_schema",
    symbol: TCI_PUNCH_CLASSIFICATION_MANUAL_ROW_SCHEMA,
    requirementCodes: ["HRM-TCI-016", "HRM-TCI-009"],
  },
  {
    door: "vendor_map",
    symbol: "parseZebraVendorPollPayload",
    requirementCodes: ["HRM-TCI-016", "HRM-TCI-011"],
  },
  {
    door: "vendor_map",
    symbol: "parseUkgVendorPollPayload",
    requirementCodes: ["HRM-TCI-016", "HRM-TCI-011"],
  },
  {
    door: "persist",
    symbol: "persistTimeClockPunch",
    requirementCodes: ["HRM-TCI-016", "HRM-TCI-006"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.punchRecords,
    requirementCodes: ["HRM-TCI-016", "HRM-TCI-006"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.breakPunchRecords,
    requirementCodes: ["HRM-TCI-016", "HRM-TCI-007"],
  },
  {
    door: "pattern_c_ui",
    symbol: TCI_LIST_SURFACE_IDS.exceptions,
    requirementCodes: ["HRM-TCI-016", "HRM-TCI-024"],
  },
] as const satisfies readonly TciPunchClassificationSurface[]

export type TimeClockPunchClassificationResult =
  | { readonly ok: true; readonly eventType: TciPunchEventType }
  | { readonly ok: false; readonly message: string }

export function isTciClassifiedPunchEventType(
  value: string
): value is TciPunchEventType {
  return (TCI_PUNCH_EVENT_TYPES as readonly string[]).includes(value)
}

export function resolveTimeClockPunchClassification(
  eventType: string
): TimeClockPunchClassificationResult {
  if (!isTciClassifiedPunchEventType(eventType)) {
    return {
      ok: false,
      message: `Unsupported punch event type "${eventType}".`,
    }
  }
  return { ok: true, eventType }
}

export function isTciClockInOutClassification(
  eventType: TciPunchEventType
): eventType is TciClockInOutPunchEventType {
  return (TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES as readonly string[]).includes(
    eventType
  )
}

export function isTciBreakClassification(
  eventType: TciPunchEventType
): eventType is TciBreakPunchEventType {
  return (TCI_BREAK_PUNCH_EVENT_TYPES as readonly string[]).includes(eventType)
}

export function assertHrmTci016PunchClassification(): void {
  if (TCI_PUNCH_CLASSIFICATION_TAXONOMY.length !== 6) {
    throw new Error("HRM-TCI-016 requires exactly six punch classifications")
  }

  const wire = new Set(
    TCI_PUNCH_CLASSIFICATION_TAXONOMY.map((e) => e.eventType)
  )
  if (wire.size !== TCI_PUNCH_CLASSIFICATION_TAXONOMY.length) {
    throw new Error("HRM-TCI-016 taxonomy must not duplicate wire event types")
  }

  for (const entry of TCI_PUNCH_CLASSIFICATION_TAXONOMY) {
    if (
      !(TCI_PUNCH_EVENT_TYPES as readonly string[]).includes(entry.eventType)
    ) {
      throw new Error(
        `HRM-TCI-016 wire value "${entry.eventType}" missing from TCI_PUNCH_EVENT_TYPES`
      )
    }
  }

  for (const surface of TCI_PUNCH_CLASSIFICATION_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-016")) {
      throw new Error(
        `TCI punch classification surface "${surface.symbol}" must cite HRM-TCI-016`
      )
    }
  }

  const invalid = resolveTimeClockPunchClassification("not_a_punch")
  if (invalid.ok) {
    throw new Error("unknown event types must fail HRM-TCI-016 classification")
  }

  const transfer = resolveTimeClockPunchClassification(
    TCI_TRANSFER_PUNCH_EVENT_TYPE
  )
  if (!transfer.ok || transfer.eventType !== "transfer") {
    throw new Error("transfer punch must classify as transfer")
  }
}
