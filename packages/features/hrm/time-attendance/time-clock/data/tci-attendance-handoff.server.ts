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
  resolveTimeClockLamExposureStatus,
  type TciLamExposureStatus,
} from "../tci-attendance-handoff.shared"

export const TCI_ATTENDANCE_HANDOFF_FINDINGS_LIST_LIMIT = 50 as const

export const TCI_ATTENDANCE_HANDOFF_LOOKBACK_DAYS = 14 as const

export type TimeClockAttendanceHandoffRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
  readonly attendanceDate: string
  readonly latestOccurredAt: Date
  readonly devicePunchCount: number
  readonly lamDayState: string | null
  readonly workedMinutes: number | null
  readonly exposureStatus: TciLamExposureStatus
}

type HandoffAggregate = {
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
  readonly attendanceDate: string
  readonly latestOccurredAt: Date
  readonly devicePunchCount: number
}

function handoffRowId(employeeId: string, attendanceDate: string): string {
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
    map.set(handoffRowId(row.employeeId, row.attendanceDate), {
      state: row.state,
      workedMinutes: row.workedMinutes,
    })
  }

  return map
}

function aggregateDevicePunchHandoffs(
  rows: readonly {
    readonly employeeId: string
    readonly employeeLegalName: string | null
    readonly employeeNumber: string | null
    readonly occurredAt: Date
  }[]
): HandoffAggregate[] {
  const byKey = new Map<string, HandoffAggregate>()

  for (const row of rows) {
    const attendanceDate = row.occurredAt.toISOString().slice(0, 10)
    const key = handoffRowId(row.employeeId, attendanceDate)
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

function toHandoffRows(
  aggregates: readonly HandoffAggregate[],
  lamDays: Map<
    string,
    { readonly state: string; readonly workedMinutes: number }
  >
): TimeClockAttendanceHandoffRow[] {
  return aggregates.map((agg) => {
    const lam = lamDays.get(handoffRowId(agg.employeeId, agg.attendanceDate))
    const lamDayState = lam?.state ?? null
    return {
      id: handoffRowId(agg.employeeId, agg.attendanceDate),
      employeeId: agg.employeeId,
      employeeLegalName: agg.employeeLegalName,
      employeeNumber: agg.employeeNumber,
      attendanceDate: agg.attendanceDate,
      latestOccurredAt: agg.latestOccurredAt,
      devicePunchCount: agg.devicePunchCount,
      lamDayState,
      workedMinutes: lam?.workedMinutes ?? null,
      exposureStatus: resolveTimeClockLamExposureStatus({ lamDayState }),
    }
  })
}

export async function listAttendanceHandoffRowsForOrg(
  organizationId: string,
  options?: { limit?: number }
): Promise<TimeClockAttendanceHandoffRow[]> {
  const limit = options?.limit ?? TCI_ATTENDANCE_HANDOFF_FINDINGS_LIST_LIMIT
  const lookbackStart = new Date()
  lookbackStart.setUTCDate(
    lookbackStart.getUTCDate() - TCI_ATTENDANCE_HANDOFF_LOOKBACK_DAYS
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

  const aggregates = aggregateDevicePunchHandoffs(punchRows).slice(0, limit)
  const lamDays = await loadLamDayByEmployeeDate(
    organizationId,
    aggregates.map((a) => ({
      employeeId: a.employeeId,
      attendanceDate: a.attendanceDate,
    }))
  )

  return toHandoffRows(aggregates, lamDays)
}

export async function listAttendanceHandoffRowsForOrgInRange(
  organizationId: string,
  input: {
    readonly startDate: string
    readonly endDate: string
    readonly employeeId?: string
  }
): Promise<TimeClockAttendanceHandoffRow[]> {
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

  const aggregates = aggregateDevicePunchHandoffs(punchRows)
  const lamDays = await loadLamDayByEmployeeDate(
    organizationId,
    aggregates.map((a) => ({
      employeeId: a.employeeId,
      attendanceDate: a.attendanceDate,
    }))
  )

  return toHandoffRows(aggregates, lamDays)
}

export async function countLamExposedHandoffsTodayForOrg(
  organizationId: string
): Promise<number> {
  const startOfDay = new Date()
  startOfDay.setUTCHours(0, 0, 0, 0)

  const punchRows = await db
    .select({
      employeeId: hrmAttendanceEvent.employeeId,
      occurredAt: hrmAttendanceEvent.occurredAt,
    })
    .from(hrmAttendanceEvent)
    .where(
      and(
        eq(hrmAttendanceEvent.organizationId, organizationId),
        eq(hrmAttendanceEvent.source, TCI_ATTENDANCE_EVENT_DEVICE_SOURCE),
        gte(hrmAttendanceEvent.occurredAt, startOfDay)
      )
    )

  const keys = new Map<string, { employeeId: string; attendanceDate: string }>()
  for (const punch of punchRows) {
    const attendanceDate = punch.occurredAt.toISOString().slice(0, 10)
    const id = handoffRowId(punch.employeeId, attendanceDate)
    if (!keys.has(id)) {
      keys.set(id, { employeeId: punch.employeeId, attendanceDate })
    }
  }

  if (keys.size === 0) return 0

  const lamDays = await loadLamDayByEmployeeDate(organizationId, [
    ...keys.values(),
  ])
  let exposed = 0
  for (const key of keys.keys()) {
    if (lamDays.has(key)) exposed += 1
  }
  return exposed
}
