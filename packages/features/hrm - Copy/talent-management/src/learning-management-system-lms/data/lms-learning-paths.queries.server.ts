import "server-only"

import { and, asc, count, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmLmsCourse,
  hrmLmsLearningPath,
  hrmLmsPathCourse,
} from "@afenda/platform/db/schema"

import type {
  HrmLmsLearningPathRow,
  HrmLmsPathCourseRow,
} from "./lms.types.shared"

export async function listLmsLearningPathsForOrg(
  organizationId: string
): Promise<HrmLmsLearningPathRow[]> {
  const [paths, courseCounts] = await Promise.all([
    db
      .select({
        id: hrmLmsLearningPath.id,
        code: hrmLmsLearningPath.code,
        name: hrmLmsLearningPath.name,
        pathType: hrmLmsLearningPath.pathType,
        description: hrmLmsLearningPath.description,
        state: hrmLmsLearningPath.state,
      })
      .from(hrmLmsLearningPath)
      .where(eq(hrmLmsLearningPath.organizationId, organizationId))
      .orderBy(asc(hrmLmsLearningPath.name)),
    db
      .select({
        learningPathId: hrmLmsPathCourse.learningPathId,
        courseCount: count(),
      })
      .from(hrmLmsPathCourse)
      .where(eq(hrmLmsPathCourse.organizationId, organizationId))
      .groupBy(hrmLmsPathCourse.learningPathId),
  ])

  const countByPathId = new Map(
    courseCounts.map((row) => [row.learningPathId, Number(row.courseCount)])
  )

  return paths.map((path) => ({
    ...path,
    courseCount: countByPathId.get(path.id) ?? 0,
  }))
}

export async function listLmsPathCoursesForPath(input: {
  organizationId: string
  learningPathId: string
}): Promise<HrmLmsPathCourseRow[]> {
  return db
    .select({
      id: hrmLmsPathCourse.id,
      learningPathId: hrmLmsPathCourse.learningPathId,
      courseId: hrmLmsPathCourse.courseId,
      sortOrder: hrmLmsPathCourse.sortOrder,
      courseCode: hrmLmsCourse.code,
      courseTitle: hrmLmsCourse.title,
    })
    .from(hrmLmsPathCourse)
    .innerJoin(hrmLmsCourse, eq(hrmLmsPathCourse.courseId, hrmLmsCourse.id))
    .where(
      and(
        eq(hrmLmsPathCourse.organizationId, input.organizationId),
        eq(hrmLmsPathCourse.learningPathId, input.learningPathId)
      )
    )
    .orderBy(asc(hrmLmsPathCourse.sortOrder))
}
