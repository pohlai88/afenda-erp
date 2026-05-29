import "server-only"

import { and, desc, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmLmsCourse,
  hrmLmsEnrollment,
  hrmLmsProgress,
} from "@afenda/platform/db/schema"

export async function listLmsCompletedEnrollmentChoicesForOrg(
  organizationId: string
): Promise<readonly { id: string; label: string }[]> {
  const rows = await db
    .select({
      enrollmentId: hrmLmsEnrollment.id,
      employeeNumber: hrmEmployee.employeeNumber,
      employeeName: hrmEmployee.legalName,
      courseCode: hrmLmsCourse.code,
      courseTitle: hrmLmsCourse.title,
    })
    .from(hrmLmsProgress)
    .innerJoin(
      hrmLmsEnrollment,
      eq(hrmLmsProgress.enrollmentId, hrmLmsEnrollment.id)
    )
    .innerJoin(hrmEmployee, eq(hrmLmsEnrollment.employeeId, hrmEmployee.id))
    .innerJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .where(
      and(
        eq(hrmLmsProgress.organizationId, organizationId),
        eq(hrmLmsProgress.status, "completed"),
        eq(hrmLmsEnrollment.approvalState, "approved")
      )
    )
    .orderBy(desc(hrmLmsEnrollment.enrolledAt))

  return rows.map((row) => ({
    id: row.enrollmentId,
    label: `${row.employeeNumber} — ${row.employeeName} · ${row.courseCode} — ${row.courseTitle}`,
  }))
}
