import "server-only"

import { and, eq, gte, lte } from "drizzle-orm"

import {
  detectShiftSchedulingConflicts,
  getOrCreateShiftSchedulingPolicy,
  listShiftPayrollReferencesForPeriod,
} from "../../../time-attendance/server"
import { scheduledMinutesBetween } from "../../../time-attendance/server"
import { db } from "@afenda/platform/db"
import {
  hrmRwsLaborBudgetSnapshot,
  hrmRwsPeriodAssignmentLink,
  hrmShiftAssignment,
} from "@afenda/platform/db/schema"

import {
  RWS_DEFAULT_HOURLY_RATE,
  resolveRwsEmployeeHourlyRates,
  sumScheduledLaborCostFromRates,
} from "./rws-compensation-estimate.server"
import {
  formatBudgetVariance,
  sumScheduledMinutes,
} from "./rws-labor-metrics.shared"
import type { RwsLaborMetricsSummary } from "./rws.types.shared"

export async function summarizeRwsLaborMetricsForPeriod(input: {
  organizationId: string
  schedulePeriodId: string
  periodStartDate: string
  periodEndDate: string
  canViewLaborCost: boolean
}): Promise<RwsLaborMetricsSummary> {
  const links = await db.query.hrmRwsPeriodAssignmentLink.findMany({
    where: eq(
      hrmRwsPeriodAssignmentLink.schedulePeriodId,
      input.schedulePeriodId,
    ),
  })
  const assignmentIds = new Set(links.map((l) => l.shiftAssignmentId))

  const assignments = await db.query.hrmShiftAssignment.findMany({
    where: and(
      eq(hrmShiftAssignment.organizationId, input.organizationId),
      gte(hrmShiftAssignment.attendanceDate, input.periodStartDate),
      lte(hrmShiftAssignment.attendanceDate, input.periodEndDate),
    ),
  })

  const periodAssignments = assignments.filter((row) =>
    assignmentIds.has(row.id),
  )

  const scheduledMinutes = sumScheduledMinutes(
    periodAssignments.map((row) => ({
      scheduledMinutes: scheduledMinutesBetween(
        row.scheduledStartAt,
        row.scheduledEndAt,
      ),
    })),
  )

  let scheduledCostAmount: string | null = null
  if (input.canViewLaborCost) {
    const hourlyRates = await resolveRwsEmployeeHourlyRates({
      organizationId: input.organizationId,
      employeeIds: periodAssignments.map((row) => row.employeeId),
    })
    scheduledCostAmount = sumScheduledLaborCostFromRates({
      assignments: periodAssignments.map((row) => ({
        employeeId: row.employeeId,
        scheduledMinutes: scheduledMinutesBetween(
          row.scheduledStartAt,
          row.scheduledEndAt,
        ),
      })),
      hourlyRates,
      fallbackHourlyRate: Number.parseFloat(RWS_DEFAULT_HOURLY_RATE),
    })
  }

  const budget = await db.query.hrmRwsLaborBudgetSnapshot.findFirst({
    where: eq(
      hrmRwsLaborBudgetSnapshot.schedulePeriodId,
      input.schedulePeriodId,
    ),
  })

  const approvedBudgetAmount = budget?.approvedBudgetAmount ?? null
  const budgetVarianceAmount = input.canViewLaborCost
    ? formatBudgetVariance(scheduledCostAmount, approvedBudgetAmount)
    : null

  const policy = await getOrCreateShiftSchedulingPolicy(input.organizationId)
  let overtimeRiskCount = 0
  for (const assignment of periodAssignments) {
    const conflicts = await detectShiftSchedulingConflicts({
      organizationId: input.organizationId,
      employeeId: assignment.employeeId,
      attendanceDate: assignment.attendanceDate,
      scheduledStartAt: assignment.scheduledStartAt,
      scheduledEndAt: assignment.scheduledEndAt,
      policy,
      excludeAssignmentId: assignment.id,
    })
    if (
      conflicts.some(
        (c: { readonly kind: string }) => c.kind === "weekly_hours_exceeded",
      )
    ) {
      overtimeRiskCount += 1
    }
  }

  return {
    scheduledMinutes,
    scheduledCostAmount,
    approvedBudgetAmount,
    budgetVarianceAmount,
    overtimeRiskCount,
  }
}

export async function listRwsPayrollScheduleReferences(input: {
  organizationId: string
  rangeStart: string
  rangeEnd: string
}) {
  return listShiftPayrollReferencesForPeriod(input)
}
