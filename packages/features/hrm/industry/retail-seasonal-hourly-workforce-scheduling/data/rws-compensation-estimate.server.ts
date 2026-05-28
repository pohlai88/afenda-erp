import "server-only"

import { and, eq, inArray, isNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmEmploymentContract } from "@afenda/platform/db/schema"

const HOURS_PER_MONTH = 173.33
const HOURS_PER_WEEK = 40
const HOURS_PER_DAY = 8

/** Fallback when no active contract base salary exists (HRM-RWS-022 estimate only). */
export const RWS_DEFAULT_HOURLY_RATE = "15.00"

export function estimateHourlyRateFromContract(input: {
  payFrequency: string
  baseSalaryAmount: string | null
}): number | null {
  if (!input.baseSalaryAmount) return null
  const amount = Number.parseFloat(input.baseSalaryAmount)
  if (!Number.isFinite(amount) || amount <= 0) return null

  switch (input.payFrequency) {
    case "hourly":
      return amount
    case "daily":
      return amount / HOURS_PER_DAY
    case "weekly":
      return amount / HOURS_PER_WEEK
    case "monthly":
    case "semi_monthly":
    case "biweekly":
      return amount / HOURS_PER_MONTH
    default:
      return amount / HOURS_PER_MONTH
  }
}

export async function resolveRwsEmployeeHourlyRates(input: {
  organizationId: string
  employeeIds: readonly string[]
}): Promise<Map<string, number>> {
  const uniqueIds = [...new Set(input.employeeIds)]
  if (uniqueIds.length === 0) return new Map()

  const rows = await db
    .select({
      employeeId: hrmEmploymentContract.employeeId,
      payFrequency: hrmEmploymentContract.payFrequency,
      baseSalaryAmount: hrmEmploymentContract.baseSalaryAmount,
    })
    .from(hrmEmploymentContract)
    .where(
      and(
        eq(hrmEmploymentContract.organizationId, input.organizationId),
        inArray(hrmEmploymentContract.employeeId, uniqueIds),
        eq(hrmEmploymentContract.state, "active"),
        isNull(hrmEmploymentContract.effectiveTo)
      )
    )

  const rates = new Map<string, number>()
  for (const row of rows) {
    const hourly = estimateHourlyRateFromContract({
      payFrequency: row.payFrequency,
      baseSalaryAmount: row.baseSalaryAmount,
    })
    if (hourly != null) {
      rates.set(row.employeeId, hourly)
    }
  }
  return rates
}

export function sumScheduledLaborCostFromRates(input: {
  assignments: readonly {
    employeeId: string
    scheduledMinutes: number
  }[]
  hourlyRates: ReadonlyMap<string, number>
  fallbackHourlyRate: number
}): string {
  let total = 0
  for (const assignment of input.assignments) {
    const hours = assignment.scheduledMinutes / 60
    const rate =
      input.hourlyRates.get(assignment.employeeId) ?? input.fallbackHourlyRate
    total += hours * rate
  }
  return total.toFixed(2)
}
