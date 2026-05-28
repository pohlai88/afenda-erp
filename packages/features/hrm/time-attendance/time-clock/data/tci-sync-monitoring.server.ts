import "server-only"

import { and, desc, eq, sql } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmTimeClockDevice } from "@afenda/platform/db/schema"

import {
  resolveTimeClockSyncMonitoringAttentionKind,
  TCI_SYNC_MONITORING_STALE_MS,
  type TciSyncMonitoringAttentionKind,
} from "../tci-sync-monitoring.shared"

export const TCI_SYNC_MONITORING_LIST_LIMIT = 50 as const

export type TimeClockSyncMonitoringRow = {
  readonly id: string
  readonly externalDeviceId: string
  readonly name: string
  readonly deviceType: string
  readonly locationRef: string | null
  readonly state: string
  readonly syncStatus: string
  readonly lastSyncAt: Date | null
  readonly attentionKind: TciSyncMonitoringAttentionKind
}

function mapSyncMonitoringRow(row: {
  readonly id: string
  readonly externalDeviceId: string
  readonly name: string
  readonly deviceType: string
  readonly locationRef: string | null
  readonly state: string
  readonly syncStatus: string
  readonly lastSyncAt: Date | null
}): TimeClockSyncMonitoringRow | null {
  const attentionKind = resolveTimeClockSyncMonitoringAttentionKind({
    syncStatus: row.syncStatus,
    lastSyncAt: row.lastSyncAt,
  })
  if (!attentionKind) return null
  return { ...row, attentionKind }
}

export async function countSyncMonitoringAttentionForOrg(
  organizationId: string
): Promise<number> {
  const staleBefore = new Date(Date.now() - TCI_SYNC_MONITORING_STALE_MS)
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(hrmTimeClockDevice)
    .where(
      and(
        eq(hrmTimeClockDevice.organizationId, organizationId),
        sql`${hrmTimeClockDevice.syncStatus} = 'failed'
          OR (${hrmTimeClockDevice.syncStatus} = 'syncing'
            AND ${hrmTimeClockDevice.lastSyncAt} < ${staleBefore})`
      )
    )
  return Number(rows[0]?.count ?? 0)
}

export async function listSyncMonitoringRowsForOrg(
  organizationId: string,
  options?: { readonly limit?: number }
): Promise<TimeClockSyncMonitoringRow[]> {
  const limit = options?.limit ?? TCI_SYNC_MONITORING_LIST_LIMIT
  const staleBefore = new Date(Date.now() - TCI_SYNC_MONITORING_STALE_MS)

  const rows = await db
    .select({
      id: hrmTimeClockDevice.id,
      externalDeviceId: hrmTimeClockDevice.externalDeviceId,
      name: hrmTimeClockDevice.name,
      deviceType: hrmTimeClockDevice.deviceType,
      locationRef: hrmTimeClockDevice.locationRef,
      state: hrmTimeClockDevice.state,
      syncStatus: hrmTimeClockDevice.syncStatus,
      lastSyncAt: hrmTimeClockDevice.lastSyncAt,
    })
    .from(hrmTimeClockDevice)
    .where(
      and(
        eq(hrmTimeClockDevice.organizationId, organizationId),
        sql`${hrmTimeClockDevice.syncStatus} = 'failed'
          OR (${hrmTimeClockDevice.syncStatus} = 'syncing'
            AND ${hrmTimeClockDevice.lastSyncAt} < ${staleBefore})`
      )
    )
    .orderBy(desc(hrmTimeClockDevice.updatedAt))
    .limit(limit)

  const mapped: TimeClockSyncMonitoringRow[] = []
  for (const row of rows) {
    const item = mapSyncMonitoringRow(row)
    if (item) mapped.push(item)
  }
  return mapped
}
