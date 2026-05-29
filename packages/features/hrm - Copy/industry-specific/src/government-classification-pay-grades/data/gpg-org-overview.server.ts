import "server-only"

import { and, eq, inArray, isNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmGpgEmployeeAssignment,
  hrmGpgGradeMovement,
  hrmGpgLocalityRule,
  hrmGpgStepIncreaseEvent,
} from "@afenda/platform/db/schema"

import type { GpgOrgOverviewSummary } from "./gpg.types.shared"

export async function summarizeGpgOrgOverview(
  organizationId: string
): Promise<GpgOrgOverviewSummary> {
  const [assignments, localityRules, pendingEvents, movements] =
    await Promise.all([
      db.query.hrmGpgEmployeeAssignment.findMany({
        where: and(
          eq(hrmGpgEmployeeAssignment.organizationId, organizationId),
          eq(hrmGpgEmployeeAssignment.state, "active"),
          isNull(hrmGpgEmployeeAssignment.effectiveTo)
        ),
        columns: { payGradeId: true },
      }),
      db.query.hrmGpgLocalityRule.findMany({
        where: and(
          eq(hrmGpgLocalityRule.organizationId, organizationId),
          eq(hrmGpgLocalityRule.state, "active")
        ),
        columns: { id: true },
      }),
      db.query.hrmGpgStepIncreaseEvent.findMany({
        where: and(
          eq(hrmGpgStepIncreaseEvent.organizationId, organizationId),
          inArray(hrmGpgStepIncreaseEvent.state, ["pending", "approved"])
        ),
        columns: { id: true },
      }),
      db.query.hrmGpgGradeMovement.findMany({
        where: and(
          eq(hrmGpgGradeMovement.organizationId, organizationId),
          eq(hrmGpgGradeMovement.state, "applied")
        ),
        columns: { id: true },
      }),
    ])

  const distinctGrades = new Set(assignments.map((row) => row.payGradeId))

  return {
    activeAssignments: assignments.length,
    distinctPayGrades: distinctGrades.size,
    activeLocalityRules: localityRules.length,
    pendingStepEvents: pendingEvents.length,
    appliedMovements: movements.length,
  }
}
