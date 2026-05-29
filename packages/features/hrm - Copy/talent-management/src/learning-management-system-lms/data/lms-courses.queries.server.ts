import "server-only"

import { asc, count, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import { hrmLmsCourse, hrmLmsCourseContentRef } from "@afenda/platform/db/schema"

import type { HrmLmsCourseRow } from "./lms.types.shared"

export async function listLmsCoursesForOrg(
  organizationId: string
): Promise<HrmLmsCourseRow[]> {
  const [courses, refCounts] = await Promise.all([
    db
      .select({
        id: hrmLmsCourse.id,
        code: hrmLmsCourse.code,
        title: hrmLmsCourse.title,
        courseType: hrmLmsCourse.courseType,
        category: hrmLmsCourse.category,
        description: hrmLmsCourse.description,
        provider: hrmLmsCourse.provider,
        durationMinutes: hrmLmsCourse.durationMinutes,
        level: hrmLmsCourse.level,
        language: hrmLmsCourse.language,
        deliveryMode: hrmLmsCourse.deliveryMode,
        validityDays: hrmLmsCourse.validityDays,
        trainingCourseId: hrmLmsCourse.trainingCourseId,
        selfEnrollAllowed: hrmLmsCourse.selfEnrollAllowed,
        approvalRequired: hrmLmsCourse.approvalRequired,
        complianceMandatory: hrmLmsCourse.complianceMandatory,
        state: hrmLmsCourse.state,
      })
      .from(hrmLmsCourse)
      .where(eq(hrmLmsCourse.organizationId, organizationId))
      .orderBy(asc(hrmLmsCourse.title)),
    db
      .select({
        courseId: hrmLmsCourseContentRef.courseId,
        contentRefCount: count(),
      })
      .from(hrmLmsCourseContentRef)
      .where(eq(hrmLmsCourseContentRef.organizationId, organizationId))
      .groupBy(hrmLmsCourseContentRef.courseId),
  ])

  const countByCourseId = new Map(
    refCounts.map((row) => [row.courseId, Number(row.contentRefCount)])
  )

  return courses.map((course) => ({
    ...course,
    contentRefCount: countByCourseId.get(course.id) ?? 0,
  }))
}
