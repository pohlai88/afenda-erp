import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmFrmAttendanceLink,
  hrmFrmFieldAssignment,
  hrmFrmFieldException,
} from "@afenda/platform/db/schema"

import { HRM_FRM_AUDIT } from "../frm.contract"
import type { HrmFrmExceptionCode } from "../schemas/frm-workflow-state.shared"
import { formatFrmEmployeeLabel } from "./frm-display.shared"
import { notifyFrmExceptionOpened } from "./frm-notification.server"
import { revalidateFrmSurfaces } from "./frm-revalidate.server"
import type { FrmExceptionRow } from "./frm.types.shared"

export async function listFrmExceptionsForOrg(
  organizationId: string,
  state: string = "open"
): Promise<FrmExceptionRow[]> {
  const rows = await db.query.hrmFrmFieldException.findMany({
    where: and(
      eq(hrmFrmFieldException.organizationId, organizationId),
      eq(hrmFrmFieldException.state, state)
    ),
    orderBy: [asc(hrmFrmFieldException.exceptionDate)],
  })
  if (rows.length === 0) return []

  const employeeIds = [...new Set(rows.map((r) => r.employeeId))]
  const employees = await db.query.hrmEmployee.findMany({
    where: eq(hrmEmployee.organizationId, organizationId),
    columns: {
      id: true,
      employeeNumber: true,
      legalName: true,
      preferredName: true,
    },
  })
  const labelMap = new Map(
    employees
      .filter((e) => employeeIds.includes(e.id))
      .map((e) => [
        e.id,
        formatFrmEmployeeLabel({
          employeeNumber: e.employeeNumber,
          legalName: e.legalName,
          preferredName: e.preferredName,
        }),
      ])
  )

  return rows.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    employeeLabel: labelMap.get(row.employeeId) ?? row.employeeId,
    exceptionCode: row.exceptionCode as HrmFrmExceptionCode,
    exceptionDate: row.exceptionDate,
    state: row.state,
    assignmentId: row.assignmentId,
  }))
}

async function upsertFrmException(input: {
  organizationId: string
  userId: string
  employeeId: string
  assignmentId: string | null
  exceptionCode: HrmFrmExceptionCode
  exceptionDate: string
}) {
  const existing = await db.query.hrmFrmFieldException.findFirst({
    where: and(
      eq(hrmFrmFieldException.organizationId, input.organizationId),
      eq(hrmFrmFieldException.employeeId, input.employeeId),
      eq(hrmFrmFieldException.exceptionCode, input.exceptionCode),
      eq(hrmFrmFieldException.exceptionDate, input.exceptionDate),
      eq(hrmFrmFieldException.state, "open")
    ),
    columns: { id: true },
  })
  if (existing) return

  const id = crypto.randomUUID()
  await db.insert(hrmFrmFieldException).values({
    id,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    assignmentId: input.assignmentId,
    exceptionCode: input.exceptionCode,
    exceptionDate: input.exceptionDate,
    state: "open",
  })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FRM_AUDIT.exceptionDetect,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "field_workforce_exception",
    resourceId: id,
    metadata: { exceptionCode: input.exceptionCode },
  })

  let managerEmployeeId: string | null = null
  if (input.assignmentId) {
    const assignment = await db.query.hrmFrmFieldAssignment.findFirst({
      where: eq(hrmFrmFieldAssignment.id, input.assignmentId),
      columns: { managerEmployeeId: true },
    })
    managerEmployeeId = assignment?.managerEmployeeId ?? null
  }

  await notifyFrmExceptionOpened({
    organizationId: input.organizationId,
    exceptionId: id,
    employeeId: input.employeeId,
    managerEmployeeId,
    exceptionCode: input.exceptionCode,
    exceptionDate: input.exceptionDate,
  })
}

export async function detectFrmExceptionsForOrg(input: {
  organizationId: string
  userId: string
  employeeId: string
  workDate: string
}) {
  const links = await db.query.hrmFrmAttendanceLink.findMany({
    where: and(
      eq(hrmFrmAttendanceLink.organizationId, input.organizationId),
      eq(hrmFrmAttendanceLink.employeeId, input.employeeId)
    ),
  })

  const dayLinks = links.filter(
    (l) => l.capturedAt.toISOString().slice(0, 10) === input.workDate
  )

  const hasClockIn = dayLinks.some((l) => l.eventKind === "clock_in")
  const hasClockOut = dayLinks.some((l) => l.eventKind === "clock_out")
  const assignmentId = dayLinks[0]?.assignmentId ?? null

  if (!hasClockIn) {
    await upsertFrmException({
      organizationId: input.organizationId,
      userId: input.userId,
      employeeId: input.employeeId,
      assignmentId,
      exceptionCode: "missing_check_in",
      exceptionDate: input.workDate,
    })
  }

  if (hasClockIn && !hasClockOut) {
    await upsertFrmException({
      organizationId: input.organizationId,
      userId: input.userId,
      employeeId: input.employeeId,
      assignmentId,
      exceptionCode: "missing_check_out",
      exceptionDate: input.workDate,
    })
  }

  for (const link of dayLinks) {
    if (!link.worksiteValidated) {
      await upsertFrmException({
        organizationId: input.organizationId,
        userId: input.userId,
        employeeId: input.employeeId,
        assignmentId: link.assignmentId,
        exceptionCode: "outside_site",
        exceptionDate: input.workDate,
      })
    }
  }
}

export async function resolveFrmFieldException(input: {
  organizationId: string
  userId: string
  exceptionId: string
  correctionRef: string | null
}): Promise<{ ok: true } | { ok: false; form?: string }> {
  const row = await db.query.hrmFrmFieldException.findFirst({
    where: and(
      eq(hrmFrmFieldException.id, input.exceptionId),
      eq(hrmFrmFieldException.organizationId, input.organizationId)
    ),
  })
  if (!row) {
    return { ok: false, form: "Exception not found." }
  }

  await db
    .update(hrmFrmFieldException)
    .set({
      state: "resolved",
      correctionRef: input.correctionRef?.trim() || null,
      resolvedAt: new Date(),
      resolvedByUserId: input.userId,
      updatedAt: new Date(),
    })
    .where(eq(hrmFrmFieldException.id, input.exceptionId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_FRM_AUDIT.exceptionResolve,
    actorUserId: input.userId,
    organizationId: input.organizationId,
    resourceType: "field_workforce_exception",
    resourceId: input.exceptionId,
    metadata: {},
  })

  revalidateFrmSurfaces()
  return { ok: true }
}
