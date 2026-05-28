import "server-only"

import { and, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmAttendanceEvent,
  hrmFrmAttendanceLink,
  hrmFrmFieldAssignment,
  hrmFrmWorksite,
} from "@afenda/platform/db/schema"

import { listVerifiedRemoteCheckinsForEmployeeDate } from "../../../time-attendance/server"
import { HRM_FRM_AUDIT } from "../frm.contract"
import { revalidateFrmSurfaces } from "./frm-revalidate.server"
import { detectFrmExceptionsForOrg } from "./frm-exceptions.server"

export async function linkFrmAttendanceFromGeolocationEvent(input: {
  organizationId: string
  userId: string
  assignmentId: string
  attendanceEventId: string
  eventKind: "clock_in" | "clock_out" | "break_start" | "break_end"
  locationVerificationOutcome: string | null
}): Promise<{ ok: true; linkId: string } | { ok: false; form?: string }> {
  const assignment = await db.query.hrmFrmFieldAssignment.findFirst({
    where: and(
      eq(hrmFrmFieldAssignment.id, input.assignmentId),
      eq(hrmFrmFieldAssignment.organizationId, input.organizationId)
    ),
  })
  if (!assignment) {
    return { ok: false, form: "Field assignment not found." }
  }

  const event = await db.query.hrmAttendanceEvent.findFirst({
    where: and(
      eq(hrmAttendanceEvent.id, input.attendanceEventId),
      eq(hrmAttendanceEvent.organizationId, input.organizationId)
    ),
    columns: { id: true, employeeId: true, occurredAt: true },
  })
  if (!event || event.employeeId !== assignment.employeeId) {
    return {
      ok: false,
      form: "Attendance event does not match assignment employee.",
    }
  }

  const worksite = await db.query.hrmFrmWorksite.findFirst({
    where: eq(hrmFrmWorksite.id, assignment.worksiteId),
    columns: { approvedRemote: true, active: true },
  })

  const worksiteValidated = Boolean(worksite?.active)

  const id = crypto.randomUUID()
  await db.insert(hrmFrmAttendanceLink).values({
    id,
    organizationId: input.organizationId,
    assignmentId: input.assignmentId,
    employeeId: assignment.employeeId,
    eventKind: input.eventKind,
    capturedAt: event.occurredAt,
    attendanceEventId: input.attendanceEventId,
    syncStatus: "synced",
    locationVerificationOutcome: input.locationVerificationOutcome,
    worksiteValidated,
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FRM_AUDIT.attendanceLinkCreate,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "field_workforce_attendance_link",
    resourceId: id,
    metadata: {
      assignmentId: input.assignmentId,
      attendanceEventId: input.attendanceEventId,
    },
  })

  await detectFrmExceptionsForOrg({
    organizationId: input.organizationId,
    userId: input.userId,
    employeeId: assignment.employeeId,
    workDate: event.occurredAt.toISOString().slice(0, 10),
  })

  revalidateFrmSurfaces()
  return { ok: true, linkId: id }
}

export async function reconcileFrmOfflineAttendanceLinks(input: {
  organizationId: string
  userId: string
}): Promise<{ ok: true; reconciled: number } | { ok: false; form?: string }> {
  const pending = await db.query.hrmFrmAttendanceLink.findMany({
    where: and(
      eq(hrmFrmAttendanceLink.organizationId, input.organizationId),
      eq(hrmFrmAttendanceLink.syncStatus, "pending")
    ),
  })

  let reconciled = 0
  for (const link of pending) {
    if (!link.attendanceEventId) continue
    await db
      .update(hrmFrmAttendanceLink)
      .set({ syncStatus: "reconciled", updatedAt: new Date() })
      .where(eq(hrmFrmAttendanceLink.id, link.id))
    reconciled += 1
  }

  if (reconciled > 0) {
    await writeIamAuditEventFromNextHeaders({
      action: HRM_FRM_AUDIT.attendanceReconcile,
      actorUserId: input.userId,
      organizationId: input.organizationId,
      resourceType: "field_workforce_attendance_link",
      resourceId: input.organizationId,
      metadata: { reconciled },
    })
    revalidateFrmSurfaces()
  }

  return { ok: true, reconciled }
}

export async function syncFrmAttendanceFromGeolocationForDate(input: {
  organizationId: string
  userId: string
  employeeId: string
  workDate: string
  assignmentId: string
}): Promise<{ ok: true; linked: number } | { ok: false; form?: string }> {
  const verified = await listVerifiedRemoteCheckinsForEmployeeDate({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    attendanceDate: input.workDate,
  })

  let linked = 0
  for (const row of verified) {
    const eventKind =
      row.eventType === "break_start" || row.eventType === "break_end"
        ? row.eventType
        : row.eventType === "clock_out"
          ? "clock_out"
          : "clock_in"

    const result = await linkFrmAttendanceFromGeolocationEvent({
      organizationId: input.organizationId,
      userId: input.userId,
      assignmentId: input.assignmentId,
      attendanceEventId: row.id,
      eventKind,
      locationVerificationOutcome: row.locationVerificationOutcome ?? null,
    })
    if (result.ok) linked += 1
  }

  return { ok: true, linked }
}
