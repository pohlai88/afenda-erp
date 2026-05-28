import "server-only"

import { and, asc, eq, inArray, isNull } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmGpgAssignmentHistory,
  hrmGpgEmployeeAssignment,
  hrmGpgGradeMovement,
  hrmGpgPayBand,
  hrmGpgPayGrade,
} from "@afenda/platform/db/schema"

import { HRM_GPG_AUDIT } from "../gpg.contract"
import {
  hrmGpgAppointmentTypeSchema,
  type HrmGpgAppointmentType,
  type HrmGpgMovementType,
} from "../schemas/gpg-workflow-state.shared"
import { formatGpgPayGradeLabel } from "./gpg-display.shared"
import { validateGpgGradeMovementAssignment } from "./gpg-assignment-validation.shared"
import {
  decodeGpgGradeMovementDraftWizard,
  encodeGpgGradeMovementDraftWizard,
} from "./gpg-grade-movement-draft.shared"
import { listGpgPayGradesForOrg } from "./gpg-pay-structure.server"
import { findGpgSalaryTableRowForGradeStep } from "./gpg-salary-tables.server"
import { revalidateGpgSurfaces } from "./gpg-revalidate.server"
import type { GpgGradeMovementRow } from "./gpg.types.shared"

function dayBeforeIsoDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

function formatEmployeeLabel(row: {
  employeeNumber: string | null
  legalName: string
  preferredName: string | null
}) {
  const name = row.preferredName?.trim() || row.legalName
  return row.employeeNumber ? `${row.employeeNumber} — ${name}` : name
}

export async function listGpgGradeMovementsForOrg(
  organizationId: string
): Promise<GpgGradeMovementRow[]> {
  const movements = await db.query.hrmGpgGradeMovement.findMany({
    where: eq(hrmGpgGradeMovement.organizationId, organizationId),
    orderBy: [
      asc(hrmGpgGradeMovement.effectiveDate),
      asc(hrmGpgGradeMovement.createdAt),
    ],
  })
  if (movements.length === 0) return []

  const employeeIds = [...new Set(movements.map((row) => row.employeeId))]
  const gradeIds = [
    ...new Set(
      movements.flatMap((row) =>
        [row.fromPayGradeId, row.toPayGradeId].filter((id): id is string =>
          Boolean(id)
        )
      )
    ),
  ]

  const [employees, grades] = await Promise.all([
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
    gradeIds.length > 0
      ? db
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
          )
      : Promise.resolve([]),
  ])

  const employeeMap = new Map(
    employees.map((row) => [row.id, formatEmployeeLabel(row)] as const)
  )
  const gradeMap = new Map(
    grades.map((row) => [row.id, formatGpgPayGradeLabel(row)] as const)
  )

  return movements.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    employeeLabel: employeeMap.get(row.employeeId) ?? row.employeeId,
    movementType: row.movementType as HrmGpgMovementType,
    fromPayGradeLabel: row.fromPayGradeId
      ? (gradeMap.get(row.fromPayGradeId) ?? row.fromPayGradeId)
      : null,
    toPayGradeLabel: row.toPayGradeId
      ? (gradeMap.get(row.toPayGradeId) ?? row.toPayGradeId)
      : null,
    fromStep: row.fromStep,
    toStep: row.toStep,
    effectiveDate: row.effectiveDate,
    retentionAmount: row.retentionAmount,
    reason: row.reason,
    state: row.state as GpgGradeMovementRow["state"],
  }))
}

export async function createGpgGradeMovement(input: {
  organizationId: string
  userId: string
  employeeId: string
  movementType: Exclude<HrmGpgMovementType, "step_increase">
  classificationId: string
  toPayGradeId: string
  toStep: number
  salaryTableVersionId: string
  payBandId: string | null
  effectiveDate: string
  reason: string | null
  retentionAmount: string | null
}): Promise<{ ok: true; movementId: string } | { ok: false; form?: string }> {
  const assignment = await db.query.hrmGpgEmployeeAssignment.findFirst({
    where: and(
      eq(hrmGpgEmployeeAssignment.organizationId, input.organizationId),
      eq(hrmGpgEmployeeAssignment.employeeId, input.employeeId),
      eq(hrmGpgEmployeeAssignment.state, "active"),
      isNull(hrmGpgEmployeeAssignment.effectiveTo)
    ),
  })
  if (!assignment) {
    return {
      ok: false,
      form: "Employee must have an active assignment before recording a movement.",
    }
  }

  const toGrade = await db.query.hrmGpgPayGrade.findFirst({
    where: and(
      eq(hrmGpgPayGrade.organizationId, input.organizationId),
      eq(hrmGpgPayGrade.id, input.toPayGradeId)
    ),
    columns: { id: true, classificationId: true },
  })
  if (!toGrade) {
    return { ok: false, form: "Target pay grade not found." }
  }

  const salaryRow = await findGpgSalaryTableRowForGradeStep({
    organizationId: input.organizationId,
    tableVersionId: input.salaryTableVersionId,
    payGradeId: input.toPayGradeId,
    step: input.toStep,
  })

  const validation = validateGpgGradeMovementAssignment({
    movementType: input.movementType,
    fromPayGradeId: assignment.payGradeId,
    fromStep: assignment.step,
    toPayGradeId: input.toPayGradeId,
    toStep: input.toStep,
    toPayGradeClassificationId: toGrade.classificationId,
    targetClassificationId: input.classificationId,
    hasSalaryTableRow: Boolean(salaryRow),
    retentionAmount: input.retentionAmount,
  })
  if (!validation.ok) {
    return { ok: false, form: validation.message }
  }

  if (input.payBandId) {
    const band = await db.query.hrmGpgPayBand.findFirst({
      where: and(
        eq(hrmGpgPayBand.organizationId, input.organizationId),
        eq(hrmGpgPayBand.id, input.payBandId),
        eq(hrmGpgPayBand.payGradeId, input.toPayGradeId)
      ),
      columns: { id: true },
    })
    if (!band) {
      return {
        ok: false,
        form: "Pay band must belong to the target pay grade.",
      }
    }
  }

  const movementId = crypto.randomUUID()
  const fromPayGradeId = assignment.payGradeId
  const fromStep = assignment.step
  const toPayGradeId = input.toPayGradeId
  const toStep = input.toStep

  await db.insert(hrmGpgGradeMovement).values({
    id: movementId,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    movementType: input.movementType,
    fromPayGradeId,
    toPayGradeId,
    fromStep,
    toStep,
    effectiveDate: input.effectiveDate,
    reason: input.reason?.trim() || null,
    retentionAmount: input.retentionAmount?.trim() || null,
    state: "draft",
    audit7w1h: encodeGpgGradeMovementDraftWizard({
      classificationId: input.classificationId,
      salaryTableVersionId: input.salaryTableVersionId,
      payBandId: input.payBandId,
    }),
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.gradeMovementCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_pay_grade_movement",
    resourceId: movementId,
    metadata: {
      employeeId: input.employeeId,
      movementType: input.movementType,
      fromStep,
      toStep,
      state: "draft",
    },
  })

  revalidateGpgSurfaces()
  return { ok: true, movementId }
}

export async function applyGpgGradeMovementDraft(input: {
  organizationId: string
  userId: string
  movementId: string
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const movement = await db.query.hrmGpgGradeMovement.findFirst({
    where: and(
      eq(hrmGpgGradeMovement.organizationId, input.organizationId),
      eq(hrmGpgGradeMovement.id, input.movementId),
      eq(hrmGpgGradeMovement.state, "draft")
    ),
  })
  if (!movement) {
    return { ok: false, form: "Draft movement not found or already applied." }
  }

  const wizard = decodeGpgGradeMovementDraftWizard(movement.audit7w1h)
  if (!wizard) {
    return { ok: false, form: "Movement draft is missing wizard metadata." }
  }

  const assignment = await db.query.hrmGpgEmployeeAssignment.findFirst({
    where: and(
      eq(hrmGpgEmployeeAssignment.organizationId, input.organizationId),
      eq(hrmGpgEmployeeAssignment.employeeId, movement.employeeId),
      eq(hrmGpgEmployeeAssignment.state, "active"),
      isNull(hrmGpgEmployeeAssignment.effectiveTo)
    ),
  })
  if (!assignment) {
    return {
      ok: false,
      form: "Employee must have an active assignment before applying a movement.",
    }
  }

  const movementType = movement.movementType as Exclude<
    HrmGpgMovementType,
    "step_increase"
  >
  const toPayGradeId = movement.toPayGradeId
  const toStep = movement.toStep
  if (!toPayGradeId || toStep == null) {
    return { ok: false, form: "Movement target grade or step is missing." }
  }

  const applyResult = await applyGpgGradeMovementAssignmentChange({
    organizationId: input.organizationId,
    userId: input.userId,
    movementId: movement.id,
    assignment,
    movementType,
    classificationId: wizard.classificationId,
    toPayGradeId,
    toStep,
    salaryTableVersionId: wizard.salaryTableVersionId,
    payBandId: wizard.payBandId,
    effectiveDate: movement.effectiveDate,
    retentionAmount: movement.retentionAmount,
  })

  if (!applyResult.ok) {
    return { ok: false, form: applyResult.form }
  }

  await writeIamAuditEventFromNextHeaders({
    action: HRM_GPG_AUDIT.gradeMovementApply,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "government_pay_grade_movement",
    resourceId: movement.id,
    metadata: {
      employeeId: movement.employeeId,
      movementType,
      effectiveDate: movement.effectiveDate,
    },
  })

  revalidateGpgSurfaces()
  return { ok: true }
}

async function applyGpgGradeMovementAssignmentChange(input: {
  organizationId: string
  userId: string
  movementId: string
  assignment: typeof hrmGpgEmployeeAssignment.$inferSelect
  movementType: Exclude<HrmGpgMovementType, "step_increase">
  classificationId: string
  toPayGradeId: string
  toStep: number
  salaryTableVersionId: string
  payBandId: string | null
  effectiveDate: string
  retentionAmount: string | null
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const sameTarget =
    input.assignment.payGradeId === input.toPayGradeId &&
    input.assignment.step === input.toStep

  if (input.movementType === "pay_retention" && sameTarget) {
    await db
      .update(hrmGpgGradeMovement)
      .set({ state: "applied", updatedAt: new Date() })
      .where(eq(hrmGpgGradeMovement.id, input.movementId))
    return { ok: true }
  }

  const priorAppointment = hrmGpgAppointmentTypeSchema.parse(
    input.assignment.appointmentType
  )
  const appointmentType: HrmGpgAppointmentType =
    input.movementType === "acting_higher_duty" ? "acting" : priorAppointment

  const effectiveTo = dayBeforeIsoDate(input.effectiveDate)

  await db.insert(hrmGpgAssignmentHistory).values({
    id: crypto.randomUUID(),
    organizationId: input.organizationId,
    assignmentId: input.assignment.id,
    asOfDate: effectiveTo,
    classificationId: input.assignment.classificationId,
    payGradeId: input.assignment.payGradeId,
    payBandId: input.assignment.payBandId,
    step: input.assignment.step,
    salaryTableVersionId: input.assignment.salaryTableVersionId,
    localityRuleId: null,
    snapshotJson: {
      movementId: input.movementId,
      movementType: input.movementType,
      closedAt: input.effectiveDate,
    },
  })

  await db
    .update(hrmGpgEmployeeAssignment)
    .set({
      effectiveTo,
      state: "ended",
      updatedAt: new Date(),
    })
    .where(eq(hrmGpgEmployeeAssignment.id, input.assignment.id))

  const newAssignmentId = crypto.randomUUID()
  await db.insert(hrmGpgEmployeeAssignment).values({
    id: newAssignmentId,
    organizationId: input.organizationId,
    employeeId: input.assignment.employeeId,
    positionId: input.assignment.positionId,
    classificationId: input.classificationId,
    payGradeId: input.toPayGradeId,
    payBandId: input.payBandId,
    salaryTableVersionId: input.salaryTableVersionId,
    step: input.toStep,
    appointmentType,
    effectiveFrom: input.effectiveDate,
    state: "active",
  })

  await db
    .update(hrmGpgGradeMovement)
    .set({ state: "applied", updatedAt: new Date() })
    .where(eq(hrmGpgGradeMovement.id, input.movementId))

  return { ok: true }
}

export async function listGpgEmployeesWithActiveAssignmentsForOrg(
  organizationId: string
): Promise<
  ReadonlyArray<{
    employeeId: string
    employeeLabel: string
    assignmentId: string
    classificationId: string
    payGradeId: string
    step: number
  }>
> {
  const assignments = await db.query.hrmGpgEmployeeAssignment.findMany({
    where: and(
      eq(hrmGpgEmployeeAssignment.organizationId, organizationId),
      eq(hrmGpgEmployeeAssignment.state, "active"),
      isNull(hrmGpgEmployeeAssignment.effectiveTo)
    ),
  })
  if (assignments.length === 0) return []

  const employeeIds = [...new Set(assignments.map((row) => row.employeeId))]
  const employees = await db
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
    )

  const employeeMap = new Map(
    employees.map((row) => [row.id, formatEmployeeLabel(row)] as const)
  )

  return assignments.map((row) => ({
    employeeId: row.employeeId,
    employeeLabel: employeeMap.get(row.employeeId) ?? row.employeeId,
    assignmentId: row.id,
    classificationId: row.classificationId,
    payGradeId: row.payGradeId,
    step: row.step,
  }))
}

export async function listGpgPayGradesForClassification(
  organizationId: string,
  classificationId: string
) {
  const grades = await listGpgPayGradesForOrg(organizationId)
  return grades.filter((row) => row.classificationId === classificationId)
}
