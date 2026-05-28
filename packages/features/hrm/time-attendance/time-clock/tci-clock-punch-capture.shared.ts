/**
 * HRM-TCI-006 — clock-in and clock-out punch capture on `hrm_attendance_event`.
 *
 * Sole accepted writer: `persistTimeClockPunch` (`source: "device"`). Break and correction
 * event types are classified under HRM-TCI-007 / HRM-TCI-016 — not this requirement slice.
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import {
  TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES,
  type TciClockInOutPunchEventType,
} from "./schemas/tci-workflow-state.shared"

export const TCI_ATTENDANCE_EVENT_DEVICE_SOURCE = "device" as const

export const TCI_RECENT_CLOCK_PUNCH_LIST_LIMIT = 50

export const TCI_HRM_TCI_006_CAPTURE_FIELDS = [
  "eventType",
  "occurredAt",
  "employeeId",
  "deviceId",
  "sourceRef",
  "rawPayloadHash",
] as const

export type TciHrmTci006CaptureField =
  (typeof TCI_HRM_TCI_006_CAPTURE_FIELDS)[number]

export type TciClockPunchCaptureFieldBinding = {
  readonly field: TciHrmTci006CaptureField | "employeeDisplay" | "deviceDisplay"
  readonly storage: "hrm_attendance_event" | "join"
  readonly listColumnId: string
  readonly i18nColumnKey: string
}

export const TCI_CLOCK_PUNCH_CAPTURE_FIELD_BINDINGS = [
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
] as const satisfies readonly TciClockPunchCaptureFieldBinding[]

export type TciClockPunchCaptureSurface = {
  readonly door:
    | "writer"
    | "batch_ingest"
    | "manual_import"
    | "query"
    | "pattern_b_ui"
    | "http_ingest"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_CLOCK_PUNCH_CAPTURE_SURFACES = [
  {
    door: "writer",
    symbol: "persistTimeClockPunch",
    requirementCodes: [
      "HRM-TCI-006",
      "HRM-TCI-014",
      "HRM-TCI-015",
      "HRM-TCI-021",
      "HRM-TCI-029",
    ],
  },
  {
    door: "batch_ingest",
    symbol: "ingestTimeClockBatch",
    requirementCodes: [
      "HRM-TCI-006",
      "HRM-TCI-008",
      "HRM-TCI-010",
      "HRM-TCI-014",
      "HRM-TCI-015",
    ],
  },
  {
    door: "manual_import",
    symbol: "timeClockManualImportAdapter",
    requirementCodes: [
      "HRM-TCI-006",
      "HRM-TCI-009",
      "HRM-TCI-014",
      "HRM-TCI-015",
    ],
  },
  {
    door: "http_ingest",
    symbol: "apps/web/app/api/erp/hrm/time-clock/ingest/route.ts",
    requirementCodes: ["HRM-TCI-006", "HRM-TCI-010"],
  },
  {
    door: "query",
    symbol: "listRecentClockInOutPunchesForOrg",
    requirementCodes: ["HRM-TCI-006", "HRM-TCI-029"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.punchRecords,
    requirementCodes: ["HRM-TCI-006"],
  },
] as const satisfies readonly TciClockPunchCaptureSurface[]

export function assertHrmTci006ClockPunchCapture(): void {
  if (
    TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES.length !== 2 ||
    !TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES.includes("clock_in") ||
    !TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES.includes("clock_out")
  ) {
    throw new Error("HRM-TCI-006 requires clock_in and clock_out event types")
  }

  for (const surface of TCI_CLOCK_PUNCH_CAPTURE_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-006")) {
      throw new Error(
        `TCI clock punch capture surface "${surface.symbol}" must cite HRM-TCI-006`
      )
    }
  }

  const listColumns = new Set(
    TCI_CLOCK_PUNCH_CAPTURE_FIELD_BINDINGS.map((b) => b.listColumnId)
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
        `HRM-TCI-006 missing list column binding for "${required}"`
      )
    }
  }
}

export function assertTciClockInOutEventTypes(
  types: readonly string[]
): asserts types is readonly TciClockInOutPunchEventType[] {
  for (const value of types) {
    if (
      !(TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES as readonly string[]).includes(value)
    ) {
      throw new Error(
        `HRM-TCI-006 event type "${value}" is not clock_in or clock_out`
      )
    }
  }
}
