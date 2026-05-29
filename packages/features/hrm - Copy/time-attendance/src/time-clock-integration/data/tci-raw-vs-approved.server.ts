import "server-only"

import { and, desc, eq, gte, inArray, lte } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmAttendanceDay,
  hrmAttendanceEvent,
  hrmEmployee,
} from "@afenda/platform/db/schema"

import { TCI_ATTENDANCE_EVENT_DEVICE_SOURCE } from "../tci-clock-punch-capture.shared"
import {
  resolveTimeClockRawVsApprovedRelationship,
  type TciRawVsApprovedRelationship,
} from "../tci-raw-vs-approved.shared"

export const TCI_RAW_VS_APPROVED_FINDINGS_LIST_LIMIT = 50 as const

export const TCI_RAW_VS_APPROVED_LOOKBACK_DAYS = 14 as const

export type TimeClockRawVsApprovedRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
  readonly attendanceDate: string
  readonly latestOccurredAt: Date
  readonly devicePunchCount: number
  readonly lamDayState: string | null
  readonly workedMinutes: number | null
  readonly relationship: TciRawVsApprovedRelationship
}

type RawVsApprovedAggregate = {
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
  readonly attendanceDate: string
  readonly latestOccurredAt: Date
  readonly devicePunchCount: number
}

function rowId(employeeId: string, attendanceDate: string): string {
  return `${employeeId}:${attendanceDate}`
}

async function loadLamDayByEmployeeDate(
  organizationId: string,
  keys: readonly {
    readonly employeeId: string
    readonly attendanceDate: string
  }[]
): Promise<
  Map<string, { readonly state: string; readonly workedMinutes: number }>
> {
  const map = new Map<
    string,
    { readonly state: string; readonly workedMinutes: number }
  >()
  if (keys.length === 0) return map

  const employeeIds = [...new Set(keys.map((k) => k.employeeId))]
  const dates = [...new Set(keys.map((k) => k.attendanceDate))]

  const rows = await db
    .select({
      employeeId: hrmAttendanceDay.employeeId,
      attendanceDate: hrmAttendanceDay.attendanceDate,
      state: hrmAttendanceDay.state,
      workedMinutes: hrmAttendanceDay.workedMinutes,
    })
    .from(hrmAttendanceDay)
    .where(
      and(
        eq(hrmAttendanceDay.organizationId, organizationId),
        inArray(hrmAttendanceDay.employeeId, employeeIds),
        inArray(hrmAttendanceDay.attendanceDate, dates)
      )
    )

  for (const row of rows) {
    map.set(rowId(row.employeeId, row.attendanceDate), {
      state: row.state,
      workedMinutes: row.workedMinutes,
    })
  }

  return map
}

function aggregateDevicePunchDays(
  rows: readonly {
    readonly employeeId: string
    readonly employeeLegalName: string | null
    readonly employeeNumber: string | null
    readonly occurredAt: Date
  }[]
): RawVsApprovedAggregate[] {
  const byKey = new Map<string, RawVsApprovedAggregate>()

  for (const row of rows) {
    const attendanceDate = row.occurredAt.toISOString().slice(0, 10)
    const key = rowId(row.employeeId, attendanceDate)
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, {
        employeeId: row.employeeId,
        employeeLegalName: row.employeeLegalName,
        employeeNumber: row.employeeNumber,
        attendanceDate,
        latestOccurredAt: row.occurredAt,
        devicePunchCount: 1,
      })
      continue
    }
    byKey.set(key, {
      ...existing,
      latestOccurredAt:
        row.occurredAt > existing.latestOccurredAt
          ? row.occurredAt
          : existing.latestOccurredAt,
      devicePunchCount: existing.devicePunchCount + 1,
    })
  }

  return [...byKey.values()].sort(
    (a, b) => b.latestOccurredAt.getTime() - a.latestOccurredAt.getTime()
  )
}

function toRawVsApprovedRows(
  aggregates: readonly RawVsApprovedAggregate[],
  lamDays: Map<
    string,
    { readonly state: string; readonly workedMinutes: number }
  >
): TimeClockRawVsApprovedRow[] {
  return aggregates.map((agg) => {
    const lam = lamDays.get(rowId(agg.employeeId, agg.attendanceDate))
    const lamDayState = lam?.state ?? null
    return {
      id: rowId(agg.employeeId, agg.attendanceDate),
      employeeId: agg.employeeId,
      employeeLegalName: agg.employeeLegalName,
      employeeNumber: agg.employeeNumber,
      attendanceDate: agg.attendanceDate,
      latestOccurredAt: agg.latestOccurredAt,
      devicePunchCount: agg.devicePunchCount,
      lamDayState,
      workedMinutes: lam?.workedMinutes ?? null,
      relationship: resolveTimeClockRawVsApprovedRelationship({ lamDayState }),
    }
  })
}

export async function listRawVsApprovedFindingsForOrg(
  organizationId: string,
  options?: { limit?: number }
): Promise<TimeClockRawVsApprovedRow[]> {
  const limit = options?.limit ?? TCI_RAW_VS_APPROVED_FINDINGS_LIST_LIMIT
  const lookbackStart = new Date()
  lookbackStart.setUTCDate(
    lookbackStart.getUTCDate() - TCI_RAW_VS_APPROVED_LOOKBACK_DAYS
  )
  lookbackStart.setUTCHours(0, 0, 0, 0)

  const punchRows = await db
    .select({
      employeeId: hrmAttendanceEvent.employeeId,
      employeeLegalName: hrmEmployee.legalName,
      employeeNumber: hrmEmployee.employeeNumber,
      occurredAt: hrmAttendanceEvent.occurredAt,
    })
    .from(hrmAttendanceEvent)
    .innerJoin(hrmEmployee, eq(hrmAttendanceEvent.employeeId, hrmEmployee.id))
    .where(
      and(
        eq(hrmAttendanceEvent.organizationId, organizationId),
        eq(hrmAttendanceEvent.source, TCI_ATTENDANCE_EVENT_DEVICE_SOURCE),
        gte(hrmAttendanceEvent.occurredAt, lookbackStart)
      )
    )
    .orderBy(desc(hrmAttendanceEvent.occurredAt))
    .limit(400)

  const aggregates = aggregateDevicePunchDays(punchRows).slice(0, limit)
  const lamDays = await loadLamDayByEmployeeDate(
    organizationId,
    aggregates.map((a) => ({
      employeeId: a.employeeId,
      attendanceDate: a.attendanceDate,
    }))
  )

  return toRawVsApprovedRows(aggregates, lamDays)
}

export async function listRawVsApprovedFindingsForOrgInRange(
  organizationId: string,
  input: {
    readonly startDate: string
    readonly endDate: string
    readonly employeeId?: string
  }
): Promise<TimeClockRawVsApprovedRow[]> {
  const start = new Date(`${input.startDate}T00:00:00.000Z`)
  const end = new Date(`${input.endDate}T23:59:59.999Z`)

  const punchConditions = [
    eq(hrmAttendanceEvent.organizationId, organizationId),
    eq(hrmAttendanceEvent.source, TCI_ATTENDANCE_EVENT_DEVICE_SOURCE),
    gte(hrmAttendanceEvent.occurredAt, start),
    lte(hrmAttendanceEvent.occurredAt, end),
  ]
  if (input.employeeId) {
    punchConditions.push(eq(hrmAttendanceEvent.employeeId, input.employeeId))
  }

  const punchRows = await db
    .select({
      employeeId: hrmAttendanceEvent.employeeId,
      employeeLegalName: hrmEmployee.legalName,
      employeeNumber: hrmEmployee.employeeNumber,
      occurredAt: hrmAttendanceEvent.occurredAt,
    })
    .from(hrmAttendanceEvent)
    .innerJoin(hrmEmployee, eq(hrmAttendanceEvent.employeeId, hrmEmployee.id))
    .where(and(...punchConditions))
    .orderBy(desc(hrmAttendanceEvent.occurredAt))

  const aggregates = aggregateDevicePunchDays(punchRows)
  const lamDays = await loadLamDayByEmployeeDate(
    organizationId,
    aggregates.map((a) => ({
      employeeId: a.employeeId,
      attendanceDate: a.attendanceDate,
    }))
  )

  return toRawVsApprovedRows(aggregates, lamDays)
}
