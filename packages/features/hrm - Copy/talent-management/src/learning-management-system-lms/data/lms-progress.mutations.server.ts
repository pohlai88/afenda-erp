import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmLmsCourse,
  hrmLmsEnrollment,
  hrmLmsLesson,
  hrmLmsProgress,
} from "@afenda/platform/db/schema"

import {
  bumpLmsLessonPercent,
  clampLmsPercentComplete,
  deriveLmsProgressStatusFromPercent,
  resolveLmsProgressDisplayStatus,
} from "../lms-progress.shared"

export async function advanceLmsLessonProgress(input: {
  organizationId: string
  enrollmentId: string
  lessonId: string
  minutesSpent?: number
}): Promise<
  | {
      ok: true
      transitionedToCompleted: boolean
      employeeId: string
      courseId: string
    }
  | { ok: false; message: string }
> {
  const [ctx] = await db
    .select({
      progressId: hrmLmsProgress.id,
      percentComplete: hrmLmsProgress.percentComplete,
      timeSpentMinutes: hrmLmsProgress.timeSpentMinutes,
      status: hrmLmsProgress.status,
      courseId: hrmLmsEnrollment.courseId,
      employeeId: hrmLmsEnrollment.employeeId,
      enrolledAt: hrmLmsEnrollment.enrolledAt,
      validityDays: hrmLmsCourse.validityDays,
      approvalState: hrmLmsEnrollment.approvalState,
    })
    .from(hrmLmsProgress)
    .innerJoin(
      hrmLmsEnrollment,
      eq(hrmLmsProgress.enrollmentId, hrmLmsEnrollment.id)
    )
    .leftJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .where(
      and(
        eq(hrmLmsProgress.organizationId, input.organizationId),
        eq(hrmLmsEnrollment.id, input.enrollmentId)
      )
    )
    .limit(1)

  if (!ctx || ctx.approvalState !== "approved") {
    return { ok: false, message: "Enrollment is not approved for learning." }
  }
  if (!ctx.courseId) {
    return {
      ok: false,
      message: "Lesson progress applies to course enrollments only.",
    }
  }

  const [lesson] = await db
    .select({ id: hrmLmsLesson.id })
    .from(hrmLmsLesson)
    .where(
      and(
        eq(hrmLmsLesson.organizationId, input.organizationId),
        eq(hrmLmsLesson.courseId, ctx.courseId),
        eq(hrmLmsLesson.id, input.lessonId)
      )
    )
    .limit(1)

  if (!lesson) {
    return { ok: false, message: "Lesson not found on this course." }
  }

  const lessonCountRows = await db
    .select({ id: hrmLmsLesson.id })
    .from(hrmLmsLesson)
    .where(
      and(
        eq(hrmLmsLesson.organizationId, input.organizationId),
        eq(hrmLmsLesson.courseId, ctx.courseId)
      )
    )

  const nextPercent = bumpLmsLessonPercent({
    currentPercent: ctx.percentComplete,
    lessonCount: lessonCountRows.length,
  })
  const derivedStatus = deriveLmsProgressStatusFromPercent(nextPercent)
  const displayStatus = resolveLmsProgressDisplayStatus({
    status: derivedStatus,
    percentComplete: nextPercent,
    enrolledAt: ctx.enrolledAt,
    validityDays: ctx.validityDays,
  })
  const persistedStatus =
    displayStatus === "overdue" ? "overdue" : derivedStatus
  const extraMinutes =
    input.minutesSpent ?? (lessonCountRows.length > 0 ? 5 : 0)
  const now = new Date()

  const wasCompleted = ctx.status === "completed" || ctx.percentComplete >= 100
  const transitionedToCompleted =
    !wasCompleted && (persistedStatus === "completed" || nextPercent >= 100)

  await db
    .update(hrmLmsProgress)
    .set({
      percentComplete: clampLmsPercentComplete(nextPercent),
      status: persistedStatus,
      timeSpentMinutes: ctx.timeSpentMinutes + extraMinutes,
      lastAccessedAt: now,
      updatedAt: now,
    })
    .where(eq(hrmLmsProgress.id, ctx.progressId))

  return {
    ok: true,
    transitionedToCompleted,
    employeeId: ctx.employeeId,
    courseId: ctx.courseId,
  }
}
