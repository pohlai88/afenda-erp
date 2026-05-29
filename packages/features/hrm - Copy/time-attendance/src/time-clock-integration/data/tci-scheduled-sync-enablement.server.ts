import "server-only"

import { and, eq, isNotNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmTimeClockDevice } from "@afenda/platform/db/schema"

import {
  isDeviceConfiguredForScheduledVendorSync,
  TCI_SCHEDULED_SYNC_OVERRIDE_ENV,
} from "../tci-scheduled-sync.shared"

/**
 * HRM-TCI-011 "where enabled": org has at least one active device whose
 * `integrationCredentialRef` is a vendor poll URL (`poll:`, `vendor:zebra:`, `vendor:ukg:`).
 */
export async function resolveTciScheduledSyncEnabled(
  organizationId: string
): Promise<boolean> {
  const override = process.env[TCI_SCHEDULED_SYNC_OVERRIDE_ENV]?.trim()
  if (override === "1") return true
  if (override === "0") return false

  const devices = await db
    .select({
      integrationCredentialRef: hrmTimeClockDevice.integrationCredentialRef,
    })
    .from(hrmTimeClockDevice)
    .where(
      and(
        eq(hrmTimeClockDevice.organizationId, organizationId),
        eq(hrmTimeClockDevice.state, "active"),
        isNotNull(hrmTimeClockDevice.integrationCredentialRef)
      )
    )

  return devices.some((row) =>
    isDeviceConfiguredForScheduledVendorSync(row.integrationCredentialRef)
  )
}
