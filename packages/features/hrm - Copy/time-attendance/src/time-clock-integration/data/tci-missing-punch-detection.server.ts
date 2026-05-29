import "server-only"

import { and, desc, eq, gte } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmAttendanceDay, hrmEmployee } from "@afenda/platform/db/schema"

import {
  detectMissingPunchesInDeviceEventSequence,
  extractMissingPunchCodesFromAttendanceSnapshot,
  type TciMissingPunchCode,
  type TciMissingPunchFinding,
} from "../tci-missing-punch-detection.shared"

import { listDevicePunchesForEmployeeDate } from "./tci-integration.server"

export const TCI_MISSING_PUNCH_FINDINGS_LIST_LIMIT = 50 as const
export const TCI_MISSING_PUNCH_KPI_LOOKBACK_DAYS = 7 as const
export const TCI_MISSING_PUNCH_FINDINGS_LOOKBACK_DAYS = 14 as const

export type TimeClockMissingPunchFindingRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
  readonly attendanceDate: string
  readonly codes: readonly TciMissingPunchCode[]
  readonly summary: string
}

function formatMissingPunchSummary(
  codes: readonly TciMissingPunchCode[]
): string {
  return codes.join(", ")
}

function startOfUtcDayOffset(daysAgo: number): Date {
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  start.setUTCDate(start.getUTCDate() - daysAgo)
  return start
}

export async function detectMissingPunchesForEmployeeDate(input: {
  organizationId: string
  employeeId: string
  attendanceDate: string
}): Promise<readonly TciMissingPunchFinding[]> {
  const punches = await listDevicePunchesForEmployeeDate(input)
  return detectMissingPunchesInDeviceEventSequence(
    punches.map((row) => ({
      eventType: row.eventType,
      occurredAt: row.occurredAt,
    }))
  )
}

export async function countMissingPunchDaysForOrgKpi(
  organizationId: string
): Promise<number> {
  const since = startOfUtcDayOffset(TCI_MISSING_PUNCH_KPI_LOOKBACK_DAYS)
  const rows = await db
    .select({
      calculationSnapshot: hrmAttendanceDay.calculationSnapshot,
    })
    .from(hrmAttendanceDay)
    .where(
      and(
        eq(hrmAttendanceDay.organizationId, organizationId),
        gte(hrmAttendanceDay.attendanceDate, since.toISOString().slice(0, 10))
      )
    )

  let count = 0
  for (const row of rows) {
    if (
      extractMissingPunchCodesFromAttendanceSnapshot(row.calculationSnapshot)
        .length > 0
    ) {
      count += 1
    }
  }
  return count
}

export async function listMissingPunchDayFindingsForOrg(
  organizationId: string,
  options?: { limit?: number }
): Promise<TimeClockMissingPunchFindingRow[]> {
  const limit = options?.limit ?? TCI_MISSING_PUNCH_FINDINGS_LIST_LIMIT
  const sinceDate = startOfUtcDayOffset(
    TCI_MISSING_PUNCH_FINDINGS_LOOKBACK_DAYS
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

  const findings: TimeClockMissingPunchFindingRow[] = []
  for (const row of rows) {
    const codes = extractMissingPunchCodesFromAttendanceSnapshot(
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
      summary: formatMissingPunchSummary(codes),
    })
    if (findings.length >= limit) break
  }
  return findings
}
