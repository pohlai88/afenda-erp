import "server-only"

import { desc, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmLmsAssignment,
  hrmLmsCourse,
  hrmLmsEnrollment,
  hrmLmsLearningPath,
} from "@afenda/platform/db/schema"

import type { HrmLmsAssignmentRow } from "./lms.types.shared"

export async function listLmsAssignmentsForOrg(
  organizationId: string
): Promise<HrmLmsAssignmentRow[]> {
  const rows = await db
    .select({
      id: hrmLmsAssignment.id,
      employeeId: hrmLmsAssignment.employeeId,
      employeeNumber: hrmEmployee.employeeNumber,
      employeeName: hrmEmployee.legalName,
      courseId: hrmLmsAssignment.courseId,
      learningPathId: hrmLmsAssignment.learningPathId,
      courseCode: hrmLmsCourse.code,
      courseTitle: hrmLmsCourse.title,
      pathCode: hrmLmsLearningPath.code,
      pathName: hrmLmsLearningPath.name,
      mandatory: hrmLmsAssignment.mandatory,
      assignedAt: hrmLmsAssignment.assignedAt,
      enrollmentId: hrmLmsEnrollment.id,
      approvalState: hrmLmsEnrollment.approvalState,
    })
    .from(hrmLmsAssignment)
    .innerJoin(hrmEmployee, eq(hrmLmsAssignment.employeeId, hrmEmployee.id))
    .leftJoin(hrmLmsCourse, eq(hrmLmsAssignment.courseId, hrmLmsCourse.id))
    .leftJoin(
      hrmLmsLearningPath,
      eq(hrmLmsAssignment.learningPathId, hrmLmsLearningPath.id)
    )
    .leftJoin(
      hrmLmsEnrollment,
      eq(hrmLmsEnrollment.assignmentId, hrmLmsAssignment.id)
    )
    .where(eq(hrmLmsAssignment.organizationId, organizationId))
    .orderBy(desc(hrmLmsAssignment.assignedAt))

  return rows.map((row) => ({
    id: row.id,
    employeeId: row.employeeId,
    employeeNumber: row.employeeNumber,
    employeeName: row.employeeName,
    courseId: row.courseId,
    learningPathId: row.learningPathId,
    targetLabel: row.courseId
      ? `${row.courseCode ?? ""} — ${row.courseTitle ?? ""}`
      : `${row.pathCode ?? ""} — ${row.pathName ?? ""}`,
    mandatory: row.mandatory,
    assignedAt: row.assignedAt,
    enrollmentId: row.enrollmentId,
    approvalState: row.approvalState,
  }))
}
