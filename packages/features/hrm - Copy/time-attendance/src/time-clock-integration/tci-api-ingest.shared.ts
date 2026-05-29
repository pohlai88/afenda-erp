/**
 * HRM-TCI-010 — API-based attendance data ingestion (`sourceKind: api`).
 *
 * HTTP: `POST /api/erp/hrm/time-clock/ingest` → `ingestTimeClockBatch`.
 * Enablement: `resolveTciApiIngestEnabled` (org devices / env — see enablement module).
 */

import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import { TCI_INTEGRATION_INGEST_CHANNELS } from "./tci-integration-sources.shared"
import { TCI_SYNC_BATCH_TABLE } from "./tci-automated-sync.shared"
import type { TciSyncSourceKind } from "./schemas/tci-workflow-state.shared"

export const TCI_API_INGEST_SOURCE_KIND =
  "api" as const satisfies TciSyncSourceKind

export const TCI_API_INGEST_ROUTE_PATH =
  "/api/erp/hrm/time-clock/ingest" as const

export const TCI_API_INGEST_ORG_HEADER = "x-afenda-organization-id" as const

export const TCI_API_INGEST_BATCH_SCHEMA = "timeClockIngestBatchSchema" as const

export const TCI_API_INGEST_PUNCH_SCHEMA = "timeClockIngestPunchSchema" as const

export const TCI_API_INGEST_ENV_KEYS = [
  "HRM_TIME_CLOCK_INGEST_API_KEY",
  "HRM_TIME_CLOCK_INGEST_ACTOR_USER_ID",
] as const

export const TCI_API_INGEST_OVERRIDE_ENV = "AFENDA_TCI_API_INGEST" as const

export type TciApiIngestSurface = {
  readonly door:
    | "route_handler"
    | "batch_schema"
    | "batch_ingest"
    | "ingest_auth"
    | "enablement"
    | "pattern_b_ui"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_API_INGEST_SURFACES = [
  {
    door: "route_handler",
    symbol: `apps/web/app/api/erp/hrm/time-clock/ingest/route.ts`,
    requirementCodes: ["HRM-TCI-010"],
  },
  {
    door: "batch_schema",
    symbol: TCI_API_INGEST_BATCH_SCHEMA,
    requirementCodes: ["HRM-TCI-010", "HRM-TCI-013"],
  },
  {
    door: "batch_ingest",
    symbol: "ingestTimeClockBatch",
    requirementCodes: [
      "HRM-TCI-008",
      "HRM-TCI-010",
      "HRM-TCI-013",
      "HRM-TCI-030",
    ],
  },
  {
    door: "ingest_auth",
    symbol: "resolveTimeClockIngestActor",
    requirementCodes: ["HRM-TCI-010", "HRM-TCI-027"],
  },
  {
    door: "enablement",
    symbol: "resolveTciApiIngestEnabled",
    requirementCodes: ["HRM-TCI-010"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.syncBatches,
    requirementCodes: ["HRM-TCI-010", "HRM-TCI-008"],
  },
  {
    door: "batch_ingest",
    symbol: TCI_SYNC_BATCH_TABLE,
    requirementCodes: ["HRM-TCI-010", "HRM-TCI-030"],
  },
] as const satisfies readonly TciApiIngestSurface[]

export function isTciApiIngestSourceKind(
  value: string
): value is typeof TCI_API_INGEST_SOURCE_KIND {
  return value === TCI_API_INGEST_SOURCE_KIND
}

export function assertHrmTci010ApiIngest(): void {
  for (const surface of TCI_API_INGEST_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-010")) {
      throw new Error(
        `TCI API ingest surface "${surface.symbol}" must cite HRM-TCI-010`
      )
    }
  }

  const channel = TCI_INTEGRATION_INGEST_CHANNELS.find(
    (c) => c.id === TCI_API_INGEST_SOURCE_KIND
  )
  const codes = channel?.requirementCodes as readonly string[] | undefined
  if (!codes?.includes("HRM-TCI-010")) {
    throw new Error("api ingest channel must cite HRM-TCI-010")
  }
  if (!codes.includes("HRM-TCI-008")) {
    throw new Error(
      "api ingest channel must cite HRM-TCI-008 (automated sync plane)"
    )
  }
}
