import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmRwsOpenShiftOffer,
  hrmRwsSchedulePeriod,
  hrmRwsStore,
} from "@afenda/platform/db/schema"

import { listRwsCoverageGapsForPeriod } from "./rws-coverage.server"
import { countUnderstaffedSlots } from "./rws-coverage-compare.shared"
import type { RwsOrgOverviewSummary } from "./rws.types.shared"

export async function summarizeRwsOrgOverview(
  organizationId: string
): Promise<RwsOrgOverviewSummary> {
  const [stores, periods, openOffers] = await Promise.all([
    db.query.hrmRwsStore.findMany({
      where: and(
        eq(hrmRwsStore.organizationId, organizationId),
        eq(hrmRwsStore.active, true)
      ),
      columns: { id: true },
    }),
    db.query.hrmRwsSchedulePeriod.findMany({
      where: eq(hrmRwsSchedulePeriod.organizationId, organizationId),
      columns: { id: true, state: true, periodStartDate: true, periodEndDate: true },
    }),
    db.query.hrmRwsOpenShiftOffer.findMany({
      where: and(
        eq(hrmRwsOpenShiftOffer.organizationId, organizationId),
        eq(hrmRwsOpenShiftOffer.status, "open")
      ),
      columns: { id: true },
    }),
  ])

  let understaffedSlots = 0
  const draftPeriods = periods.filter((p) => p.state === "draft")
  for (const period of draftPeriods.slice(0, 3)) {
    const gaps = await listRwsCoverageGapsForPeriod({
      organizationId,
      schedulePeriodId: period.id,
      periodStartDate: period.periodStartDate,
      periodEndDate: period.periodEndDate,
    })
    understaffedSlots += countUnderstaffedSlots(gaps)
  }

  return {
    activeStores: stores.length,
    draftPeriods: draftPeriods.length,
    publishedPeriods: periods.filter((p) => p.state === "published").length,
    openShiftOffers: openOffers.length,
    understaffedSlots,
  }
}
