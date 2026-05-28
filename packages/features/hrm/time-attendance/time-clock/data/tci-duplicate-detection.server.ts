import "server-only"

import { and, desc, eq, gte } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmAttendanceDay,
  hrmEmployee,
  hrmTimeClockPunchException,
} from "@afenda/platform/db/schema"

import {
  detectDuplicatePunchesInDeviceEventSequence,
  extractDuplicatePunchCodesFromAttendanceSnapshot,
  isTciDuplicatePunchDetectionOutcome,
  type TciDuplicatePunchFinding,
  type TciDuplicateSequenceCode,
} from "../tci-duplicate-detection.shared"

import { listDevicePunchesForEmployeeDate } from "./tci-integration.server"

export const TCI_DUPLICATE_PUNCH_FINDINGS_LIST_LIMIT = 50 as const
export const TCI_DUPLICATE_PUNCH_KPI_LOOKBACK_DAYS = 7 as const
export const TCI_DUPLICATE_PUNCH_FINDINGS_LOOKBACK_DAYS = 14 as const

export type TimeClockDuplicatePunchFindingRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
  readonly attendanceDate: string
  readonly codes: readonly TciDuplicateSequenceCode[]
  readonly summary: string
}

function formatDuplicateSummary(
  codes: readonly TciDuplicateSequenceCode[]
): string {
  return codes.join(", ")
}

function startOfUtcDayOffset(daysAgo: number): Date {
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  start.setUTCDate(start.getUTCDate() - daysAgo)
  return start
}

export async function detectDuplicatePunchesForEmployeeDate(input: {
  organizationId: string
  employeeId: string
  attendanceDate: string
}): Promise<readonly TciDuplicatePunchFinding[]> {
  const punches = await listDevicePunchesForEmployeeDate(input)
  return detectDuplicatePunchesInDeviceEventSequence(
    punches.map((row) => ({
      eventType: row.eventType,
      occurredAt: row.occurredAt,
    }))
  )
}

export async function countSubmittedDuplicatePunchExceptionsForOrg(
  organizationId: string
): Promise<number> {
  const rows = await db
    .select({ id: hrmTimeClockPunchException.id })
    .from(hrmTimeClockPunchException)
    .where(
      and(
        eq(hrmTimeClockPunchException.organizationId, organizationId),
        eq(hrmTimeClockPunchException.state, "submitted"),
        eq(hrmTimeClockPunchException.detectionOutcome, "duplicate_punch")
      )
    )
  return rows.length
}

export async function countDuplicatePunchDaysForOrgKpi(
  organizationId: string
): Promise<number> {
  const sinceDate = startOfUtcDayOffset(TCI_DUPLICATE_PUNCH_KPI_LOOKBACK_DAYS)
    .toISOString()
    .slice(0, 10)

  const rows = await db
    .select({
      calculationSnapshot: hrmAttendanceDay.calculationSnapshot,
    })
    .from(hrmAttendanceDay)
    .where(
      and(
        eq(hrmAttendanceDay.organizationId, organizationId),
        gte(hrmAttendanceDay.attendanceDate, sinceDate)
      )
    )

  let count = 0
  for (const row of rows) {
    if (
      extractDuplicatePunchCodesFromAttendanceSnapshot(row.calculationSnapshot)
        .length > 0
    ) {
      count += 1
    }
  }
  return count
}

export async function listDuplicatePunchDayFindingsForOrg(
  organizationId: string,
  options?: { limit?: number }
): Promise<TimeClockDuplicatePunchFindingRow[]> {
  const limit = options?.limit ?? TCI_DUPLICATE_PUNCH_FINDINGS_LIST_LIMIT
  const sinceDate = startOfUtcDayOffset(
    TCI_DUPLICATE_PUNCH_FINDINGS_LOOKBACK_DAYS
  )
    .toISOString()
    .slice(0, 10)

  const rows = await db
    .select({
      employeeId: hrmAttendanceDay.employeeId,
      attendanceDate: hrmAttendanceDay.attendanceDate,
      calculationSnapshot: hrmAttendanceDay.calculationSnapshot,
      employeeLegalName: hrmEmployee.legalName,
      employeeNumber: hrmEmployee.employeeNumber,
    })
    .from(hrmAttendanceDay)
    .innerJoin(hrmEmployee, eq(hrmAttendanceDay.employeeId, hrmEmployee.id))
    .where(
      and(
        eq(hrmAttendanceDay.organizationId, organizationId),
        gte(hrmAttendanceDay.attendanceDate, sinceDate)
      )
    )
    .orderBy(desc(hrmAttendanceDay.attendanceDate))
    .limit(limit * 4)

  const findings: TimeClockDuplicatePunchFindingRow[] = []
  for (const row of rows) {
    const codes = extractDuplicatePunchCodesFromAttendanceSnapshot(
      row.calculationSnapshot
    )
    if (codes.length === 0) continue
    findings.push({
      id: `${row.employeeId}:${row.attendanceDate}`,
      employeeId: row.employeeId,
      employeeLegalName: row.employeeLegalName,
      employeeNumber: row.employeeNumber,
      attendanceDate: row.attendanceDate,
      codes,
      summary: formatDuplicateSummary(codes),
    })
    if (findings.length >= limit) break
  }
  return findings
}

/** Used by KPI aggregation — keeps detection outcome typing centralized. */
export function isDuplicatePunchExceptionOutcome(outcome: string): boolean {
  return isTciDuplicatePunchDetectionOutcome(outcome)
}
