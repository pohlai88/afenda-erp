/**
 * HRM-TCI-026 — device sync monitoring and failure alerts.
 *
 * Cron watch marks `failed` / stale `syncing` devices and notifies ERP users with
 * `hrm.time_clock_device.update`. Scheduled vendor failures use the same dispatcher.
 */

import { TCI_DEVICE_ADMIN_PERMISSION } from "./tci-device-admin-access.shared"
import {
  TCI_LIST_SURFACE_IDS,
  TCI_STAT_SURFACE_KEY,
} from "./data/tci-surface-metadata.shared"

export const TCI_SYNC_MONITORING_DEVICE_TABLE = "hrm_time_clock_device" as const

export const TCI_SYNC_MONITORING_STALE_MS = 24 * 60 * 60 * 1000

export const TCI_SYNC_MONITORING_WATCH_SYMBOL =
  "runTimeClockSyncWatchTick" as const

export const TCI_SYNC_MONITORING_CRON_SYMBOL =
  "runTimeClockCronSyncTick" as const

export const TCI_SYNC_MONITORING_NOTIFY_SYMBOL =
  "notifyTimeClockDeviceSyncFailure" as const

export const TCI_SYNC_MONITORING_DISPATCHER_SYMBOL =
  "createTimeClockNotificationDispatcher" as const

/** Same ERP gate as device register/edit (HRM-TCI-027). */
export const TCI_SYNC_MONITORING_ALERT_PERMISSION = TCI_DEVICE_ADMIN_PERMISSION

export const TCI_SYNC_MONITORING_ALERT_REASONS = [
  "watch_stale",
  "watch_failed",
  "scheduled_poll",
  "scheduled_ingest",
] as const

export type TciSyncMonitoringAlertReason =
  (typeof TCI_SYNC_MONITORING_ALERT_REASONS)[number]

export const TCI_SYNC_MONITORING_ATTENTION_KINDS = [
  "failed",
  "stale_syncing",
] as const

export type TciSyncMonitoringAttentionKind =
  (typeof TCI_SYNC_MONITORING_ATTENTION_KINDS)[number]

export function resolveTimeClockSyncMonitoringAttentionKind(input: {
  readonly syncStatus: string
  readonly lastSyncAt: Date | null
  readonly now?: Date
  readonly staleMs?: number
}): TciSyncMonitoringAttentionKind | null {
  if (input.syncStatus === "failed") return "failed"
  const staleBefore = new Date(
    (input.now ?? new Date()).getTime() -
      (input.staleMs ?? TCI_SYNC_MONITORING_STALE_MS)
  )
  if (
    input.syncStatus === "syncing" &&
    input.lastSyncAt != null &&
    input.lastSyncAt < staleBefore
  ) {
    return "stale_syncing"
  }
  return null
}

export function isTimeClockDeviceSyncAttention(input: {
  readonly syncStatus: string
  readonly lastSyncAt: Date | null
  readonly now?: Date
  readonly staleMs?: number
}): boolean {
  return resolveTimeClockSyncMonitoringAttentionKind(input) !== null
}

export type TciSyncMonitoringSurface =
  | {
      readonly door: "sync_watch"
      readonly symbol: typeof TCI_SYNC_MONITORING_WATCH_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-026", "HRM-TCI-008"]
    }
  | {
      readonly door: "cron"
      readonly symbol: typeof TCI_SYNC_MONITORING_CRON_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-026", "HRM-TCI-011"]
    }
  | {
      readonly door: "notification"
      readonly symbol: typeof TCI_SYNC_MONITORING_NOTIFY_SYMBOL
      readonly requirementCodes: readonly ["HRM-TCI-026"]
    }
  | {
      readonly door: "erp_rbac"
      readonly symbol: typeof TCI_SYNC_MONITORING_ALERT_PERMISSION.object
      readonly requirementCodes: readonly ["HRM-TCI-026"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_LIST_SURFACE_IDS.syncMonitoringFindings
      readonly requirementCodes: readonly ["HRM-TCI-026"]
    }
  | {
      readonly door: "pattern_b_ui"
      readonly symbol: typeof TCI_STAT_SURFACE_KEY
      readonly requirementCodes: readonly ["HRM-TCI-026"]
    }
  | {
      readonly door: "report_csv"
      readonly symbol: "sync_monitoring"
      readonly requirementCodes: readonly ["HRM-TCI-026", "HRM-TCI-028"]
    }

export const TCI_SYNC_MONITORING_SURFACES = [
  {
    door: "sync_watch",
    symbol: TCI_SYNC_MONITORING_WATCH_SYMBOL,
    requirementCodes: ["HRM-TCI-026", "HRM-TCI-008"],
  },
  {
    door: "cron",
    symbol: TCI_SYNC_MONITORING_CRON_SYMBOL,
    requirementCodes: ["HRM-TCI-026", "HRM-TCI-011"],
  },
  {
    door: "notification",
    symbol: TCI_SYNC_MONITORING_NOTIFY_SYMBOL,
    requirementCodes: ["HRM-TCI-026"],
  },
  {
    door: "erp_rbac",
    symbol: TCI_SYNC_MONITORING_ALERT_PERMISSION.object,
    requirementCodes: ["HRM-TCI-026"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_LIST_SURFACE_IDS.syncMonitoringFindings,
    requirementCodes: ["HRM-TCI-026"],
  },
  {
    door: "pattern_b_ui",
    symbol: TCI_STAT_SURFACE_KEY,
    requirementCodes: ["HRM-TCI-026"],
  },
  {
    door: "report_csv",
    symbol: "sync_monitoring",
    requirementCodes: ["HRM-TCI-026", "HRM-TCI-028"],
  },
] as const satisfies readonly TciSyncMonitoringSurface[]

export function assertHrmTci026SyncMonitoring(): void {
  if (TCI_SYNC_MONITORING_STALE_MS < 60 * 60 * 1000) {
    throw new Error("TCI sync watch stale threshold must be at least one hour")
  }

  for (const surface of TCI_SYNC_MONITORING_SURFACES) {
    if (!surface.requirementCodes.includes("HRM-TCI-026")) {
      throw new Error(
        `TCI sync monitoring surface "${surface.symbol}" must cite HRM-TCI-026`
      )
    }
  }

  if (
    !isTimeClockDeviceSyncAttention({
      syncStatus: "failed",
      lastSyncAt: new Date(),
    })
  ) {
    throw new Error("failed sync_status must require attention")
  }

  const stale = resolveTimeClockSyncMonitoringAttentionKind({
    syncStatus: "syncing",
    lastSyncAt: new Date(Date.now() - TCI_SYNC_MONITORING_STALE_MS - 1000),
  })
  if (stale !== "stale_syncing") {
    throw new Error(
      "stale syncing devices must resolve to stale_syncing attention"
    )
  }
}
