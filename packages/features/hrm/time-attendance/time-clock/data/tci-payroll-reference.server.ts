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
  resolveTimeClockPayrollExposureStatus,
  type TciPayrollExposureStatus,
} from "../tci-payroll-reference.shared"

export const TCI_PAYROLL_REFERENCE_FINDINGS_LIST_LIMIT = 50 as const

export const TCI_PAYROLL_REFERENCE_LOOKBACK_DAYS = 14 as const

export type TimeClockPayrollReferenceRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
  readonly attendanceDate: string
  readonly latestOccurredAt: Date
  readonly devicePunchCount: number
  readonly workedMinutes: number | null
  readonly lamDayState: string | null
  readonly exposureStatus: TciPayrollExposureStatus
}

type PayrollAggregate = {
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

async function loadPayrollDaysByEmployeeDate(
  organizationId: string,
  keys: readonly {
    readonly employeeId: string
    readonly attendanceDate: string
  }[]
): Promise<
  Map<
    string,
    {
      readonly state: string
      readonly workedMinutes: number
      readonly calculationSnapshot: unknown | null
    }
  >
> {
  const map = new Map<
    string,
    {
      readonly state: string
      readonly workedMinutes: number
      readonly calculationSnapshot: unknown | null
    }
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
      calculationSnapshot: hrmAttendanceDay.calculationSnapshot,
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
      calculationSnapshot: row.calculationSnapshot,
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
): PayrollAggregate[] {
  const byKey = new Map<string, PayrollAggregate>()

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

function toPayrollReferenceRows(
  aggregates: readonly PayrollAggregate[],
  days: Map<
    string,
    {
      readonly state: string
      readonly workedMinutes: number
      readonly calculationSnapshot: unknown | null
    }
  >
): TimeClockPayrollReferenceRow[] {
  return aggregates.map((agg) => {
    const day = days.get(rowId(agg.employeeId, agg.attendanceDate))
    const lamDayState = day?.state ?? null
    const workedMinutes = day?.workedMinutes ?? null
    return {
      id: rowId(agg.employeeId, agg.attendanceDate),
      employeeId: agg.employeeId,
      employeeLegalName: agg.employeeLegalName,
      employeeNumber: agg.employeeNumber,
      attendanceDate: agg.attendanceDate,
      latestOccurredAt: agg.latestOccurredAt,
      devicePunchCount: agg.devicePunchCount,
      workedMinutes,
      lamDayState,
      exposureStatus: resolveTimeClockPayrollExposureStatus({
        lamDayState,
        calculationSnapshot: day?.calculationSnapshot ?? null,
      }),
    }
  })
}

export async function listPayrollReferenceRowsForOrg(
  organizationId: string,
  options?: { limit?: number }
): Promise<TimeClockPayrollReferenceRow[]> {
  const limit = options?.limit ?? TCI_PAYROLL_REFERENCE_FINDINGS_LIST_LIMIT
  const lookbackStart = new Date()
  lookbackStart.setUTCDate(
    lookbackStart.getUTCDate() - TCI_PAYROLL_REFERENCE_LOOKBACK_DAYS
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
  const days = await loadPayrollDaysByEmployeeDate(
    organizationId,
    aggregates.map((a) => ({
      employeeId: a.employeeId,
      attendanceDate: a.attendanceDate,
    }))
  )

  return toPayrollReferenceRows(aggregates, days)
}

export async function listPayrollReferenceRowsForOrgInRange(
  organizationId: string,
  input: {
    readonly startDate: string
    readonly endDate: string
    readonly employeeId?: string
  }
): Promise<TimeClockPayrollReferenceRow[]> {
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
  const days = await loadPayrollDaysByEmployeeDate(
    organizationId,
    aggregates.map((a) => ({
      employeeId: a.employeeId,
      attendanceDate: a.attendanceDate,
    }))
  )

  return toPayrollReferenceRows(aggregates, days)
}

export async function countPayrollReadyDaysTodayForOrg(
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
    const id = rowId(punch.employeeId, attendanceDate)
    if (!keys.has(id)) {
      keys.set(id, { employeeId: punch.employeeId, attendanceDate })
    }
  }

  if (keys.size === 0) return 0

  const days = await loadPayrollDaysByEmployeeDate(organizationId, [
    ...keys.values(),
  ])
  let ready = 0
  for (const key of keys.keys()) {
    const day = days.get(key)
    if (!day) continue
    const status = resolveTimeClockPayrollExposureStatus({
      lamDayState: day.state,
      calculationSnapshot: day.calculationSnapshot,
    })
    if (status === "payroll_ready") ready += 1
  }
  return ready
}
