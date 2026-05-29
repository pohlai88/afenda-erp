import "server-only"

import { cache } from "react"
import { and, eq, inArray } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmTimeClockDevice } from "@afenda/platform/db/schema"

import {
  TCI_OFFLINE_REPLAY_DEVICE_TYPES,
  TCI_OFFLINE_REPLAY_OVERRIDE_ENV,
} from "../tci-offline-replay.shared"

/**
 * HRM-TCI-012 "where enabled": org has at least one active terminal-class device
 * (biometric, card, rfid, kiosk, web) that can buffer punches offline.
 */
export const resolveTciOfflineReplayEnabled = cache(
  async (organizationId: string): Promise<boolean> => {
    const override = process.env[TCI_OFFLINE_REPLAY_OVERRIDE_ENV]?.trim()
    if (override === "1") return true
    if (override === "0") return false

    const row = await db
      .select({ id: hrmTimeClockDevice.id })
      .from(hrmTimeClockDevice)
      .where(
        and(
          eq(hrmTimeClockDevice.organizationId, organizationId),
          eq(hrmTimeClockDevice.state, "active"),
          inArray(hrmTimeClockDevice.deviceType, [
            ...TCI_OFFLINE_REPLAY_DEVICE_TYPES,
          ])
        )
      )
      .limit(1)

    return row.length > 0
  }
)
