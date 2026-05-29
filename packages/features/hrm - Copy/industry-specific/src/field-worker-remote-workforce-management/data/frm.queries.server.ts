import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmEmployee } from "@afenda/platform/db/schema"

import { formatFrmEmployeeLabel } from "./frm-display.shared"

export async function listFrmEmployeeChoicesForOrg(organizationId: string) {
  const employees = await db.query.hrmEmployee.findMany({
    where: and(
      eq(hrmEmployee.organizationId, organizationId),
      eq(hrmEmployee.employmentStatus, "active")
    ),
    columns: {
      id: true,
      employeeNumber: true,
      legalName: true,
      preferredName: true,
    },
    orderBy: [asc(hrmEmployee.employeeNumber)],
  })

  return employees.map((employee) => ({
    id: employee.id,
    label: formatFrmEmployeeLabel({
      employeeNumber: employee.employeeNumber,
      legalName: employee.legalName,
      preferredName: employee.preferredName,
    }),
  }))
}
