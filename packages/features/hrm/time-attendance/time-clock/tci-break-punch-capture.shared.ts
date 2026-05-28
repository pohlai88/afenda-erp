/**
 * HRM-TCI-007 — break start and break end punch capture on `hrm_attendance_event`.
 *
 * Same writer as clock-in/out: `persistTimeClockPunch` (`source: "device"`). Capture is
 * allowed only when `resolveTciBreakPunchCaptureEnabled` is true for the org.
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import {
  TCI_BREAK_PUNCH_EVENT_TYPES,
  type TciBreakPunchEventType,
} from "./schemas/tci-workflow-state.shared"

export const TCI_RECENT_BREAK_PUNCH_LIST_LIMIT = 50

export const TCI_HRM_TCI_007_CAPTURE_FIELDS = [
  "eventType",
  "occurredAt",
  "employeeId",
  "deviceId",
  "sourceRef",
  "rawPayloadHash",
] as const

export type TciHrmTci007CaptureField =
  (typeof TCI_HRM_TCI_007_CAPTURE_FIELDS)[number]

export type TciBreakPunchCaptureFieldBinding = {
  readonly field: TciHrmTci007CaptureField | "employeeDisplay" | "deviceDisplay"
  readonly storage: "hrm_attendance_event" | "join"
  readonly listColumnId: string
  readonly i18nColumnKey: string
}

export const TCI_BREAK_PUNCH_CAPTURE_FIELD_BINDINGS = [
  {
    field: "occurredAt",
    storage: "hrm_attendance_event",
    listColumnId: "occurredAt",
    i18nColumnKey: "colOccurredAt",
  },
  {
    field: "employeeDisplay",
    storage: "join",
    listColumnId: "employee",
    i18nColumnKey: "colEmployee",
  },
  {
    field: "deviceDisplay",
    storage: "join",
    listColumnId: "device",
    i18nColumnKey: "colDevice",
  },
  {
    field: "eventType",
    storage: "hrm_attendance_event",
    listColumnId: "eventType",
    i18nColumnKey: "colEventType",
  },
  {
    field: "sourceRef",
    storage: "hrm_attendance_event",
    listColumnId: "sourceRef",
    i18nColumnKey: "colSourceRef",
  },
] as const satisfies readonly TciBreakPunchCaptureFieldBinding[]

export type TciBreakPunchCaptureSurface = {
  readonly door:
    | "writer"
    | "batch_ingest"
    | "manual_import"
    | "query"
    | "pattern_b_ui"
    | "http_ingest"
    | "enablement"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_BREAK_PUNCH_CAPTURE_SURFACES = [
  {
    door: "enablement",
    symbol: "resolveTciBreakPunchCaptureEnabled",
    requirementCodes: ["HRM-TCI-007"],
  },
  {
    door: "writer",
    symbol: "persistTimeClockPunch",
    requirementCodes: ["HRM-TCI-007", "HRM-TCI-021", "HRM-TCI-029"],
  },
  {
    door: "batch_ingest",
    symbol: "ingestTimeClockBatch",
    requirementCodes: ["HRM-TCI-007", "HRM-TCI-008", "HRM-TCI-010"],
  },
  {
    door: "manual_import",
    symbol: "timeClockManualImportAdapter",
    requirementCodes: ["HRM-TCI-007", "HRM-TCI-009"],
  },
  {
    door: "http_ingest",
    symbol: "apps/web/app/api/erp/hrm/time-clock/ingest/route.ts",
    requirementCodes: ["HRM-TCI-007", "HRM-TCI-010"],
  },
  {
    door: "query",
    symbol: "listRecentBreakPunchesForOrg",
    requirementCodes: ["HRM-TCI-007", "HRM-TCI-029"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.breakPunchRecords,
    requirementCodes: ["HRM-TCI-007"],
  },
] as const satisfies readonly TciBreakPunchCaptureSurface[]

export function assertHrmTci007BreakPunchCapture(): void {
  if (
    TCI_BREAK_PUNCH_EVENT_TYPES.length !== 2 ||
    !TCI_BREAK_PUNCH_EVENT_TYPES.includes("break_start") ||
    !TCI_BREAK_PUNCH_EVENT_TYPES.includes("break_end")
  ) {
    throw new Error(
      "HRM-TCI-007 requires break_start and break_end event types"
    )
  }

  for (const surface of TCI_BREAK_PUNCH_CAPTURE_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-007")) {
      throw new Error(
        `TCI break punch capture surface "${surface.symbol}" must cite HRM-TCI-007`
      )
    }
  }

  const listColumns = new Set(
    TCI_BREAK_PUNCH_CAPTURE_FIELD_BINDINGS.map((b) => b.listColumnId)
  )
  for (const required of [
    "occurredAt",
    "employee",
    "device",
    "eventType",
    "sourceRef",
  ] as const) {
    if (!listColumns.has(required)) {
      throw new Error(
        `HRM-TCI-007 missing list column binding for "${required}"`
      )
    }
  }
}

export function assertTciBreakPunchEventTypes(
  types: readonly string[]
): asserts types is readonly TciBreakPunchEventType[] {
  for (const value of types) {
    if (!(TCI_BREAK_PUNCH_EVENT_TYPES as readonly string[]).includes(value)) {
      throw new Error(
        `HRM-TCI-007 event type "${value}" is not break_start or break_end`
      )
    }
  }
}
