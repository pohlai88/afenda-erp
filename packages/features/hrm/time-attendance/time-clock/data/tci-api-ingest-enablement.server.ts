import "server-only"

import { cache } from "react"
import { and, eq, isNotNull, or } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmTimeClockDevice } from "@afenda/platform/db/schema"

import { TCI_API_INGEST_ENV_KEYS } from "../tci-api-ingest.shared"

/**
 * HRM-TCI-010 "where enabled":
 * - `AFENDA_TCI_API_INGEST=1` forces on (local / terminal-only orgs).
 * - `AFENDA_TCI_API_INGEST=0` forces off.
 * - Platform Bearer branch: `HRM_TIME_CLOCK_INGEST_API_KEY` + `HRM_TIME_CLOCK_INGEST_ACTOR_USER_ID`.
 * - Otherwise on when the org has an active device with API type or ingest credential ref.
 */
export const resolveTciApiIngestEnabled = cache(
  async (organizationId: string): Promise<boolean> => {
    const override = process.env.AFENDA_TCI_API_INGEST?.trim()
    if (override === "1") return true
    if (override === "0") return false

    const platformKey = process.env[TCI_API_INGEST_ENV_KEYS[0]]?.trim()
    const platformActor = process.env[TCI_API_INGEST_ENV_KEYS[1]]?.trim()
    if (platformKey && platformActor) {
      return true
    }

    const devices = await db
      .select({
        deviceType: hrmTimeClockDevice.deviceType,
        integrationCredentialRef: hrmTimeClockDevice.integrationCredentialRef,
      })
      .from(hrmTimeClockDevice)
      .where(
        and(
          eq(hrmTimeClockDevice.organizationId, organizationId),
          eq(hrmTimeClockDevice.state, "active"),
          or(
            eq(hrmTimeClockDevice.deviceType, "api"),
            isNotNull(hrmTimeClockDevice.integrationCredentialRef)
          )
        )
      )
      .limit(20)

    return devices.some(
      (row) =>
        row.deviceType === "api" ||
        (row.integrationCredentialRef?.trim().length ?? 0) > 0
    )
  }
)
