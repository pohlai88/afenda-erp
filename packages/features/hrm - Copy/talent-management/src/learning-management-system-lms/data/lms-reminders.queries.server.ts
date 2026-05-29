import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmLmsCertificate,
  hrmLmsCourse,
  hrmLmsEnrollment,
  hrmLmsProgress,
} from "@afenda/platform/db/schema"

import { deriveLmsOverdueStatus } from "../lms-progress.shared"
import type { HrmLmsReminderRow } from "./lms.types.shared"

const CERTIFICATE_EXPIRY_WINDOW_DAYS = 30

function addDays(base: Date, days: number): Date {
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next
}

export async function listLmsReminderRowsForOrg(
  organizationId: string
): Promise<HrmLmsReminderRow[]> {
  const now = new Date()
  const certHorizon = addDays(now, CERTIFICATE_EXPIRY_WINDOW_DAYS)
  const reminders: HrmLmsReminderRow[] = []

  const progressRows = await db
    .select({
      progressId: hrmLmsProgress.id,
      enrollmentId: hrmLmsEnrollment.id,
      employeeId: hrmLmsEnrollment.employeeId,
      employeeNumber: hrmEmployee.employeeNumber,
      employeeName: hrmEmployee.legalName,
      courseCode: hrmLmsCourse.code,
      courseTitle: hrmLmsCourse.title,
      validityDays: hrmLmsCourse.validityDays,
      status: hrmLmsProgress.status,
      enrolledAt: hrmLmsEnrollment.enrolledAt,
    })
    .from(hrmLmsProgress)
    .innerJoin(
      hrmLmsEnrollment,
      eq(hrmLmsProgress.enrollmentId, hrmLmsEnrollment.id)
    )
    .innerJoin(hrmEmployee, eq(hrmLmsEnrollment.employeeId, hrmEmployee.id))
    .leftJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .where(
      and(
        eq(hrmLmsProgress.organizationId, organizationId),
        eq(hrmLmsEnrollment.approvalState, "approved")
      )
    )

  for (const row of progressRows) {
    const overdue = deriveLmsOverdueStatus({
      status: row.status,
      enrolledAt: row.enrolledAt,
      validityDays: row.validityDays,
      now,
    })
    if (overdue !== "overdue") continue
    reminders.push({
      id: `progress:${row.progressId}`,
      kind: "progress_overdue",
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeName: row.employeeName,
      targetLabel: `${row.courseCode ?? ""} — ${row.courseTitle ?? ""}`,
      detail: "Learning progress is past the course validity window.",
    })
  }

  const certRows = await db
    .select({
      id: hrmLmsCertificate.id,
      employeeId: hrmLmsEnrollment.employeeId,
      employeeNumber: hrmEmployee.employeeNumber,
      employeeName: hrmEmployee.legalName,
      courseCode: hrmLmsCourse.code,
      courseTitle: hrmLmsCourse.title,
      expiresAt: hrmLmsCertificate.expiresAt,
      status: hrmLmsCertificate.status,
    })
    .from(hrmLmsCertificate)
    .innerJoin(
      hrmLmsEnrollment,
      eq(hrmLmsCertificate.enrollmentId, hrmLmsEnrollment.id)
    )
    .innerJoin(hrmEmployee, eq(hrmLmsEnrollment.employeeId, hrmEmployee.id))
    .leftJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .where(
      and(
        eq(hrmLmsCertificate.organizationId, organizationId),
        eq(hrmLmsCertificate.status, "issued")
      )
    )

  for (const row of certRows) {
    if (!row.expiresAt || row.expiresAt > certHorizon) continue
    reminders.push({
      id: `cert:${row.id}`,
      kind: "certificate_expiring",
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeName: row.employeeName,
      targetLabel: `${row.courseCode ?? ""} — ${row.courseTitle ?? ""}`,
      detail: "Certificate renewal is due before expiry.",
    })
  }

  return reminders
}
