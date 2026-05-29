import "server-only"

import { and, eq, gte, inArray, isNull, lte, or } from "drizzle-orm"

import { writeIamAuditEvent } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmFrmAttendanceLink,
  hrmFrmFieldAssignment,
  iamAuditEvent,
} from "@afenda/platform/db/schema"
import type {
  CronTickInput,
  CronTickScannedEmittedSummary,
} from "@afenda/platform/erp/cron-tick.shared"

import { HRM_FRM_AUDIT } from "../frm.contract"
import { notifyFrmCheckinOverdue } from "./frm-notification.server"

/** UTC hour (0–23) after which a missing same-day clock-in is treated as overdue. */
export const FRM_CHECKIN_OVERDUE_UTC_HOUR = 12

const OVERDUE_WATCH_BATCH_LIMIT = 200

export type FrmOverdueCheckinWatchTickSummary =
  CronTickScannedEmittedSummary & {
    readonly skippedAlreadyAudited: number
    readonly notificationsSent: number
  }

type OverdueCandidate = {
  readonly assignmentId: string
  readonly organizationId: string
  readonly employeeId: string
  readonly managerEmployeeId: string | null
  readonly workDate: string
}

function buildOverdueResourceId(
  assignmentId: string,
  workDate: string
): string {
  return `${assignmentId}:${workDate}`
}

export async function runFrmOverdueCheckinTick(
  input?: CronTickInput
): Promise<FrmOverdueCheckinWatchTickSummary> {
  const now = input?.now ?? new Date()
  if (now.getUTCHours() < FRM_CHECKIN_OVERDUE_UTC_HOUR) {
    return {
      scanned: 0,
      emitted: 0,
      skippedAlreadyAudited: 0,
      notificationsSent: 0,
    }
  }

  const workDate = now.toISOString().slice(0, 10)

  const assignments = await db
    .select({
      assignmentId: hrmFrmFieldAssignment.id,
      organizationId: hrmFrmFieldAssignment.organizationId,
      employeeId: hrmFrmFieldAssignment.employeeId,
      managerEmployeeId: hrmFrmFieldAssignment.managerEmployeeId,
    })
    .from(hrmFrmFieldAssignment)
    .where(
      and(
        eq(hrmFrmFieldAssignment.state, "active"),
        lte(hrmFrmFieldAssignment.startDate, workDate),
        or(
          isNull(hrmFrmFieldAssignment.endDate),
          gte(hrmFrmFieldAssignment.endDate, workDate)
        )
      )
    )
    .limit(input?.batchLimit ?? OVERDUE_WATCH_BATCH_LIMIT)

  if (assignments.length === 0) {
    return {
      scanned: 0,
      emitted: 0,
      skippedAlreadyAudited: 0,
      notificationsSent: 0,
    }
  }

  const employeeIds = [...new Set(assignments.map((row) => row.employeeId))]
  const clockInLinks =
    employeeIds.length === 0
      ? []
      : await db
          .select({
            employeeId: hrmFrmAttendanceLink.employeeId,
            capturedAt: hrmFrmAttendanceLink.capturedAt,
          })
          .from(hrmFrmAttendanceLink)
          .where(
            and(
              inArray(hrmFrmAttendanceLink.employeeId, employeeIds),
              eq(hrmFrmAttendanceLink.eventKind, "clock_in")
            )
          )

  const clockedInToday = new Set(
    clockInLinks
      .filter((link) => link.capturedAt.toISOString().slice(0, 10) === workDate)
      .map((link) => link.employeeId)
  )

  const candidates: OverdueCandidate[] = assignments
    .filter((row) => !clockedInToday.has(row.employeeId))
    .map((row) => ({
      assignmentId: row.assignmentId,
      organizationId: row.organizationId,
      employeeId: row.employeeId,
      managerEmployeeId: row.managerEmployeeId,
      workDate,
    }))

  if (candidates.length === 0) {
    return {
      scanned: assignments.length,
      emitted: 0,
      skippedAlreadyAudited: 0,
      notificationsSent: 0,
    }
  }

  const resourceIds = candidates.map((c) =>
    buildOverdueResourceId(c.assignmentId, c.workDate)
  )
  const emittedRows = await db
    .selectDistinct({ resourceId: iamAuditEvent.resourceId })
    .from(iamAuditEvent)
    .where(
      and(
        eq(iamAuditEvent.action, HRM_FRM_AUDIT.checkinOverdue),
        inArray(iamAuditEvent.resourceId, resourceIds)
      )
    )

  const alreadyAudited = new Set(emittedRows.map((row) => row.resourceId))
  let emitted = 0
  let skippedAlreadyAudited = 0
  let notificationsSent = 0

  for (const candidate of candidates) {
    const resourceId = buildOverdueResourceId(
      candidate.assignmentId,
      candidate.workDate
    )
    if (alreadyAudited.has(resourceId)) {
      skippedAlreadyAudited += 1
      continue
    }

    await writeIamAuditEvent({
      action: HRM_FRM_AUDIT.checkinOverdue,
      actorUserId: null,
      actorSessionId: null,
      organizationId: candidate.organizationId,
      resourceType: "field_workforce_assignment",
      resourceId,
      metadata: {
        assignmentId: candidate.assignmentId,
        employeeId: candidate.employeeId,
        workDate: candidate.workDate,
      },
    })

    emitted += 1

    await notifyFrmCheckinOverdue({
      organizationId: candidate.organizationId,
      assignmentId: candidate.assignmentId,
      employeeId: candidate.employeeId,
      managerEmployeeId: candidate.managerEmployeeId,
      workDate: candidate.workDate,
    })
    notificationsSent += 1
  }

  return {
    scanned: assignments.length,
    emitted,
    skippedAlreadyAudited,
    notificationsSent,
  }
}
