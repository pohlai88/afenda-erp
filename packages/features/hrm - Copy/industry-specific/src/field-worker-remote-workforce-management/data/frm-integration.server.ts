import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmFrmAttendanceLink,
  hrmFrmFieldAssignment,
  hrmFrmPerDiemReference,
} from "@afenda/platform/db/schema"

import {
  getRemoteCheckinHoursForEmployeeDateRange,
  listVerifiedRemoteCheckinsForEmployeeDate,
} from "@afenda/feature-hrm-time-attendance/server"

export type ValidatedFieldAttendanceOutcome = {
  readonly employeeId: string
  readonly workDate: string
  readonly validated: boolean
  readonly worksiteValidated: boolean
  readonly locationVerificationOutcome: string | null
  readonly assignmentId: string | null
}

export type FieldWorkHourRef = {
  readonly employeeId: string
  readonly rangeStart: string
  readonly rangeEnd: string
  readonly workedMinutes: number
  readonly overtimeMinutes: number
}

export type FieldPayrollRef = {
  readonly employeeId: string
  readonly refKind: "per_diem" | "attendance"
  readonly refId: string
  readonly amount: string | null
  readonly currencyCode: string | null
  readonly eligibilityDate: string | null
}

/**
 * HRM-FRM-025 — validated field attendance for Leave & Attendance.
 */
export async function getValidatedFieldAttendanceForLeave(input: {
  organizationId: string
  employeeId: string
  workDate: string
}): Promise<ValidatedFieldAttendanceOutcome[]> {
  const assignment = await db.query.hrmFrmFieldAssignment.findFirst({
    where: and(
      eq(hrmFrmFieldAssignment.organizationId, input.organizationId),
      eq(hrmFrmFieldAssignment.employeeId, input.employeeId),
      eq(hrmFrmFieldAssignment.state, "active")
    ),
    columns: { id: true },
  })

  const links = await db.query.hrmFrmAttendanceLink.findMany({
    where: and(
      eq(hrmFrmAttendanceLink.organizationId, input.organizationId),
      eq(hrmFrmAttendanceLink.employeeId, input.employeeId)
    ),
  })

  const dayLinks = links.filter(
    (l) => l.capturedAt.toISOString().slice(0, 10) === input.workDate
  )

  if (dayLinks.length > 0) {
    return dayLinks.map((link) => ({
      employeeId: input.employeeId,
      workDate: input.workDate,
      validated:
        link.syncStatus === "synced" || link.syncStatus === "reconciled",
      worksiteValidated: link.worksiteValidated,
      locationVerificationOutcome: link.locationVerificationOutcome,
      assignmentId: link.assignmentId,
    }))
  }

  const geo = await listVerifiedRemoteCheckinsForEmployeeDate({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    attendanceDate: input.workDate,
  })

  return geo.map(
    (row: { readonly locationVerificationOutcome: string | null }) => ({
      employeeId: input.employeeId,
      workDate: input.workDate,
      validated: true,
      worksiteValidated: false,
      locationVerificationOutcome: row.locationVerificationOutcome,
      assignmentId: assignment?.id ?? null,
    })
  )
}

/**
 * HRM-FRM-026 — field work-hour references for Overtime Management.
 */
export async function getFieldWorkHourRefsForOvertime(input: {
  organizationId: string
  employeeId: string
  rangeStart: string
  rangeEnd: string
}): Promise<FieldWorkHourRef[]> {
  const hours = await getRemoteCheckinHoursForEmployeeDateRange({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    rangeStart: input.rangeStart,
    rangeEnd: input.rangeEnd,
  })

  if (hours.workedMinutes <= 0 && hours.overtimeMinutes <= 0) {
    return []
  }

  return [
    {
      employeeId: input.employeeId,
      rangeStart: input.rangeStart,
      rangeEnd: input.rangeEnd,
      workedMinutes: hours.workedMinutes,
      overtimeMinutes: hours.overtimeMinutes,
    },
  ]
}

/**
 * HRM-FRM-027 — payroll-relevant per diem + attendance references.
 */
export async function getFieldPayrollRefs(input: {
  organizationId: string
  employeeId: string
  rangeStart: string
  rangeEnd: string
}): Promise<FieldPayrollRef[]> {
  const refs: FieldPayrollRef[] = []

  const perDiem = await db.query.hrmFrmPerDiemReference.findMany({
    where: and(
      eq(hrmFrmPerDiemReference.organizationId, input.organizationId),
      eq(hrmFrmPerDiemReference.employeeId, input.employeeId),
      eq(hrmFrmPerDiemReference.state, "approved")
    ),
  })

  for (const row of perDiem) {
    if (
      row.eligibilityDate >= input.rangeStart &&
      row.eligibilityDate <= input.rangeEnd
    ) {
      refs.push({
        employeeId: input.employeeId,
        refKind: "per_diem",
        refId: row.id,
        amount: row.approvedAmount,
        currencyCode: row.currencyCode,
        eligibilityDate: row.eligibilityDate,
      })
    }
  }

  const links = await db.query.hrmFrmAttendanceLink.findMany({
    where: and(
      eq(hrmFrmAttendanceLink.organizationId, input.organizationId),
      eq(hrmFrmAttendanceLink.employeeId, input.employeeId)
    ),
  })

  for (const link of links) {
    const day = link.capturedAt.toISOString().slice(0, 10)
    if (day >= input.rangeStart && day <= input.rangeEnd) {
      refs.push({
        employeeId: input.employeeId,
        refKind: "attendance",
        refId: link.id,
        amount: null,
        currencyCode: null,
        eligibilityDate: day,
      })
    }
  }

  return refs
}

/** Slice 0 stubs — re-exported names from plan. */
export const getFieldAttendanceOutcomeForLeave =
  getValidatedFieldAttendanceForLeave
