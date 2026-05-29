import "server-only"

import { and, desc, eq, isNotNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmLmsCourse,
  hrmLmsEnrollment,
  hrmLmsLearningPath,
  hrmLmsProgress,
} from "@afenda/platform/db/schema"

import { resolveLmsProgressDisplayStatus } from "../lms-progress.shared"
import type {
  HrmLmsPlayerEnrollmentRow,
  HrmLmsProgressRow,
} from "./lms.types.shared"

export async function listLmsProgressForOrg(
  organizationId: string
): Promise<HrmLmsProgressRow[]> {
  const rows = await db
    .select({
      progressId: hrmLmsProgress.id,
      enrollmentId: hrmLmsEnrollment.id,
      employeeId: hrmLmsEnrollment.employeeId,
      employeeNumber: hrmEmployee.employeeNumber,
      employeeName: hrmEmployee.legalName,
      courseId: hrmLmsEnrollment.courseId,
      learningPathId: hrmLmsEnrollment.learningPathId,
      courseCode: hrmLmsCourse.code,
      courseTitle: hrmLmsCourse.title,
      pathCode: hrmLmsLearningPath.code,
      pathName: hrmLmsLearningPath.name,
      validityDays: hrmLmsCourse.validityDays,
      status: hrmLmsProgress.status,
      percentComplete: hrmLmsProgress.percentComplete,
      timeSpentMinutes: hrmLmsProgress.timeSpentMinutes,
      lastAccessedAt: hrmLmsProgress.lastAccessedAt,
      enrolledAt: hrmLmsEnrollment.enrolledAt,
    })
    .from(hrmLmsProgress)
    .innerJoin(
      hrmLmsEnrollment,
      eq(hrmLmsProgress.enrollmentId, hrmLmsEnrollment.id)
    )
    .innerJoin(hrmEmployee, eq(hrmLmsEnrollment.employeeId, hrmEmployee.id))
    .leftJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .leftJoin(
      hrmLmsLearningPath,
      eq(hrmLmsEnrollment.learningPathId, hrmLmsLearningPath.id)
    )
    .where(
      and(
        eq(hrmLmsProgress.organizationId, organizationId),
        eq(hrmLmsEnrollment.approvalState, "approved")
      )
    )
    .orderBy(desc(hrmLmsProgress.updatedAt))

  return rows.map((row) => {
    const displayStatus = resolveLmsProgressDisplayStatus({
      status: row.status,
      percentComplete: row.percentComplete,
      enrolledAt: row.enrolledAt,
      validityDays: row.validityDays,
    })
    return {
      progressId: row.progressId,
      enrollmentId: row.enrollmentId,
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeName: row.employeeName,
      targetLabel: row.courseId
        ? `${row.courseCode ?? ""} — ${row.courseTitle ?? ""}`
        : `${row.pathCode ?? ""} — ${row.pathName ?? ""}`,
      status: row.status,
      displayStatus,
      percentComplete: row.percentComplete,
      timeSpentMinutes: row.timeSpentMinutes,
      lastAccessedAt: row.lastAccessedAt,
      enrolledAt: row.enrolledAt,
    }
  })
}

export async function listLmsPlayerEnrollmentsForEmployee(input: {
  organizationId: string
  employeeId: string
}): Promise<HrmLmsPlayerEnrollmentRow[]> {
  const rows = await db
    .select({
      enrollmentId: hrmLmsEnrollment.id,
      courseId: hrmLmsEnrollment.courseId,
      courseCode: hrmLmsCourse.code,
      courseTitle: hrmLmsCourse.title,
      validityDays: hrmLmsCourse.validityDays,
      progressId: hrmLmsProgress.id,
      percentComplete: hrmLmsProgress.percentComplete,
      status: hrmLmsProgress.status,
    })
    .from(hrmLmsEnrollment)
    .innerJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .leftJoin(
      hrmLmsProgress,
      eq(hrmLmsProgress.enrollmentId, hrmLmsEnrollment.id)
    )
    .where(
      and(
        eq(hrmLmsEnrollment.organizationId, input.organizationId),
        eq(hrmLmsEnrollment.employeeId, input.employeeId),
        eq(hrmLmsEnrollment.approvalState, "approved"),
        isNotNull(hrmLmsEnrollment.courseId)
      )
    )
    .orderBy(desc(hrmLmsEnrollment.enrolledAt))

  return rows
    .filter(
      (row): row is typeof row & { courseId: string } => row.courseId != null
    )
    .map((row) => ({
      enrollmentId: row.enrollmentId,
      courseId: row.courseId,
      courseCode: row.courseCode ?? "",
      courseTitle: row.courseTitle ?? "",
      progressId: row.progressId,
      percentComplete: row.percentComplete ?? 0,
      status: row.status ?? "not_started",
      validityDays: row.validityDays,
    }))
}
