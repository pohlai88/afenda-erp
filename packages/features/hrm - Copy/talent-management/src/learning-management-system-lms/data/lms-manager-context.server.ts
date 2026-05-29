import "server-only"

import { cache } from "react"
import { and, eq, isNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmEmployee } from "@afenda/platform/db/schema"

export type LmsManagerContext = {
  readonly employeeId: string
  readonly employeeNumber: string
  readonly legalName: string
}

export const findLmsManagerContextForUser = cache(
  async function findLmsManagerContextForUser(input: {
    organizationId: string
    userId: string
  }): Promise<LmsManagerContext | null> {
    const row = await db.query.hrmEmployee.findFirst({
      where: and(
        eq(hrmEmployee.organizationId, input.organizationId),
        eq(hrmEmployee.linkedUserId, input.userId),
        eq(hrmEmployee.employmentStatus, "active"),
        isNull(hrmEmployee.archivedAt)
      ),
      columns: {
        id: true,
        employeeNumber: true,
        legalName: true,
      },
    })

    if (!row) return null

    return {
      employeeId: row.id,
      employeeNumber: row.employeeNumber,
      legalName: row.legalName,
    }
  }
)

export async function listLmsDirectReportEmployeeIds(input: {
  organizationId: string
  managerEmployeeId: string
}): Promise<string[]> {
  const rows = await db
    .select({ id: hrmEmployee.id })
    .from(hrmEmployee)
    .where(
      and(
        eq(hrmEmployee.organizationId, input.organizationId),
        eq(hrmEmployee.managerEmployeeId, input.managerEmployeeId),
        eq(hrmEmployee.employmentStatus, "active"),
        isNull(hrmEmployee.archivedAt)
      )
    )

  return rows.map((row) => row.id)
}
