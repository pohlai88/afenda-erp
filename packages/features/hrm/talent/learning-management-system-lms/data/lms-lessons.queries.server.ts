import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmLmsLesson } from "@afenda/platform/db/schema"

import type { HrmLmsLessonRow } from "./lms.types.shared"

export async function listLmsLessonsForCourse(input: {
  organizationId: string
  courseId: string
}): Promise<HrmLmsLessonRow[]> {
  const rows = await db
    .select({
      id: hrmLmsLesson.id,
      courseId: hrmLmsLesson.courseId,
      code: hrmLmsLesson.code,
      title: hrmLmsLesson.title,
      sortOrder: hrmLmsLesson.sortOrder,
      estimatedMinutes: hrmLmsLesson.estimatedMinutes,
    })
    .from(hrmLmsLesson)
    .where(
      and(
        eq(hrmLmsLesson.organizationId, input.organizationId),
        eq(hrmLmsLesson.courseId, input.courseId)
      )
    )
    .orderBy(asc(hrmLmsLesson.sortOrder), asc(hrmLmsLesson.code))

  return rows
}
