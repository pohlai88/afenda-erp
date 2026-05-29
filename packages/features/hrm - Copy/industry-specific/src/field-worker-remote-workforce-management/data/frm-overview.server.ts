import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmFrmFieldAssignment,
  hrmFrmFieldException,
} from "@afenda/platform/db/schema"

import { listFrmTravelStatusesForOrg } from "./frm-travel.server"

export type FrmOrgOverviewSummary = {
  readonly activeAssignments: number
  readonly openExceptions: number
  readonly activeTravel: number
  readonly nonCompliantTravel: number
}

export async function summarizeFrmOrgOverview(
  organizationId: string
): Promise<FrmOrgOverviewSummary> {
  const [assignments, exceptions, travel] = await Promise.all([
    db.query.hrmFrmFieldAssignment.findMany({
      where: and(
        eq(hrmFrmFieldAssignment.organizationId, organizationId),
        eq(hrmFrmFieldAssignment.state, "active")
      ),
      columns: { id: true },
    }),
    db.query.hrmFrmFieldException.findMany({
      where: and(
        eq(hrmFrmFieldException.organizationId, organizationId),
        eq(hrmFrmFieldException.state, "open")
      ),
      columns: { id: true },
    }),
    listFrmTravelStatusesForOrg(organizationId),
  ])

  return {
    activeAssignments: assignments.length,
    openExceptions: exceptions.length,
    activeTravel: travel.filter(
      (t) => t.state === "in_progress" || t.state === "planned"
    ).length,
    nonCompliantTravel: travel.filter((t) => t.nonCompliant).length,
  }
}
