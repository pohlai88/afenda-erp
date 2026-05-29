import "server-only"

import { and, desc, eq, gte, inArray, isNull, lte, or } from "drizzle-orm"

import { writeIamAuditEvent } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { HRM_GPG_AUDIT } from "../gpg.contract"
import {
  hrmGpgEmployeeAssignment,
  hrmGpgGradeMovement,
  hrmGpgLocalityRule,
  hrmGpgPayBand,
} from "@afenda/platform/db/schema"

import { listGpgAdjustmentReferencesForOrg } from "./gpg-locality.server"
import { computeGpgLocalityAdjustedPay } from "./gpg-locality-adjusted-pay.shared"
import { findGpgSalaryTableRowForGradeStep } from "./gpg-salary-tables.server"

export type GpgPayrollCompensationSnapshot = {
  readonly employeeId: string
  readonly asOfDate: string
  readonly classificationId: string | null
  readonly payGradeId: string | null
  readonly payBandId: string | null
  readonly step: number | null
  readonly baseRate: string | null
  readonly localityAdjustmentRef: string | null
  readonly allowanceRefs: readonly string[]
  readonly currencyCode: string | null
}

export type GpgGradeMovementLifecycleRef = {
  readonly movementId: string
  readonly movementType: string
  readonly effectiveDate: string
  readonly fromGradeId: string | null
  readonly toGradeId: string | null
  readonly fromStep: number | null
  readonly toStep: number | null
  readonly reason: string | null
}

/**
 * HRM-GPG-026 — payroll-ready compensation snapshot for an employee as of a date.
 */
export async function getGpgPayrollCompensationSnapshot(input: {
  organizationId: string
  employeeId: string
  asOfDate: string
  audit?: {
    actorUserId: string
    actorSessionId?: string | null
  }
}): Promise<GpgPayrollCompensationSnapshot | null> {
  const assignment = await db.query.hrmGpgEmployeeAssignment.findFirst({
    where: and(
      eq(hrmGpgEmployeeAssignment.organizationId, input.organizationId),
      eq(hrmGpgEmployeeAssignment.employeeId, input.employeeId),
      inArray(hrmGpgEmployeeAssignment.state, ["active", "ended"]),
      lte(hrmGpgEmployeeAssignment.effectiveFrom, input.asOfDate),
      or(
        isNull(hrmGpgEmployeeAssignment.effectiveTo),
        gte(hrmGpgEmployeeAssignment.effectiveTo, input.asOfDate)
      )
    ),
    orderBy: [desc(hrmGpgEmployeeAssignment.effectiveFrom)],
  })
  if (!assignment) return null

  let baseRate: string | null = null
  let currencyCode: string | null = null

  if (assignment.payBandId) {
    const band = await db.query.hrmGpgPayBand.findFirst({
      where: and(
        eq(hrmGpgPayBand.organizationId, input.organizationId),
        eq(hrmGpgPayBand.id, assignment.payBandId)
      ),
      columns: { currencyCode: true },
    })
    currencyCode = band?.currencyCode ?? null
  }

  if (assignment.salaryTableVersionId) {
    const salaryRow = await findGpgSalaryTableRowForGradeStep({
      organizationId: input.organizationId,
      tableVersionId: assignment.salaryTableVersionId,
      payGradeId: assignment.payGradeId,
      step: assignment.step,
    })
    if (salaryRow) {
      baseRate = salaryRow.baseRate
      currencyCode = salaryRow.currencyCode ?? currencyCode
    }
  }

  const [adjustments, localityRules] = await Promise.all([
    listGpgAdjustmentReferencesForOrg(input.organizationId),
    db.query.hrmGpgLocalityRule.findMany({
      where: eq(hrmGpgLocalityRule.organizationId, input.organizationId),
      columns: { id: true, adjustmentPercent: true },
    }),
  ])

  const localityPercentById = new Map(
    localityRules.map((row) => [row.id, row.adjustmentPercent] as const)
  )

  const employeeAdjustments = adjustments.filter(
    (ref) => ref.employeeId === input.employeeId
  )
  const allowanceRefs: string[] = []
  let localityPercent: string | null = null
  let supplementalPercent: string | null = null
  let supplementalAmount: string | null = null

  for (const ref of employeeAdjustments) {
    allowanceRefs.push(ref.id)
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

  const snapshot: GpgPayrollCompensationSnapshot = {
    employeeId: input.employeeId,
    asOfDate: input.asOfDate,
    classificationId: assignment.classificationId,
    payGradeId: assignment.payGradeId,
    payBandId: assignment.payBandId,
    step: assignment.step,
    baseRate,
    localityAdjustmentRef: adjusted?.adjustedRate ?? null,
    allowanceRefs,
    currencyCode,
  }

  if (input.audit) {
    await writeIamAuditEvent({
      action: HRM_GPG_AUDIT.payrollIntegrationRead,
      actorUserId: input.audit.actorUserId,
      actorSessionId: input.audit.actorSessionId ?? null,
      organizationId: input.organizationId,
      resourceType: "government_pay_grade",
      resourceId: input.employeeId,
      metadata: {
        asOfDate: input.asOfDate,
        payGradeId: snapshot.payGradeId,
        step: snapshot.step,
      },
    })
  }

  return snapshot
}

/**
 * HRM-GPG-027 — grade movement reference for Employee Lifecycle.
 */
export async function getGpgGradeMovementRefForLifecycle(input: {
  organizationId: string
  movementId: string
}): Promise<GpgGradeMovementLifecycleRef | null> {
  const row = await db.query.hrmGpgGradeMovement.findFirst({
    where: and(
      eq(hrmGpgGradeMovement.organizationId, input.organizationId),
      eq(hrmGpgGradeMovement.id, input.movementId),
      eq(hrmGpgGradeMovement.state, "applied")
    ),
  })
  if (!row) return null

  return {
    movementId: row.id,
    movementType: row.movementType,
    effectiveDate: row.effectiveDate,
    fromGradeId: row.fromPayGradeId,
    toGradeId: row.toPayGradeId,
    fromStep: row.fromStep,
    toStep: row.toStep,
    reason: row.reason,
  }
}
