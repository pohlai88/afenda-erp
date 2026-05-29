import "server-only"

import { and, eq, gte, lte } from "drizzle-orm"

import {
  detectShiftSchedulingConflicts,
  getOrCreateShiftSchedulingPolicy,
} from "@afenda/feature-hrm-time-attendance/server"
import { db } from "@afenda/platform/db"
import {
  hrmRwsPeriodAssignmentLink,
  hrmRwsRetailCoverageSlot,
  hrmShiftAssignment,
} from "@afenda/platform/db/schema"

import { compareCoverageSlots, countUnderstaffedSlots } from "./rws-coverage-compare.shared"
import { isScheduledLaborOverBudget } from "./rws-labor-metrics.shared"
import { summarizeRwsLaborMetricsForPeriod } from "./rws-labor-metrics.server"
import type { RwsCoverageGapRow, RwsPublishGuardIssue } from "./rws.types.shared"

export async function validateRwsPeriodPublish(input: {
  organizationId: string
  schedulePeriodId: string
  periodStartDate: string
  periodEndDate: string
}): Promise<
  | { ok: true; warnings: readonly RwsPublishGuardIssue[] }
  | { ok: false; form: string }
> {
  const warnings: RwsPublishGuardIssue[] = []
  const policy = await getOrCreateShiftSchedulingPolicy(input.organizationId)

  const coverageSlots = await db.query.hrmRwsRetailCoverageSlot.findMany({
    where: and(
      eq(hrmRwsRetailCoverageSlot.organizationId, input.organizationId),
      eq(hrmRwsRetailCoverageSlot.schedulePeriodId, input.schedulePeriodId)
    ),
  })

  const links = await db.query.hrmRwsPeriodAssignmentLink.findMany({
    where: eq(
      hrmRwsPeriodAssignmentLink.schedulePeriodId,
      input.schedulePeriodId
    ),
  })

  const assignmentIds = links.map((link) => link.shiftAssignmentId)
  const assignments =
    assignmentIds.length > 0
      ? await db.query.hrmShiftAssignment.findMany({
          where: and(
            eq(hrmShiftAssignment.organizationId, input.organizationId),
            gte(hrmShiftAssignment.attendanceDate, input.periodStartDate),
            lte(hrmShiftAssignment.attendanceDate, input.periodEndDate)
          ),
        })
      : []

  const scheduledBySlot = new Map<string, number>()
  for (const slot of coverageSlots) {
    const key = `${slot.slotDate}:${slot.hourOfDay}:${slot.retailRole}`
    scheduledBySlot.set(key, 0)
  }

  for (const assignment of assignments) {
    const date = assignment.attendanceDate
    const hour = new Date(assignment.scheduledStartAt).getUTCHours()
    for (const slot of coverageSlots) {
      if (
        slot.slotDate === date &&
        slot.hourOfDay === hour &&
        links.some(
          (l) =>
            l.shiftAssignmentId === assignment.id &&
            l.retailRole === slot.retailRole
        )
      ) {
        const key = `${slot.slotDate}:${slot.hourOfDay}:${slot.retailRole}`
        scheduledBySlot.set(key, (scheduledBySlot.get(key) ?? 0) + 1)
      }
    }
  }

  const gaps = compareCoverageSlots(
    coverageSlots.map((slot) => ({
      coverageSlotId: slot.id,
      slotDate: slot.slotDate,
      hourOfDay: slot.hourOfDay,
      retailRole: slot.retailRole as RwsCoverageGapRow["retailRole"],
      requiredHeadcount: slot.requiredHeadcount,
      scheduledHeadcount:
        scheduledBySlot.get(
          `${slot.slotDate}:${slot.hourOfDay}:${slot.retailRole}`
        ) ?? 0,
    }))
  )

  const understaffed = countUnderstaffedSlots(gaps)
  if (understaffed > 0) {
    warnings.push({
      code: "UNDERSTAFFED_COVERAGE",
      message: `${understaffed} coverage slot(s) are understaffed.`,
      severity: "warning",
    })
  }

  const labor = await summarizeRwsLaborMetricsForPeriod({
    organizationId: input.organizationId,
    schedulePeriodId: input.schedulePeriodId,
    periodStartDate: input.periodStartDate,
    periodEndDate: input.periodEndDate,
    canViewLaborCost: true,
  })
  if (isScheduledLaborOverBudget(labor.budgetVarianceAmount)) {
    return {
      ok: false,
      form: "Cannot publish: scheduled labor cost exceeds the approved budget snapshot.",
    }
  }
  if (
    labor.approvedBudgetAmount &&
    labor.scheduledCostAmount === null
  ) {
    warnings.push({
      code: "BUDGET_COST_HIDDEN",
      message:
        "A budget snapshot exists but labor cost could not be estimated for this publish check.",
      severity: "warning",
    })
  }
  if (labor.overtimeRiskCount > 0) {
    warnings.push({
      code: "OT_RISK",
      message: `${labor.overtimeRiskCount} assignment(s) may exceed weekly hour limits.`,
      severity: "warning",
    })
  }

  for (const assignment of assignments) {
    const conflicts = await detectShiftSchedulingConflicts({
      organizationId: input.organizationId,
      employeeId: assignment.employeeId,
      attendanceDate: assignment.attendanceDate,
      scheduledStartAt: assignment.scheduledStartAt,
      scheduledEndAt: assignment.scheduledEndAt,
      policy,
      excludeAssignmentId: assignment.id,
    })
    if (conflicts.length > 0) {
      return {
        ok: false,
        form: `Cannot publish: shift conflict for employee on ${assignment.attendanceDate}.`,
      }
    }
  }

  return { ok: true, warnings }
}
