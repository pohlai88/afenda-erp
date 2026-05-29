import "server-only"

import {
  listSftAttendanceReconcileRowsForOrg,
  listShiftPayrollReferencesForPeriod,
} from "@afenda/feature-hrm-time-attendance/server"

export type RwsAttendanceReconcileRow = Awaited<
  ReturnType<typeof listSftAttendanceReconcileRowsForOrg>
>[number]

export type RwsPayrollScheduleReferenceRow = Awaited<
  ReturnType<typeof listShiftPayrollReferencesForPeriod>
>[number]

export async function compareRwsScheduledVsAttendance(input: {
  organizationId: string
  employeeId: string
  rangeStart: string
  rangeEnd: string
}) {
  const rows = await listSftAttendanceReconcileRowsForOrg(input)
  return rows
    .filter((row) => row.employeeId === input.employeeId)
    .map((row) => ({
      employeeId: row.employeeId,
      attendanceDate: row.attendanceDate,
      scheduledMinutes: row.scheduledMinutes,
      actualMinutes: row.actualMinutes,
      varianceMinutes: row.varianceMinutes,
    }))
}

export async function listRwsAttendanceReconcileRowsForOrg(input: {
  organizationId: string
  rangeStart: string
  rangeEnd: string
}) {
  return listSftAttendanceReconcileRowsForOrg(input)
}

export async function listRwsPayrollScheduleReferences(input: {
  organizationId: string
  rangeStart: string
  rangeEnd: string
}): Promise<readonly RwsPayrollScheduleReferenceRow[]> {
  return listShiftPayrollReferencesForPeriod(input)
}
