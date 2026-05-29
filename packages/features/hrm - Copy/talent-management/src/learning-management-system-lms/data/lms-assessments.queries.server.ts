import "server-only"

import { and, asc, count, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmLmsAssessment, hrmLmsAssessmentAttempt } from "@afenda/platform/db/schema"

import type { HrmLmsAssessmentRow } from "./lms.types.shared"

export async function listLmsAssessmentsForCourse(input: {
  organizationId: string
  courseId: string
}): Promise<HrmLmsAssessmentRow[]> {
  const rows = await db
    .select({
      id: hrmLmsAssessment.id,
      courseId: hrmLmsAssessment.courseId,
      code: hrmLmsAssessment.code,
      title: hrmLmsAssessment.title,
      passingScore: hrmLmsAssessment.passingScore,
      maxAttempts: hrmLmsAssessment.maxAttempts,
    })
    .from(hrmLmsAssessment)
    .where(
      and(
        eq(hrmLmsAssessment.organizationId, input.organizationId),
        eq(hrmLmsAssessment.courseId, input.courseId)
      )
    )
    .orderBy(asc(hrmLmsAssessment.code))

  return rows
}

export async function countLmsAssessmentAttempts(input: {
  organizationId: string
  assessmentId: string
  enrollmentId: string
}): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(hrmLmsAssessmentAttempt)
    .where(
      and(
        eq(hrmLmsAssessmentAttempt.organizationId, input.organizationId),
        eq(hrmLmsAssessmentAttempt.assessmentId, input.assessmentId),
        eq(hrmLmsAssessmentAttempt.enrollmentId, input.enrollmentId)
      )
    )

  return Number(row?.value ?? 0)
}
