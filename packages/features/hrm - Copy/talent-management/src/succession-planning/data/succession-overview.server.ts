import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmSuccessionCriticalRole,
  hrmSuccessionNomination,
  hrmSuccessionReviewCycle,
  hrmSuccessionTalentPool,
} from "@afenda/platform/db/schema"

import { listSuccessionBenchStrength } from "./succession-bench.server"
import type { SuccessionOrgOverviewSummary } from "./succession.types.shared"

export async function summarizeSuccessionOrgOverview(
  organizationId: string
): Promise<SuccessionOrgOverviewSummary> {
  const [roles, nominations, pools, reviewCycles, benchRows] = await Promise.all([
    db.query.hrmSuccessionCriticalRole.findMany({
      where: and(
        eq(hrmSuccessionCriticalRole.organizationId, organizationId),
        eq(hrmSuccessionCriticalRole.active, true)
      ),
      columns: { id: true },
    }),
    db.query.hrmSuccessionNomination.findMany({
      where: and(
        eq(hrmSuccessionNomination.organizationId, organizationId),
        eq(hrmSuccessionNomination.status, "active")
      ),
      columns: { id: true },
    }),
    db.query.hrmSuccessionTalentPool.findMany({
      where: and(
        eq(hrmSuccessionTalentPool.organizationId, organizationId),
        eq(hrmSuccessionTalentPool.active, true)
      ),
      columns: { id: true },
    }),
    db.query.hrmSuccessionReviewCycle.findMany({
      where: and(
        eq(hrmSuccessionReviewCycle.organizationId, organizationId),
        eq(hrmSuccessionReviewCycle.cycleState, "open")
      ),
      columns: { id: true },
    }),
    listSuccessionBenchStrength(organizationId),
  ])

  const rolesWithoutReadySuccessor = benchRows.filter(
    (row) => row.readyNowCount === 0
  ).length
  const highRiskRoles = benchRows.filter(
    (row) => row.riskLevel === "high" || row.riskLevel === "critical"
  ).length

  return {
    activeCriticalRoles: roles.length,
    activeNominations: nominations.length,
    talentPools: pools.length,
    openReviewCycles: reviewCycles.length,
    rolesWithoutReadySuccessor,
    highRiskRoles,
  }
}
