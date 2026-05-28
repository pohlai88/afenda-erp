import "server-only"

import { desc, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmLmsCertificate,
  hrmLmsCourse,
  hrmLmsEnrollment,
  hrmLmsLearningPath,
} from "@afenda/platform/db/schema"

import type { HrmLmsCertificateRow } from "./lms.types.shared"

export async function listLmsCertificatesForOrg(
  organizationId: string
): Promise<HrmLmsCertificateRow[]> {
  const rows = await db
    .select({
      id: hrmLmsCertificate.id,
      enrollmentId: hrmLmsCertificate.enrollmentId,
      employeeId: hrmLmsEnrollment.employeeId,
      employeeNumber: hrmEmployee.employeeNumber,
      employeeName: hrmEmployee.legalName,
      courseId: hrmLmsEnrollment.courseId,
      learningPathId: hrmLmsEnrollment.learningPathId,
      courseCode: hrmLmsCourse.code,
      courseTitle: hrmLmsCourse.title,
      pathCode: hrmLmsLearningPath.code,
      pathName: hrmLmsLearningPath.name,
      status: hrmLmsCertificate.status,
      certificateRef: hrmLmsCertificate.certificateRef,
      issuedAt: hrmLmsCertificate.issuedAt,
      expiresAt: hrmLmsCertificate.expiresAt,
      renewalDueAt: hrmLmsCertificate.renewalDueAt,
    })
    .from(hrmLmsCertificate)
    .innerJoin(
      hrmLmsEnrollment,
      eq(hrmLmsCertificate.enrollmentId, hrmLmsEnrollment.id)
    )
    .innerJoin(hrmEmployee, eq(hrmLmsEnrollment.employeeId, hrmEmployee.id))
    .leftJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .leftJoin(
      hrmLmsLearningPath,
      eq(hrmLmsEnrollment.learningPathId, hrmLmsLearningPath.id)
    )
    .where(eq(hrmLmsCertificate.organizationId, organizationId))
    .orderBy(desc(hrmLmsCertificate.issuedAt))

  return rows.map((row) => ({
    id: row.id,
    enrollmentId: row.enrollmentId,
    employeeId: row.employeeId,
    employeeNumber: row.employeeNumber,
    employeeName: row.employeeName,
    targetLabel: row.courseId
      ? `${row.courseCode ?? ""} — ${row.courseTitle ?? ""}`
      : `${row.pathCode ?? ""} — ${row.pathName ?? ""}`,
    status: row.status,
    certificateRef: row.certificateRef,
    issuedAt: row.issuedAt,
    expiresAt: row.expiresAt,
    renewalDueAt: row.renewalDueAt,
  }))
}
