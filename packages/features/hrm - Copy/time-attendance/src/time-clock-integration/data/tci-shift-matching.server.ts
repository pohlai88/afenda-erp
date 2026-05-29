import "server-only"

import { and, desc, eq, gte, inArray, lte } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmAttendanceEvent,
  hrmEmployee,
  hrmShiftAssignment,
  hrmTimeClockDevice,
} from "@afenda/platform/db/schema"

import { TCI_ATTENDANCE_EVENT_DEVICE_SOURCE } from "../tci-clock-punch-capture.shared"
import { TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES } from "../schemas/tci-workflow-state.shared"
import {
  resolveTimeClockShiftMatchStatus,
  type TciShiftAssignmentWindow,
  type TciShiftMatchStatus,
} from "../tci-shift-matching.shared"

export const TCI_SHIFT_MATCH_FINDINGS_LIST_LIMIT = 50 as const

export type TimeClockShiftMatchRow = {
  readonly id: string
  readonly employeeId: string
  readonly employeeLegalName: string | null
  readonly employeeNumber: string | null
  readonly eventType: string
  readonly occurredAt: Date
  readonly attendanceDate: string
  readonly matchStatus: TciShiftMatchStatus
  readonly scheduledStartAt: Date | null
  readonly scheduledEndAt: Date | null
  readonly shiftWindowLabel: string
}

function formatShiftWindowLabel(
  shift: TciShiftAssignmentWindow | null
): string {
  if (!shift) return "—"
  const start = shift.scheduledStartAt.toISOString().slice(11, 16)
  const end = shift.scheduledEndAt.toISOString().slice(11, 16)
  return `${start}–${end} UTC`
}

export async function findShiftAssignmentForTimeClockPunch(input: {
  organizationId: string
  employeeId: string
  attendanceDate: string
}): Promise<TciShiftAssignmentWindow | null> {
  const row = await db.query.hrmShiftAssignment.findFirst({
    where: and(
      eq(hrmShiftAssignment.organizationId, input.organizationId),
      eq(hrmShiftAssignment.employeeId, input.employeeId),
      eq(hrmShiftAssignment.attendanceDate, input.attendanceDate)
    ),
    columns: {
      scheduledStartAt: true,
      scheduledEndAt: true,
    },
  })
  if (!row) return null
  return {
    scheduledStartAt: row.scheduledStartAt,
    scheduledEndAt: row.scheduledEndAt,
  }
}

export async function countShiftEvaluatedPunchesTodayForOrg(
  organizationId: string
): Promise<number> {
  const startOfDay = new Date()
  startOfDay.setUTCHours(0, 0, 0, 0)

  const punches = await db
    .select({
      employeeId: hrmAttendanceEvent.employeeId,
      occurredAt: hrmAttendanceEvent.occurredAt,
    })
    .from(hrmAttendanceEvent)
    .where(
      and(
        eq(hrmAttendanceEvent.organizationId, organizationId),
        eq(hrmAttendanceEvent.source, TCI_ATTENDANCE_EVENT_DEVICE_SOURCE),
        inArray(hrmAttendanceEvent.eventType, [
          ...TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES,
        ]),
        gte(hrmAttendanceEvent.occurredAt, startOfDay)
      )
    )

  let count = 0
  const assignmentCache = new Map<string, TciShiftAssignmentWindow | null>()

  for (const punch of punches) {
    const attendanceDate = punch.occurredAt.toISOString().slice(0, 10)
    const cacheKey = `${punch.employeeId}:${attendanceDate}`
    let shift = assignmentCache.get(cacheKey)
    if (shift === undefined) {
      shift = await findShiftAssignmentForTimeClockPunch({
        organizationId,
        employeeId: punch.employeeId,
        attendanceDate,
      })
      assignmentCache.set(cacheKey, shift)
    }
    if (shift) count += 1
  }
  return count
}

export async function listShiftMatchRowsForOrg(
  organizationId: string,
  options?: { limit?: number }
): Promise<TimeClockShiftMatchRow[]> {
  const limit = options?.limit ?? TCI_SHIFT_MATCH_FINDINGS_LIST_LIMIT
  const rows = await db
    .select({
      id: hrmAttendanceEvent.id,
      employeeId: hrmAttendanceEvent.employeeId,
      employeeLegalName: hrmEmployee.legalName,
      employeeNumber: hrmEmployee.employeeNumber,
      eventType: hrmAttendanceEvent.eventType,
      occurredAt: hrmAttendanceEvent.occurredAt,
    })
    .from(hrmAttendanceEvent)
    .innerJoin(hrmEmployee, eq(hrmAttendanceEvent.employeeId, hrmEmployee.id))
    .leftJoin(
      hrmTimeClockDevice,
      eq(hrmAttendanceEvent.deviceId, hrmTimeClockDevice.id)
    )
    .where(
      and(
        eq(hrmAttendanceEvent.organizationId, organizationId),
        eq(hrmAttendanceEvent.source, TCI_ATTENDANCE_EVENT_DEVICE_SOURCE),
        inArray(hrmAttendanceEvent.eventType, [
          ...TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES,
        ])
      )
    )
    .orderBy(desc(hrmAttendanceEvent.occurredAt))
    .limit(limit)

  const findings: TimeClockShiftMatchRow[] = []
  const assignmentCache = new Map<string, TciShiftAssignmentWindow | null>()

  for (const row of rows) {
    const attendanceDate = row.occurredAt.toISOString().slice(0, 10)
    const cacheKey = `${row.employeeId}:${attendanceDate}`
    let shift = assignmentCache.get(cacheKey)
    if (shift === undefined) {
      shift = await findShiftAssignmentForTimeClockPunch({
        organizationId,
        employeeId: row.employeeId,
        attendanceDate,
      })
      assignmentCache.set(cacheKey, shift)
    }
    const matchStatus = resolveTimeClockShiftMatchStatus({
      occurredAt: row.occurredAt,
      shift,
    })
    findings.push({
      id: row.id,
      employeeId: row.employeeId,
      employeeLegalName: row.employeeLegalName,
      employeeNumber: row.employeeNumber,
      eventType: row.eventType,
      occurredAt: row.occurredAt,
      attendanceDate,
      matchStatus,
      scheduledStartAt: shift?.scheduledStartAt ?? null,
      scheduledEndAt: shift?.scheduledEndAt ?? null,
      shiftWindowLabel: formatShiftWindowLabel(shift),
    })
  }
  return findings
}

export async function listShiftMatchRowsForOrgInRange(
  organizationId: string,
  input: {
    startDate: string
    endDate: string
    employeeId?: string
  }
): Promise<TimeClockShiftMatchRow[]> {
  const start = new Date(`${input.startDate}T00:00:00.000Z`)
  const end = new Date(`${input.endDate}T23:59:59.999Z`)
  const conditions = [
    eq(hrmAttendanceEvent.organizationId, organizationId),
    eq(hrmAttendanceEvent.source, TCI_ATTENDANCE_EVENT_DEVICE_SOURCE),
    inArray(hrmAttendanceEvent.eventType, [
      ...TCI_CLOCK_IN_OUT_PUNCH_EVENT_TYPES,
    ]),
    gte(hrmAttendanceEvent.occurredAt, start),
    lte(hrmAttendanceEvent.occurredAt, end),
  ]
  if (input.employeeId) {
    conditions.push(eq(hrmAttendanceEvent.employeeId, input.employeeId))
  }

  const rows = await db
    .select({
      id: hrmAttendanceEvent.id,
      employeeId: hrmAttendanceEvent.employeeId,
      employeeLegalName: hrmEmployee.legalName,
      employeeNumber: hrmEmployee.employeeNumber,
      eventType: hrmAttendanceEvent.eventType,
      occurredAt: hrmAttendanceEvent.occurredAt,
    })
    .from(hrmAttendanceEvent)
    .innerJoin(hrmEmployee, eq(hrmAttendanceEvent.employeeId, hrmEmployee.id))
    .where(and(...conditions))
    .orderBy(desc(hrmAttendanceEvent.occurredAt))

  const findings: TimeClockShiftMatchRow[] = []
  const assignmentCache = new Map<string, TciShiftAssignmentWindow | null>()

  for (const row of rows) {
    const attendanceDate = row.occurredAt.toISOString().slice(0, 10)
    const cacheKey = `${row.employeeId}:${attendanceDate}`
    let shift = assignmentCache.get(cacheKey)
    if (shift === undefined) {
      shift = await findShiftAssignmentForTimeClockPunch({
        organizationId,
        employeeId: row.employeeId,
        attendanceDate,
      })
      assignmentCache.set(cacheKey, shift)
    }
    const matchStatus = resolveTimeClockShiftMatchStatus({
      occurredAt: row.occurredAt,
      shift,
    })
    findings.push({
      id: row.id,
      employeeId: row.employeeId,
      employeeLegalName: row.employeeLegalName,
      employeeNumber: row.employeeNumber,
      eventType: row.eventType,
      occurredAt: row.occurredAt,
      attendanceDate,
      matchStatus,
      scheduledStartAt: shift?.scheduledStartAt ?? null,
      scheduledEndAt: shift?.scheduledEndAt ?? null,
      shiftWindowLabel: formatShiftWindowLabel(shift),
    })
  }
  return findings
}
