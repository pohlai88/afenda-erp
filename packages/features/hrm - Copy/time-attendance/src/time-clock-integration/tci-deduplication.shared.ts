/**
 * HRM-TCI-013 — prevent duplicate punch records from repeated sync.
 *
 * Idempotency: `resolveTimeClockPunchPayloadHash` → lookup on `hrm_attendance_event.rawPayloadHash`
 * per organization before insert; batch ingest counts duplicates without exception inbox rows.
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import { TCI_INTEGRATION_INGEST_CHANNELS } from "./tci-integration-sources.shared"
import { TCI_SYNC_BATCH_TABLE } from "./tci-automated-sync.shared"
import {
  TCI_DEDUPLICATION_ATTENDANCE_HASH_COLUMN,
  TCI_DEDUPLICATION_PUNCH_FIELD,
  resolveTimeClockPunchPayloadHash,
} from "./tci-punch-deduplication.shared"

export {
  TCI_DEDUPLICATION_ATTENDANCE_HASH_COLUMN,
  TCI_DEDUPLICATION_PUNCH_FIELD,
  resolveTimeClockPunchPayloadHash,
  type TimeClockPunchPayloadHashInput,
} from "./tci-punch-deduplication.shared"

export const TCI_DEDUPLICATION_DETECTION_OUTCOME = "duplicate_punch" as const

export const TCI_DEDUPLICATION_PERSIST_OUTCOME = "duplicate" as const

export const TCI_DEDUPLICATION_BATCH_COUNTER_FIELD = "duplicateCount" as const

export const TCI_DEDUPLICATION_PUNCH_SCHEMA =
  "timeClockIngestPunchSchema" as const

export const TCI_DEDUPLICATION_VALIDATION_SYMBOL =
  "evaluateTimeClockPunch" as const

export const TCI_DEDUPLICATION_PERSIST_SYMBOL = "persistTimeClockPunch" as const

export const TCI_DEDUPLICATION_BATCH_INGEST_SYMBOL =
  "ingestTimeClockBatch" as const

export type TciDeduplicationSurface = {
  readonly door:
    | "punch_schema"
    | "payload_hash"
    | "validation"
    | "persist"
    | "batch_ingest"
    | "pattern_b_ui"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_DEDUPLICATION_SURFACES = [
  {
    door: "punch_schema",
    symbol: TCI_DEDUPLICATION_PUNCH_SCHEMA,
    requirementCodes: ["HRM-TCI-013"],
  },
  {
    door: "payload_hash",
    symbol: "resolveTimeClockPunchPayloadHash",
    requirementCodes: ["HRM-TCI-013"],
  },
  {
    door: "validation",
    symbol: TCI_DEDUPLICATION_VALIDATION_SYMBOL,
    requirementCodes: ["HRM-TCI-013", "HRM-TCI-014", "HRM-TCI-015"],
  },
  {
    door: "persist",
    symbol: TCI_DEDUPLICATION_PERSIST_SYMBOL,
    requirementCodes: ["HRM-TCI-013", "HRM-TCI-006", "HRM-TCI-021"],
  },
  {
    door: "batch_ingest",
    symbol: TCI_DEDUPLICATION_BATCH_INGEST_SYMBOL,
    requirementCodes: [
      "HRM-TCI-013",
      "HRM-TCI-008",
      "HRM-TCI-012",
      "HRM-TCI-030",
    ],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.syncBatches,
    requirementCodes: ["HRM-TCI-013", "HRM-TCI-008"],
  },
  {
    door: "batch_ingest",
    symbol: TCI_SYNC_BATCH_TABLE,
    requirementCodes: ["HRM-TCI-013", "HRM-TCI-030"],
  },
] as const satisfies readonly TciDeduplicationSurface[]

export function assertHrmTci013Deduplication(): void {
  for (const surface of TCI_DEDUPLICATION_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-013")) {
      throw new Error(
        `TCI deduplication surface "${surface.symbol}" must cite HRM-TCI-013`
      )
    }
  }

  for (const kind of ["api", "scheduled", "offline_replay"] as const) {
    const channel = TCI_INTEGRATION_INGEST_CHANNELS.find((c) => c.id === kind)
    const codes = channel?.requirementCodes as readonly string[] | undefined
    if (!codes?.includes("HRM-TCI-013")) {
      throw new Error(`${kind} ingest channel must cite HRM-TCI-013`)
    }
  }

  if (TCI_DEDUPLICATION_ATTENDANCE_HASH_COLUMN !== "rawPayloadHash") {
    throw new Error("HRM-TCI-013 attendance hash column must be rawPayloadHash")
  }
  if (TCI_DEDUPLICATION_PUNCH_FIELD !== "rawPayloadHash") {
    throw new Error("HRM-TCI-013 punch field must be rawPayloadHash")
  }

  const sample = resolveTimeClockPunchPayloadHash({
    organizationId: "org",
    deviceId: "device",
    employeeId: "employee",
    punch: {
      eventType: "clock_in",
      occurredAtIso: "2026-05-20T09:00:00.000Z",
      sourceRef: "ref-1",
    },
  })
  if (sample.length < 32) {
    throw new Error(
      "resolveTimeClockPunchPayloadHash must return a stable digest"
    )
  }
}
