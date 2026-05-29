import "server-only"

import { and, asc, eq, inArray } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmGpgAssignmentHistory,
  hrmGpgEmployeeAssignment,
  hrmGpgPayGrade,
} from "@afenda/platform/db/schema"

import {
  formatGpgClassificationLabel,
  formatGpgPayGradeLabel,
} from "./gpg-display.shared"
import { listGpgClassificationsForOrg } from "./gpg-classifications.server"
import type { GpgAssignmentHistoryRow } from "./gpg.types.shared"

function formatEmployeeLabel(row: {
  employeeNumber: string | null
  legalName: string
  preferredName: string | null
}) {
  const name = row.preferredName?.trim() || row.legalName
  return row.employeeNumber ? `${row.employeeNumber} — ${name}` : name
}

export async function listGpgAssignmentHistoryForOrg(
  organizationId: string
): Promise<GpgAssignmentHistoryRow[]> {
  const history = await db.query.hrmGpgAssignmentHistory.findMany({
    where: eq(hrmGpgAssignmentHistory.organizationId, organizationId),
    orderBy: [
      asc(hrmGpgAssignmentHistory.asOfDate),
      asc(hrmGpgAssignmentHistory.createdAt),
    ],
  })
  if (history.length === 0) return []

  const assignmentIds = [...new Set(history.map((row) => row.assignmentId))]
  const gradeIds = [...new Set(history.map((row) => row.payGradeId))]

  const [assignments, employees, grades, classifications] = await Promise.all([
    db
      .select({
        id: hrmGpgEmployeeAssignment.id,
        employeeId: hrmGpgEmployeeAssignment.employeeId,
      })
      .from(hrmGpgEmployeeAssignment)
      .where(
        and(
          eq(hrmGpgEmployeeAssignment.organizationId, organizationId),
          inArray(hrmGpgEmployeeAssignment.id, assignmentIds)
        )
      ),
    db
      .select({
        id: hrmEmployee.id,
        legalName: hrmEmployee.legalName,
        preferredName: hrmEmployee.preferredName,
        employeeNumber: hrmEmployee.employeeNumber,
      })
      .from(hrmEmployee)
      .where(eq(hrmEmployee.organizationId, organizationId)),
    db
      .select({
        id: hrmGpgPayGrade.id,
        code: hrmGpgPayGrade.code,
        name: hrmGpgPayGrade.name,
      })
      .from(hrmGpgPayGrade)
      .where(
        and(
          eq(hrmGpgPayGrade.organizationId, organizationId),
          inArray(hrmGpgPayGrade.id, gradeIds)
        )
      ),
    listGpgClassificationsForOrg(organizationId),
  ])

  const assignmentEmployeeMap = new Map(
    assignments.map((row) => [row.id, row.employeeId] as const)
  )
  const employeeMap = new Map(
    employees.map((row) => [row.id, formatEmployeeLabel(row)] as const)
  )
  const gradeMap = new Map(
    grades.map((row) => [row.id, formatGpgPayGradeLabel(row)] as const)
  )
  const classificationMap = new Map(
    classifications.map(
      (row) => [row.id, formatGpgClassificationLabel(row)] as const
    )
  )

  return history.map((row) => {
    const employeeId = assignmentEmployeeMap.get(row.assignmentId)
    return {
      id: row.id,
      assignmentId: row.assignmentId,
      employeeId: employeeId ?? null,
      employeeLabel:
        employeeId != null ? (employeeMap.get(employeeId) ?? employeeId) : "—",
      asOfDate: row.asOfDate,
      classificationLabel:
        classificationMap.get(row.classificationId) ?? row.classificationId,
      payGradeLabel: gradeMap.get(row.payGradeId) ?? row.payGradeId,
      step: row.step,
      salaryTableVersionId: row.salaryTableVersionId,
    }
  })
}
