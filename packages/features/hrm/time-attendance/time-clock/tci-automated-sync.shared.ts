/**
 * HRM-TCI-008 — automated punch data synchronization (no operator-driven manual import).
 *
 * Manual CSV import is HRM-TCI-009 (`manual_import`). Scheduled vendor poll is also
 * HRM-TCI-011 but runs under the same cron orchestrator documented here.
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import { TCI_INTEGRATION_INGEST_CHANNELS } from "./tci-integration-sources.shared"
import {
  TCI_SYNC_SOURCE_KINDS,
  type TciSyncSourceKind,
} from "./schemas/tci-workflow-state.shared"

/** Batch `sourceKind` values that represent automated synchronization. */
export const TCI_AUTOMATED_SYNC_SOURCE_KINDS = [
  "api",
  "scheduled",
  "offline_replay",
] as const satisfies readonly TciSyncSourceKind[]

export type TciAutomatedSyncSourceKind =
  (typeof TCI_AUTOMATED_SYNC_SOURCE_KINDS)[number]

export const TCI_AUTOMATED_SYNC_CRON_JOB = "hrm-time-clock-sync" as const

export const TCI_SYNC_BATCH_TABLE = "hrm_time_clock_sync_batch" as const

export const TCI_SYNC_BATCH_STATES = ["running", "completed", "failed"] as const

export type TciSyncBatchState = (typeof TCI_SYNC_BATCH_STATES)[number]

export type TciAutomatedSyncSurface = {
  readonly door:
    | "cron"
    | "orchestrator"
    | "scheduled_poll"
    | "sync_watch"
    | "batch_ingest"
    | "http_ingest"
    | "pattern_b_ui"
    | "device_sync_status"
    | "audit"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_AUTOMATED_SYNC_SURFACES = [
  {
    door: "cron",
    symbol: `apps/web/app/api/cron/${TCI_AUTOMATED_SYNC_CRON_JOB}/route.ts`,
    requirementCodes: ["HRM-TCI-008", "HRM-TCI-011", "HRM-TCI-026"],
  },
  {
    door: "orchestrator",
    symbol: "runTimeClockCronSyncTick",
    requirementCodes: ["HRM-TCI-008"],
  },
  {
    door: "scheduled_poll",
    symbol: "runTimeClockScheduledSyncTick",
    requirementCodes: ["HRM-TCI-008", "HRM-TCI-011"],
  },
  {
    door: "sync_watch",
    symbol: "runTimeClockSyncWatchTick",
    requirementCodes: ["HRM-TCI-008", "HRM-TCI-026"],
  },
  {
    door: "batch_ingest",
    symbol: "ingestTimeClockBatch",
    requirementCodes: ["HRM-TCI-008", "HRM-TCI-013", "HRM-TCI-030"],
  },
  {
    door: "http_ingest",
    symbol: "apps/web/app/api/erp/hrm/time-clock/ingest/route.ts",
    requirementCodes: ["HRM-TCI-008", "HRM-TCI-010"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.syncBatches,
    requirementCodes: ["HRM-TCI-008", "HRM-TCI-013"],
  },
  {
    door: "device_sync_status",
    symbol: "hrm_time_clock_device.sync_status",
    requirementCodes: ["HRM-TCI-004", "HRM-TCI-008", "HRM-TCI-026"],
  },
  {
    door: "audit",
    symbol: "HRM_TCI_AUDIT.syncRun",
    requirementCodes: ["HRM-TCI-008", "HRM-TCI-030"],
  },
  {
    door: "audit",
    symbol: "HRM_TCI_AUDIT.syncFail",
    requirementCodes: ["HRM-TCI-008", "HRM-TCI-026", "HRM-TCI-030"],
  },
] as const satisfies readonly TciAutomatedSyncSurface[]

export function isTciAutomatedSyncSourceKind(
  value: string
): value is TciAutomatedSyncSourceKind {
  return (TCI_AUTOMATED_SYNC_SOURCE_KINDS as readonly string[]).includes(value)
}

export function assertHrmTci008AutomatedSync(): void {
  const automated = new Set<string>(TCI_AUTOMATED_SYNC_SOURCE_KINDS)
  for (const kind of TCI_SYNC_SOURCE_KINDS) {
    if (kind === "manual_import") {
      if (automated.has(kind)) {
        throw new Error(
          "HRM-TCI-008 must not include manual_import (HRM-TCI-009)"
        )
      }
      continue
    }
    if (!automated.has(kind)) {
      throw new Error(
        `HRM-TCI-008 automated sync kinds must cover "${kind}" or manual_import must be the only exception`
      )
    }
  }

  for (const surface of TCI_AUTOMATED_SYNC_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-008")) {
      throw new Error(
        `TCI automated sync surface "${surface.symbol}" must cite HRM-TCI-008`
      )
    }
  }

  const manualChannel = TCI_INTEGRATION_INGEST_CHANNELS.find(
    (c) => c.id === "manual_import"
  )
  const manualCodes = manualChannel?.requirementCodes as readonly string[]
  if (manualCodes.includes("HRM-TCI-008")) {
    throw new Error("manual_import channel must not cite HRM-TCI-008")
  }

  for (const kind of TCI_AUTOMATED_SYNC_SOURCE_KINDS) {
    const channel = TCI_INTEGRATION_INGEST_CHANNELS.find((c) => c.id === kind)
    const codes = channel?.requirementCodes as readonly string[] | undefined
    if (!codes?.includes("HRM-TCI-008")) {
      throw new Error(
        `Integration ingest channel "${kind}" must cite HRM-TCI-008`
      )
    }
  }
}
