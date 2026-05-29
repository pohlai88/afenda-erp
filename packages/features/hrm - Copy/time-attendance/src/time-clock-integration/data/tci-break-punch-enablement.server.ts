import "server-only"

import { cache } from "react"
import { and, eq, gt } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmRemoteCheckinPolicy } from "@afenda/platform/db/schema"

/**
 * HRM-TCI-007 "where enabled":
 * - `AFENDA_TCI_BREAK_PUNCH_CAPTURE=1` forces on (local / terminal-only orgs).
 * - `AFENDA_TCI_BREAK_PUNCH_CAPTURE=0` forces off.
 * - Otherwise on when the org has an active Geolocation policy with break window > 0.
 */
export const resolveTciBreakPunchCaptureEnabled = cache(
  async (organizationId: string): Promise<boolean> => {
    const override = process.env.AFENDA_TCI_BREAK_PUNCH_CAPTURE?.trim()
    if (override === "1") return true
    if (override === "0") return false

    const policy = await db.query.hrmRemoteCheckinPolicy.findFirst({
      where: and(
        eq(hrmRemoteCheckinPolicy.organizationId, organizationId),
        eq(hrmRemoteCheckinPolicy.isActive, true),
        gt(hrmRemoteCheckinPolicy.breakWindowMinutes, 0)
      ),
      columns: { id: true },
    })
    return policy != null
  }
)
