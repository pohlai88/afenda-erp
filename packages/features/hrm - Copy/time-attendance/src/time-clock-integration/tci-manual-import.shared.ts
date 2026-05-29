/**
 * HRM-TCI-009 — manual attendance / punch data import (operator-driven CSV).
 *
 * Distinct from HRM-TCI-008 automated sync (`api`, `scheduled`, `offline_replay`).
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import { TCI_INTEGRATION_INGEST_CHANNELS } from "./tci-integration-sources.shared"
import { TCI_SYNC_BATCH_TABLE } from "./tci-automated-sync.shared"
import type { TciSyncSourceKind } from "./schemas/tci-workflow-state.shared"

export const TCI_MANUAL_IMPORT_SOURCE_KIND =
  "manual_import" as const satisfies TciSyncSourceKind

export const TCI_MANUAL_IMPORT_ADAPTER_ID = "hrm_time_clock_import" as const

/** `import_job.metadata` key storing the linked `hrm_time_clock_sync_batch.id`. */
export const TCI_MANUAL_IMPORT_JOB_SYNC_BATCH_METADATA_KEY =
  "timeClockSyncBatchId" as const

export const TCI_MANUAL_IMPORT_REQUIRED_HEADERS = [
  "external_device_id",
  "clock_user_id",
  "event_type",
  "occurred_at_iso",
] as const

export type TciManualImportSurface = {
  readonly door:
    | "org_import_adapter"
    | "row_schema"
    | "punch_writer"
    | "sync_batch"
    | "system_admin_registry"
    | "pattern_b_ui"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_MANUAL_IMPORT_SURFACES = [
  {
    door: "org_import_adapter",
    symbol: "timeClockManualImportAdapter",
    requirementCodes: ["HRM-TCI-009", "HRM-TCI-015"],
  },
  {
    door: "row_schema",
    symbol: "timeClockManualImportRowSchema",
    requirementCodes: ["HRM-TCI-009"],
  },
  {
    door: "punch_writer",
    symbol: "persistTimeClockPunch",
    requirementCodes: [
      "HRM-TCI-009",
      "HRM-TCI-021",
      "HRM-TCI-029",
      "HRM-TCI-030",
    ],
  },
  {
    door: "sync_batch",
    symbol: TCI_SYNC_BATCH_TABLE,
    requirementCodes: ["HRM-TCI-009", "HRM-TCI-030"],
  },
  {
    door: "system_admin_registry",
    symbol: "member-invite.adapter.server.ts#hrm_time_clock_import",
    requirementCodes: ["HRM-TCI-009"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.syncBatches,
    requirementCodes: ["HRM-TCI-009", "HRM-TCI-008"],
  },
] as const satisfies readonly TciManualImportSurface[]

export function isTciManualImportSourceKind(
  value: string
): value is typeof TCI_MANUAL_IMPORT_SOURCE_KIND {
  return value === TCI_MANUAL_IMPORT_SOURCE_KIND
}

export function assertHrmTci009ManualImport(): void {
  for (const surface of TCI_MANUAL_IMPORT_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-009")) {
      throw new Error(
        `TCI manual import surface "${surface.symbol}" must cite HRM-TCI-009`
      )
    }
  }

  const channel = TCI_INTEGRATION_INGEST_CHANNELS.find(
    (c) => c.id === TCI_MANUAL_IMPORT_SOURCE_KIND
  )
  const codes = channel?.requirementCodes as readonly string[] | undefined
  if (!codes?.includes("HRM-TCI-009")) {
    throw new Error("manual_import ingest channel must cite HRM-TCI-009")
  }
  if (codes.includes("HRM-TCI-008")) {
    throw new Error("manual_import ingest channel must not cite HRM-TCI-008")
  }

  if (TCI_MANUAL_IMPORT_REQUIRED_HEADERS.length < 4) {
    throw new Error("HRM-TCI-009 CSV contract must declare required headers")
  }
}
