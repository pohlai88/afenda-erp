import "server-only"

import { and, desc, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmLmsAssignment,
  hrmLmsCourse,
  hrmLmsEnrollment,
  hrmLmsLearningPath,
} from "@afenda/platform/db/schema"

import type { HrmLmsEnrollmentRow } from "./lms.types.shared"

function mapEnrollmentRow(row: {
  id: string
  employeeId: string
  employeeNumber: string
  employeeName: string
  courseId: string | null
  learningPathId: string | null
  courseCode: string | null
  courseTitle: string | null
  pathCode: string | null
  pathName: string | null
  approvalState: string
  enrolledAt: Date
  mandatory: boolean | null
}): HrmLmsEnrollmentRow {
  return {
    id: row.id,
    employeeId: row.employeeId,
    employeeNumber: row.employeeNumber,
    employeeName: row.employeeName,
    courseId: row.courseId,
    learningPathId: row.learningPathId,
    targetLabel: row.courseId
      ? `${row.courseCode ?? ""} — ${row.courseTitle ?? ""}`
      : `${row.pathCode ?? ""} — ${row.pathName ?? ""}`,
    approvalState: row.approvalState,
    enrolledAt: row.enrolledAt,
    mandatory: row.mandatory,
  }
}

const enrollmentSelect = {
  id: hrmLmsEnrollment.id,
  employeeId: hrmLmsEnrollment.employeeId,
  employeeNumber: hrmEmployee.employeeNumber,
  employeeName: hrmEmployee.legalName,
  courseId: hrmLmsEnrollment.courseId,
  learningPathId: hrmLmsEnrollment.learningPathId,
  courseCode: hrmLmsCourse.code,
  courseTitle: hrmLmsCourse.title,
  pathCode: hrmLmsLearningPath.code,
  pathName: hrmLmsLearningPath.name,
  approvalState: hrmLmsEnrollment.approvalState,
  enrolledAt: hrmLmsEnrollment.enrolledAt,
  mandatory: hrmLmsAssignment.mandatory,
}

export async function listLmsPendingEnrollmentsForOrg(
  organizationId: string
): Promise<HrmLmsEnrollmentRow[]> {
  const rows = await db
    .select(enrollmentSelect)
    .from(hrmLmsEnrollment)
    .innerJoin(hrmEmployee, eq(hrmLmsEnrollment.employeeId, hrmEmployee.id))
    .leftJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .leftJoin(
      hrmLmsLearningPath,
      eq(hrmLmsEnrollment.learningPathId, hrmLmsLearningPath.id)
    )
    .leftJoin(
      hrmLmsAssignment,
      eq(hrmLmsEnrollment.assignmentId, hrmLmsAssignment.id)
    )
    .where(
      and(
        eq(hrmLmsEnrollment.organizationId, organizationId),
        eq(hrmLmsEnrollment.approvalState, "pending")
      )
    )
    .orderBy(desc(hrmLmsEnrollment.enrolledAt))

  return rows.map(mapEnrollmentRow)
}

export async function listLmsEnrollmentsForEmployee(input: {
  organizationId: string
  employeeId: string
}): Promise<HrmLmsEnrollmentRow[]> {
  const rows = await db
    .select(enrollmentSelect)
    .from(hrmLmsEnrollment)
    .innerJoin(hrmEmployee, eq(hrmLmsEnrollment.employeeId, hrmEmployee.id))
    .leftJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .leftJoin(
      hrmLmsLearningPath,
      eq(hrmLmsEnrollment.learningPathId, hrmLmsLearningPath.id)
    )
    .leftJoin(
      hrmLmsAssignment,
      eq(hrmLmsEnrollment.assignmentId, hrmLmsAssignment.id)
    )
    .where(
      and(
        eq(hrmLmsEnrollment.organizationId, input.organizationId),
        eq(hrmLmsEnrollment.employeeId, input.employeeId)
      )
    )
    .orderBy(desc(hrmLmsEnrollment.enrolledAt))

  return rows.map(mapEnrollmentRow)
}
