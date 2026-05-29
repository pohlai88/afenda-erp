/**
 * HRM-TCI-012 — offline punch synchronization after device reconnect (`sourceKind: offline_replay`).
 *
 * Devices buffer punches locally when disconnected; on reconnect they POST a batch to
 * `POST /api/erp/hrm/time-clock/ingest` or the ERP `replayOfflineTimeClockPunchBatchAction`.
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import { TCI_INTEGRATION_INGEST_CHANNELS } from "./tci-integration-sources.shared"
import { TCI_SYNC_BATCH_TABLE } from "./tci-automated-sync.shared"
import { TCI_API_INGEST_ROUTE_PATH } from "./tci-api-ingest.shared"
import { TCI_HRM_TCI_002_DEVICE_TYPES } from "./tci-device-types.shared"
import type { TciSyncSourceKind } from "./schemas/tci-workflow-state.shared"

export const TCI_OFFLINE_REPLAY_SOURCE_KIND =
  "offline_replay" as const satisfies TciSyncSourceKind

/** Terminal device types that may buffer punches offline (excludes push-only `api`). */
export const TCI_OFFLINE_REPLAY_DEVICE_TYPES = TCI_HRM_TCI_002_DEVICE_TYPES

export const TCI_OFFLINE_REPLAY_BATCH_SCHEMA =
  "timeClockIngestBatchSchema" as const

export const TCI_OFFLINE_REPLAY_OVERRIDE_ENV =
  "AFENDA_TCI_OFFLINE_REPLAY" as const

export const TCI_OFFLINE_REPLAY_SERVER_ACTION =
  "replayOfflineTimeClockPunchBatchAction" as const

export type TciOfflineReplaySurface = {
  readonly door:
    | "route_handler"
    | "server_action"
    | "batch_schema"
    | "batch_ingest"
    | "ingest_auth"
    | "enablement"
    | "device_reconnect"
    | "pattern_b_ui"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_OFFLINE_REPLAY_SURFACES = [
  {
    door: "route_handler",
    symbol: TCI_API_INGEST_ROUTE_PATH,
    requirementCodes: ["HRM-TCI-012", "HRM-TCI-010"],
  },
  {
    door: "server_action",
    symbol: TCI_OFFLINE_REPLAY_SERVER_ACTION,
    requirementCodes: ["HRM-TCI-012", "HRM-TCI-027"],
  },
  {
    door: "batch_schema",
    symbol: TCI_OFFLINE_REPLAY_BATCH_SCHEMA,
    requirementCodes: ["HRM-TCI-012", "HRM-TCI-013"],
  },
  {
    door: "batch_ingest",
    symbol: "ingestTimeClockBatch",
    requirementCodes: [
      "HRM-TCI-012",
      "HRM-TCI-008",
      "HRM-TCI-013",
      "HRM-TCI-030",
    ],
  },
  {
    door: "enablement",
    symbol: "resolveTciOfflineReplayEnabled",
    requirementCodes: ["HRM-TCI-012"],
  },
  {
    door: "device_reconnect",
    symbol: "hrm_time_clock_device.last_sync_at",
    requirementCodes: ["HRM-TCI-012", "HRM-TCI-004", "HRM-TCI-008"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.syncBatches,
    requirementCodes: ["HRM-TCI-012", "HRM-TCI-008"],
  },
  {
    door: "batch_ingest",
    symbol: TCI_SYNC_BATCH_TABLE,
    requirementCodes: ["HRM-TCI-012", "HRM-TCI-030"],
  },
] as const satisfies readonly TciOfflineReplaySurface[]

export function isTciOfflineReplaySourceKind(
  value: string
): value is typeof TCI_OFFLINE_REPLAY_SOURCE_KIND {
  return value === TCI_OFFLINE_REPLAY_SOURCE_KIND
}

export function assertHrmTci012OfflineReplay(): void {
  for (const surface of TCI_OFFLINE_REPLAY_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-012")) {
      throw new Error(
        `TCI offline replay surface "${surface.symbol}" must cite HRM-TCI-012`
      )
    }
  }

  const channel = TCI_INTEGRATION_INGEST_CHANNELS.find(
    (c) => c.id === TCI_OFFLINE_REPLAY_SOURCE_KIND
  )
  const codes = channel?.requirementCodes as readonly string[] | undefined
  if (!codes?.includes("HRM-TCI-012")) {
    throw new Error("offline_replay ingest channel must cite HRM-TCI-012")
  }
  if (!codes.includes("HRM-TCI-008")) {
    throw new Error(
      "offline_replay ingest channel must cite HRM-TCI-008 (automated sync plane)"
    )
  }
  if (!codes.includes("HRM-TCI-013")) {
    throw new Error("offline_replay ingest channel must cite HRM-TCI-013")
  }

  if ((TCI_OFFLINE_REPLAY_DEVICE_TYPES as readonly string[]).includes("api")) {
    throw new Error(
      "HRM-TCI-012 offline-capable types must exclude api push-only devices"
    )
  }
}
