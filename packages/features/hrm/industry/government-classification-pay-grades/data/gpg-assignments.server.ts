import "server-only"

import { and, asc, eq, inArray, isNull } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmGpgEmployeeAssignment,
  hrmGpgLocalityRule,
  hrmGpgPayBand,
  hrmGpgPayGrade,
  hrmGpgSalaryTableVersion,
} from "@afenda/platform/db/schema"

import { HRM_GPG_AUDIT } from "../gpg.contract"
import type { HrmGpgAppointmentType } from "../schemas/gpg-workflow-state.shared"
import {
  formatGpgClassificationLabel,
  formatGpgPayBandLabel,
  formatGpgPayGradeLabel,
} from "./gpg-display.shared"
import { listGpgAdjustmentReferencesForOrg } from "./gpg-locality.server"
import { computeGpgLocalityAdjustedPay } from "./gpg-locality-adjusted-pay.shared"
import { revalidateGpgSurfaces } from "./gpg-revalidate.server"
import { listGpgClassificationsForOrg } from "./gpg-classifications.server"
import {
  listGpgPayBandsForOrg,
  listGpgPayGradesForOrg,
} from "./gpg-pay-structure.server"
import {
  findGpgSalaryTableRowForGradeStep,
  listGpgPublishedSalaryTableVersionChoicesForOrg,
} from "./gpg-salary-tables.server"
import type {
  GpgEmployeeAssignmentRow,
  GpgEmployeeChoiceRow,
} from "./gpg.types.shared"

function formatEmployeeLabel(row: {
  employeeNumber: string | null
  legalName: string
  preferredName: string | null
}) {
  const name = row.preferredName?.trim() || row.legalName
  return row.employeeNumber ? `${row.employeeNumber} — ${name}` : name
}

export async function listGpgEmployeeChoicesForOrg(
  organizationId: string
): Promise<GpgEmployeeChoiceRow[]> {
  const rows = await db
    .select({
      id: hrmEmployee.id,
      legalName: hrmEmployee.legalName,
      preferredName: hrmEmployee.preferredName,
      employeeNumber: hrmEmployee.employeeNumber,
    })
    .from(hrmEmployee)
    .where(
      and(
        eq(hrmEmployee.organizationId, organizationId),
        eq(hrmEmployee.employmentStatus, "active")
      )
    )
    .orderBy(asc(hrmEmployee.employeeNumber))

  return rows.map((row) => ({
    id: row.id,
    label: formatEmployeeLabel(row),
  }))
}

export { listGpgPublishedSalaryTableVersionChoicesForOrg }

export async function listGpgEmployeeAssignmentsForOrg(
  organizationId: string
): Promise<GpgEmployeeAssignmentRow[]> {
  const assignments = await db.query.hrmGpgEmployeeAssignment.findMany({
    where: eq(hrmGpgEmployeeAssignment.organizationId, organizationId),
    orderBy: [asc(hrmGpgEmployeeAssignment.effectiveFrom)],
  })
  if (assignments.length === 0) return []

  const employeeIds = [...new Set(assignments.map((row) => row.employeeId))]
  const [
    employees,
    classifications,
    grades,
    bands,
    adjustments,
    localityRules,
  ] = await Promise.all([
    db
      .select({
        id: hrmEmployee.id,
        legalName: hrmEmployee.legalName,
        preferredName: hrmEmployee.preferredName,
        employeeNumber: hrmEmployee.employeeNumber,
      })
      .from(hrmEmployee)
      .where(
        and(
          eq(hrmEmployee.organizationId, organizationId),
          inArray(hrmEmployee.id, employeeIds)
        )
      ),
    listGpgClassificationsForOrg(organizationId),
    listGpgPayGradesForOrg(organizationId),
    listGpgPayBandsForOrg(organizationId),
    listGpgAdjustmentReferencesForOrg(organizationId),
    db.query.hrmGpgLocalityRule.findMany({
      where: eq(hrmGpgLocalityRule.organizationId, organizationId),
      columns: { id: true, adjustmentPercent: true },
    }),
  ])

  const employeeMap = new Map(
    employees.map((row) => [row.id, formatEmployeeLabel(row)] as const)
  )
  const classificationMap = new Map(
    classifications.map(
      (row) => [row.id, formatGpgClassificationLabel(row)] as const
    )
  )
  const gradeMap = new Map(grades.map((row) => [row.id, row] as const))
  const bandMap = new Map(bands.map((row) => [row.id, row] as const))
  const localityPercentById = new Map(
    localityRules.map((row) => [row.id, row.adjustmentPercent] as const)
  )

  const adjustmentsByEmployee = new Map<string, typeof adjustments>()
  for (const ref of adjustments) {
    const list = adjustmentsByEmployee.get(ref.employeeId) ?? []
    list.push(ref)
    adjustmentsByEmployee.set(ref.employeeId, list)
  }

  const rows: GpgEmployeeAssignmentRow[] = []
  for (const assignment of assignments) {
    const grade = gradeMap.get(assignment.payGradeId)
    const band = assignment.payBandId ? bandMap.get(assignment.payBandId) : null

    let baseRate: string | null = null
    let currencyCode: string | null = band?.currencyCode ?? null

    if (assignment.salaryTableVersionId) {
      const salaryRow = await findGpgSalaryTableRowForGradeStep({
        organizationId,
        tableVersionId: assignment.salaryTableVersionId,
        payGradeId: assignment.payGradeId,
        step: assignment.step,
      })
      if (salaryRow) {
        baseRate = salaryRow.baseRate
        currencyCode = salaryRow.currencyCode ?? currencyCode
      }
    }

    const employeeAdjustments =
      adjustmentsByEmployee.get(assignment.employeeId) ?? []
    let localityPercent: string | null = null
    let supplementalPercent: string | null = null
    let supplementalAmount: string | null = null
    for (const ref of employeeAdjustments) {
      if (ref.localityRuleId && !localityPercent) {
        localityPercent = localityPercentById.get(ref.localityRuleId) ?? null
      }
      if (ref.percent) supplementalPercent = ref.percent
      if (ref.amount) supplementalAmount = ref.amount
    }

    const adjusted =
      baseRate != null
        ? computeGpgLocalityAdjustedPay({
            baseRate,
            localityPercent,
            supplementalPercent,
            supplementalAmount,
          })
        : null

    rows.push({
      id: assignment.id,
      employeeId: assignment.employeeId,
      employeeLabel:
        employeeMap.get(assignment.employeeId) ?? assignment.employeeId,
      classificationLabel:
        classificationMap.get(assignment.classificationId) ??
        assignment.classificationId,
      payGradeLabel: grade
        ? formatGpgPayGradeLabel(grade)
        : assignment.payGradeId,
      payBandLabel: band ? formatGpgPayBandLabel(band) : null,
      step: assignment.step,
      appointmentType: assignment.appointmentType as HrmGpgAppointmentType,
      effectiveFrom: assignment.effectiveFrom,
      effectiveTo: assignment.effectiveTo,
      state: assignment.state as GpgEmployeeAssignmentRow["state"],
      baseRate,
      adjustedPayReference: adjusted?.adjustedRate ?? null,
      currencyCode,
    })
  }

  return rows
}

export async function createGpgEmployeeAssignment(input: {
  organizationId: string
  userId: string
  employeeId: string
  classificationId: string
  payGradeId: string
  payBandId: string | null
  salaryTableVersionId: string
  step: number
  appointmentType: HrmGpgAppointmentType
  effectiveFrom: string
  positionId: string | null
}): Promise<{ ok: true; assignmentId: string } | { ok: false; form?: string }> {
  const employee = await db.query.hrmEmployee.findFirst({
    where: and(
      eq(hrmEmployee.organizationId, input.organizationId),
      eq(hrmEmployee.id, input.employeeId)
    ),
    columns: { id: true },
  })
  if (!employee) {
    return { ok: false, form: "Employee not found." }
  }

  const version = await db.query.hrmGpgSalaryTableVersion.findFirst({
    where: and(
      eq(hrmGpgSalaryTableVersion.organizationId, input.organizationId),
      eq(hrmGpgSalaryTableVersion.id, input.salaryTableVersionId),
      eq(hrmGpgSalaryTableVersion.state, "published")
    ),
    columns: { id: true },
  })
  if (!version) {
    return { ok: false, form: "Published salary table version is required." }
  }

  const grade = await db.query.hrmGpgPayGrade.findFirst({
    where: and(
      eq(hrmGpgPayGrade.organizationId, input.organizationId),
      eq(hrmGpgPayGrade.id, input.payGradeId),
      eq(hrmGpgPayGrade.classificationId, input.classificationId)
    ),
    columns: { id: true },
  })
  if (!grade) {
    return {
      ok: false,
      form: "Pay grade must belong to the selected classification.",
    }
  }

  if (input.payBandId) {
    const band = await db.query.hrmGpgPayBand.findFirst({
      where: and(
        eq(hrmGpgPayBand.organizationId, input.organizationId),
        eq(hrmGpgPayBand.id, input.payBandId),
        eq(hrmGpgPayBand.payGradeId, input.payGradeId)
      ),
      columns: { id: true },
    })
    if (!band) {
      return {
        ok: false,
        form: "Pay band must belong to the selected pay grade.",
      }
    }
  }

  const salaryRow = await findGpgSalaryTableRowForGradeStep({
    organizationId: input.organizationId,
    tableVersionId: input.salaryTableVersionId,
    payGradeId: input.payGradeId,
    step: input.step,
  })
  if (!salaryRow) {
    return {
      ok: false,
      form: "No salary table row exists for this pay grade and step on the selected version.",
    }
  }

  const activeConflict = await db.query.hrmGpgEmployeeAssignment.findFirst({
    where: and(
      eq(hrmGpgEmployeeAssignment.organizationId, input.organizationId),
      eq(hrmGpgEmployeeAssignment.employeeId, input.employeeId),
      eq(hrmGpgEmployeeAssignment.state, "active"),
      isNull(hrmGpgEmployeeAssignment.effectiveTo)
    ),
    columns: { id: true },
  })
  if (activeConflict) {
    return {
      ok: false,
      form: "Employee already has an active assignment. End it before creating another.",
    }
  }

  const id = crypto.randomUUID()
  await db.insert(hrmGpgEmployeeAssignment).values({
    id,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    positionId: input.positionId?.trim() || null,
    classificationId: input.classificationId,
    payGradeId: input.payGradeId,
    payBandId: input.payBandId,
    salaryTableVersionId: input.salaryTableVersionId,
    step: input.step,
    appointmentType: input.appointmentType,
    effectiveFrom: input.effectiveFrom,
    state: "active",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.employeeAssignmentCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_pay_grade_assignment",
    resourceId: id,
    metadata: { employeeId: input.employeeId, step: input.step },
  })

  revalidateGpgSurfaces()
  return { ok: true, assignmentId: id }
}
