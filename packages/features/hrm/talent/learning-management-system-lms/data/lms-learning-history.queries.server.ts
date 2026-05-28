import "server-only"

import { and, desc, eq, inArray } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmEmployee,
  hrmLmsAssessmentAttempt,
  hrmLmsAssessment,
  hrmLmsCertificate,
  hrmLmsCourse,
  hrmLmsEnrollment,
  hrmLmsLearningPath,
  hrmLmsProgress,
} from "@afenda/platform/db/schema"

export type LmsLearningHistoryRow = {
  readonly id: string
  readonly occurredAt: Date
  readonly kind: "enrollment" | "progress" | "assessment" | "certificate"
  readonly employeeId: string
  readonly employeeNumber: string
  readonly employeeName: string
  readonly targetLabel: string
  readonly detail: string
}

export async function listLmsLearningHistoryForOrg(input: {
  organizationId: string
  employeeIds?: readonly string[]
  limit?: number
}): Promise<LmsLearningHistoryRow[]> {
  const limit = input.limit ?? 200
  const employeeFilter =
    input.employeeIds && input.employeeIds.length > 0
      ? inArray(hrmLmsEnrollment.employeeId, [...input.employeeIds])
      : undefined

  const [enrollments, progressEvents, attempts, certificates] =
    await Promise.all([
      db
        .select({
          id: hrmLmsEnrollment.id,
          occurredAt: hrmLmsEnrollment.enrolledAt,
          employeeId: hrmLmsEnrollment.employeeId,
          employeeNumber: hrmEmployee.employeeNumber,
          employeeName: hrmEmployee.legalName,
          courseCode: hrmLmsCourse.code,
          courseTitle: hrmLmsCourse.title,
          pathCode: hrmLmsLearningPath.code,
          pathName: hrmLmsLearningPath.name,
          courseId: hrmLmsEnrollment.courseId,
          approvalState: hrmLmsEnrollment.approvalState,
        })
        .from(hrmLmsEnrollment)
        .innerJoin(hrmEmployee, eq(hrmLmsEnrollment.employeeId, hrmEmployee.id))
        .leftJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
        .leftJoin(
          hrmLmsLearningPath,
          eq(hrmLmsEnrollment.learningPathId, hrmLmsLearningPath.id)
        )
        .where(
          and(
            eq(hrmLmsEnrollment.organizationId, input.organizationId),
            employeeFilter
          )
        )
        .orderBy(desc(hrmLmsEnrollment.enrolledAt))
        .limit(limit),
      db
        .select({
          id: hrmLmsProgress.id,
          occurredAt: hrmLmsProgress.updatedAt,
          employeeId: hrmLmsEnrollment.employeeId,
          employeeNumber: hrmEmployee.employeeNumber,
          employeeName: hrmEmployee.legalName,
          courseCode: hrmLmsCourse.code,
          courseTitle: hrmLmsCourse.title,
          pathCode: hrmLmsLearningPath.code,
          pathName: hrmLmsLearningPath.name,
          status: hrmLmsProgress.status,
          percentComplete: hrmLmsProgress.percentComplete,
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
            eq(hrmLmsProgress.organizationId, input.organizationId),
            employeeFilter
          )
        )
        .orderBy(desc(hrmLmsProgress.updatedAt))
        .limit(limit),
      db
        .select({
          id: hrmLmsAssessmentAttempt.id,
          occurredAt: hrmLmsAssessmentAttempt.completedAt,
          employeeId: hrmLmsEnrollment.employeeId,
          employeeNumber: hrmEmployee.employeeNumber,
          employeeName: hrmEmployee.legalName,
          courseCode: hrmLmsCourse.code,
          courseTitle: hrmLmsCourse.title,
          assessmentTitle: hrmLmsAssessment.title,
          score: hrmLmsAssessmentAttempt.score,
          result: hrmLmsAssessmentAttempt.result,
        })
        .from(hrmLmsAssessmentAttempt)
        .innerJoin(
          hrmLmsAssessment,
          eq(hrmLmsAssessmentAttempt.assessmentId, hrmLmsAssessment.id)
        )
        .innerJoin(
          hrmLmsEnrollment,
          eq(hrmLmsAssessmentAttempt.enrollmentId, hrmLmsEnrollment.id)
        )
        .innerJoin(hrmEmployee, eq(hrmLmsEnrollment.employeeId, hrmEmployee.id))
        .leftJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
        .where(
          and(
            eq(hrmLmsAssessmentAttempt.organizationId, input.organizationId),
            employeeFilter
          )
        )
        .orderBy(desc(hrmLmsAssessmentAttempt.completedAt))
        .limit(limit),
      db
        .select({
          id: hrmLmsCertificate.id,
          occurredAt: hrmLmsCertificate.issuedAt,
          employeeId: hrmLmsEnrollment.employeeId,
          employeeNumber: hrmEmployee.employeeNumber,
          employeeName: hrmEmployee.legalName,
          courseCode: hrmLmsCourse.code,
          courseTitle: hrmLmsCourse.title,
          certificateRef: hrmLmsCertificate.certificateRef,
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
            eq(hrmLmsCertificate.organizationId, input.organizationId),
            employeeFilter
          )
        )
        .orderBy(desc(hrmLmsCertificate.issuedAt))
        .limit(limit),
    ])

  const targetLabel = (row: {
    courseId?: string | null
    courseCode?: string | null
    courseTitle?: string | null
    pathCode?: string | null
    pathName?: string | null
  }) =>
    row.courseId != null
      ? `${row.courseCode ?? ""} — ${row.courseTitle ?? ""}`
      : `${row.pathCode ?? ""} — ${row.pathName ?? ""}`

  const events: LmsLearningHistoryRow[] = []

  for (const row of enrollments) {
    events.push({
      id: `enrollment:${row.id}`,
      occurredAt: row.occurredAt,
      kind: "enrollment",
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeName: row.employeeName,
      targetLabel: targetLabel(row),
      detail: row.approvalState,
    })
  }

  for (const row of progressEvents) {
    events.push({
      id: `progress:${row.id}`,
      occurredAt: row.occurredAt,
      kind: "progress",
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeName: row.employeeName,
      targetLabel: targetLabel(row),
      detail: `${row.status} (${row.percentComplete}%)`,
    })
  }

  for (const row of attempts) {
    if (!row.occurredAt) continue
    events.push({
      id: `assessment:${row.id}`,
      occurredAt: row.occurredAt,
      kind: "assessment",
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeName: row.employeeName,
      targetLabel: `${targetLabel(row)} — ${row.assessmentTitle}`,
      detail: `${row.score ?? 0}% · ${row.result ?? "—"}`,
    })
  }

  for (const row of certificates) {
    events.push({
      id: `certificate:${row.id}`,
      occurredAt: row.occurredAt,
      kind: "certificate",
      employeeId: row.employeeId,
      employeeNumber: row.employeeNumber,
      employeeName: row.employeeName,
      targetLabel: targetLabel(row),
      detail: `${row.status} · ${row.certificateRef}`,
    })
  }

  return events
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, limit)
}
