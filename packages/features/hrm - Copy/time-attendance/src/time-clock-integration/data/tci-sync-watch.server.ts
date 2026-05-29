import "server-only"

import { eq, sql } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmTimeClockDevice } from "@afenda/platform/db/schema"

import { HRM_TCI_AUDIT } from "../tci.contract"
import { TCI_SYNC_MONITORING_STALE_MS } from "../tci-sync-monitoring.shared"
import {
  createTimeClockNotificationDispatcher,
  type TimeClockNotificationDispatcher,
} from "./tci-notification.server"

export type TimeClockSyncWatchSummary = {
  readonly scanned: number
  readonly failed: number
  readonly alerted: number
  readonly notificationsSent: number
}

/**
 * Marks devices stuck in `syncing` or `failed` beyond threshold for admin attention.
 */
export async function runTimeClockSyncWatchTick(input?: {
  readonly notify?: TimeClockNotificationDispatcher
}): Promise<TimeClockSyncWatchSummary> {
  const notify = input?.notify ?? createTimeClockNotificationDispatcher()
  const staleBefore = new Date(Date.now() - TCI_SYNC_MONITORING_STALE_MS)

  const failedDevices = await db
    .select({
      id: hrmTimeClockDevice.id,
      organizationId: hrmTimeClockDevice.organizationId,
      name: hrmTimeClockDevice.name,
      externalDeviceId: hrmTimeClockDevice.externalDeviceId,
      syncStatus: hrmTimeClockDevice.syncStatus,
    })
    .from(hrmTimeClockDevice)
    .where(
      sql`${hrmTimeClockDevice.syncStatus} = 'failed'
        OR (${hrmTimeClockDevice.syncStatus} = 'syncing' AND ${hrmTimeClockDevice.lastSyncAt} < ${staleBefore})`
    )

  let alerted = 0
  let notificationsSent = 0
  for (const device of failedDevices) {
    await writeIamAuditEventFromNextHeaders({
      action: HRM_TCI_AUDIT.syncFail,
      actorUserId: "system",
      actorSessionId: null,
      organizationId: device.organizationId,
      resourceType: "hrm_time_clock_device",
      resourceId: device.id,
      metadata: { watch: "hrm-time-clock-sync" },
    })
    await db
      .update(hrmTimeClockDevice)
      .set({ syncStatus: "failed", updatedAt: sql`now()` })
      .where(eq(hrmTimeClockDevice.id, device.id))
    alerted += 1

    notificationsSent += await notify.notifyDeviceSyncFailure({
      organizationId: device.organizationId,
      deviceId: device.id,
      deviceName: device.name,
      externalDeviceId: device.externalDeviceId,
      reason: device.syncStatus === "syncing" ? "watch_stale" : "watch_failed",
    })
  }

  const allDevices = await db
    .select({ id: hrmTimeClockDevice.id })
    .from(hrmTimeClockDevice)

  return {
    scanned: allDevices.length,
    failed: failedDevices.length,
    alerted,
    notificationsSent,
  }
}
