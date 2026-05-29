import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmLmsAssessment,
  hrmLmsAssessmentAttempt,
  hrmLmsEnrollment,
  hrmLmsProgress,
} from "@afenda/platform/db/schema"

import {
  canStartLmsAssessmentAttempt,
  evaluateLmsAssessmentAttempt,
  nextLmsAttemptNumber,
} from "../lms-assessment.shared"
import { countLmsAssessmentAttempts } from "./lms-assessments.queries.server"

export async function submitLmsAssessmentAttempt(input: {
  organizationId: string
  assessmentId: string
  enrollmentId: string
  score: number
}): Promise<
  | { ok: true; attemptId: string; result: "pass" | "fail" }
  | { ok: false; message: string }
> {
  const [assessment] = await db
    .select({
      id: hrmLmsAssessment.id,
      courseId: hrmLmsAssessment.courseId,
      passingScore: hrmLmsAssessment.passingScore,
      maxAttempts: hrmLmsAssessment.maxAttempts,
    })
    .from(hrmLmsAssessment)
    .where(
      and(
        eq(hrmLmsAssessment.organizationId, input.organizationId),
        eq(hrmLmsAssessment.id, input.assessmentId)
      )
    )
    .limit(1)

  if (!assessment) {
    return { ok: false, message: "Assessment not found." }
  }

  const [enrollment] = await db
    .select({
      id: hrmLmsEnrollment.id,
      courseId: hrmLmsEnrollment.courseId,
      approvalState: hrmLmsEnrollment.approvalState,
    })
    .from(hrmLmsEnrollment)
    .where(
      and(
        eq(hrmLmsEnrollment.organizationId, input.organizationId),
        eq(hrmLmsEnrollment.id, input.enrollmentId)
      )
    )
    .limit(1)

  if (!enrollment || enrollment.approvalState !== "approved") {
    return { ok: false, message: "Enrollment is not approved." }
  }
  if (enrollment.courseId !== assessment.courseId) {
    return {
      ok: false,
      message: "Assessment does not belong to this enrollment.",
    }
  }

  const attemptCount = await countLmsAssessmentAttempts({
    organizationId: input.organizationId,
    assessmentId: input.assessmentId,
    enrollmentId: input.enrollmentId,
  })

  if (
    !canStartLmsAssessmentAttempt({
      attemptCount,
      maxAttempts: assessment.maxAttempts,
    })
  ) {
    return { ok: false, message: "Maximum assessment attempts reached." }
  }

  const result = evaluateLmsAssessmentAttempt({
    score: input.score,
    passingScore: assessment.passingScore,
  })
  const now = new Date()

  const [attempt] = await db
    .insert(hrmLmsAssessmentAttempt)
    .values({
      organizationId: input.organizationId,
      assessmentId: input.assessmentId,
      enrollmentId: input.enrollmentId,
      attemptNumber: nextLmsAttemptNumber(attemptCount),
      score: input.score,
      result,
      completedAt: now,
    })
    .returning({ id: hrmLmsAssessmentAttempt.id })

  const attemptId = attempt?.id ?? ""
  if (!attemptId) {
    return { ok: false, message: "Could not record assessment attempt." }
  }

  const [progress] = await db
    .select({ id: hrmLmsProgress.id })
    .from(hrmLmsProgress)
    .where(eq(hrmLmsProgress.enrollmentId, input.enrollmentId))
    .limit(1)

  if (progress) {
    await db
      .update(hrmLmsProgress)
      .set(
        result === "pass"
          ? {
              status: "completed",
              percentComplete: 100,
              lastAccessedAt: now,
              updatedAt: now,
            }
          : {
              status: "failed",
              lastAccessedAt: now,
              updatedAt: now,
            }
      )
      .where(eq(hrmLmsProgress.id, progress.id))
  }

  return { ok: true, attemptId, result }
}
