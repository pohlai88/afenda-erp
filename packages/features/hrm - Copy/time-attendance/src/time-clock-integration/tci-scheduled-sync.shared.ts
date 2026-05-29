/**
 * HRM-TCI-011 — scheduled sync from external time clock systems (`sourceKind: scheduled`).
 *
 * Cron: `GET /api/cron/hrm-time-clock-sync` → `runTimeClockCronSyncTick` →
 * `runTimeClockScheduledSyncTick` (vendor `poll:` / `vendor:zebra:` / `vendor:ukg:` credentials).
 */

import {
  TCI_VENDOR_POLL_CREDENTIAL_PREFIX,
  TCI_VENDOR_UKG_CREDENTIAL_PREFIX,
  TCI_VENDOR_ZEBRA_CREDENTIAL_PREFIX,
  isVendorScheduledSyncCredential,
} from "./data/tci-vendor-adapter.shared"
import { TCI_LIST_SURFACE_IDS } from "./data/tci-surface-metadata.shared"
import { TCI_INTEGRATION_INGEST_CHANNELS } from "./tci-integration-sources.shared"
import {
  TCI_AUTOMATED_SYNC_CRON_JOB,
  TCI_AUTOMATED_SYNC_SOURCE_KINDS,
  TCI_SYNC_BATCH_TABLE,
} from "./tci-automated-sync.shared"
import type { TciSyncSourceKind } from "./schemas/tci-workflow-state.shared"

export const TCI_SCHEDULED_SYNC_SOURCE_KIND =
  "scheduled" as const satisfies TciSyncSourceKind

export const TCI_SCHEDULED_SYNC_CRON_ROUTE_PATH =
  `/api/cron/${TCI_AUTOMATED_SYNC_CRON_JOB}` as const

export const TCI_SCHEDULED_SYNC_INTERVAL_ENV =
  "HRM_TIME_CLOCK_SYNC_INTERVAL_MINUTES" as const

export const TCI_SCHEDULED_SYNC_OVERRIDE_ENV =
  "AFENDA_TCI_SCHEDULED_SYNC" as const

export const TCI_SCHEDULED_SYNC_VENDOR_CREDENTIAL_PREFIXES = [
  TCI_VENDOR_POLL_CREDENTIAL_PREFIX,
  TCI_VENDOR_ZEBRA_CREDENTIAL_PREFIX,
  TCI_VENDOR_UKG_CREDENTIAL_PREFIX,
] as const

export const TCI_DEFAULT_SYNC_INTERVAL_MINUTES = 360

export const TCI_SCHEDULED_SYNC_MIN_INTERVAL_MINUTES = 15

export type TciScheduledSyncSurface = {
  readonly door:
    | "cron"
    | "orchestrator"
    | "vendor_adapters"
    | "batch_ingest"
    | "enablement"
    | "device_credential"
    | "pattern_b_ui"
    | "notifications"
  readonly symbol: string
  readonly requirementCodes: readonly `HRM-TCI-${string}`[]
}

export const TCI_SCHEDULED_SYNC_SURFACES = [
  {
    door: "cron",
    symbol: `apps/web/app/api/cron/${TCI_AUTOMATED_SYNC_CRON_JOB}/route.ts`,
    requirementCodes: ["HRM-TCI-011", "HRM-TCI-008", "HRM-TCI-026"],
  },
  {
    door: "orchestrator",
    symbol: "runTimeClockScheduledSyncTick",
    requirementCodes: ["HRM-TCI-011", "HRM-TCI-008"],
  },
  {
    door: "vendor_adapters",
    symbol: "TCI_VENDOR_ADAPTERS",
    requirementCodes: ["HRM-TCI-011", "HRM-TCI-001"],
  },
  {
    door: "batch_ingest",
    symbol: "ingestTimeClockBatch",
    requirementCodes: [
      "HRM-TCI-011",
      "HRM-TCI-008",
      "HRM-TCI-013",
      "HRM-TCI-030",
    ],
  },
  {
    door: "enablement",
    symbol: "resolveTciScheduledSyncEnabled",
    requirementCodes: ["HRM-TCI-011"],
  },
  {
    door: "device_credential",
    symbol: "integrationCredentialRef",
    requirementCodes: ["HRM-TCI-011", "HRM-TCI-004"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.syncBatches,
    requirementCodes: ["HRM-TCI-011", "HRM-TCI-008"],
  },
  {
    door: "notifications",
    symbol: "scheduled_poll",
    requirementCodes: ["HRM-TCI-011", "HRM-TCI-026"],
  },
  {
    door: "batch_ingest",
    symbol: TCI_SYNC_BATCH_TABLE,
    requirementCodes: ["HRM-TCI-011", "HRM-TCI-030"],
  },
] as const satisfies readonly TciScheduledSyncSurface[]

export function resolveTimeClockSyncIntervalMs(
  envMinutes: string | undefined
): number {
  const parsed = Number(envMinutes)
  if (
    !Number.isFinite(parsed) ||
    parsed < TCI_SCHEDULED_SYNC_MIN_INTERVAL_MINUTES
  ) {
    return TCI_DEFAULT_SYNC_INTERVAL_MINUTES * 60 * 1000
  }
  return parsed * 60 * 1000
}

export function isDeviceConfiguredForScheduledVendorSync(
  integrationCredentialRef: string | null | undefined
): boolean {
  return isVendorScheduledSyncCredential(integrationCredentialRef)
}

export function isDeviceDueForScheduledSync(input: {
  readonly lastSyncAt: Date | null
  readonly now: Date
  readonly intervalMs: number
}): boolean {
  if (!input.lastSyncAt) return true
  return input.now.getTime() - input.lastSyncAt.getTime() >= input.intervalMs
}

export function formatScheduledSyncCredentialHint(): string {
  return `${TCI_VENDOR_POLL_CREDENTIAL_PREFIX}https://… · ${TCI_VENDOR_ZEBRA_CREDENTIAL_PREFIX}https://… · ${TCI_VENDOR_UKG_CREDENTIAL_PREFIX}https://…`
}

export function isTciScheduledSyncSourceKind(
  value: string
): value is typeof TCI_SCHEDULED_SYNC_SOURCE_KIND {
  return value === TCI_SCHEDULED_SYNC_SOURCE_KIND
}

export function assertHrmTci011ScheduledSync(): void {
  for (const surface of TCI_SCHEDULED_SYNC_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-011")) {
      throw new Error(
        `TCI scheduled sync surface "${surface.symbol}" must cite HRM-TCI-011`
      )
    }
  }

  const channel = TCI_INTEGRATION_INGEST_CHANNELS.find(
    (c) => c.id === TCI_SCHEDULED_SYNC_SOURCE_KIND
  )
  const codes = channel?.requirementCodes as readonly string[] | undefined
  if (!codes?.includes("HRM-TCI-011")) {
    throw new Error("scheduled ingest channel must cite HRM-TCI-011")
  }
  if (!codes.includes("HRM-TCI-008")) {
    throw new Error(
      "scheduled ingest channel must cite HRM-TCI-008 (automated sync plane)"
    )
  }

  if (
    !(TCI_AUTOMATED_SYNC_SOURCE_KINDS as readonly string[]).includes(
      TCI_SCHEDULED_SYNC_SOURCE_KIND
    )
  ) {
    throw new Error(
      "HRM-TCI-011 scheduled sourceKind must be in TCI_AUTOMATED_SYNC_SOURCE_KINDS"
    )
  }
}
