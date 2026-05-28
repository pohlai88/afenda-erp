import "server-only"

import { and, count, eq, isNotNull, sql, sum } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmTrainingAssignment,
  hrmTrainingCourse,
  hrmTrainingRecord,
} from "@afenda/platform/db/schema"

import { summarizeTrainingDevelopmentLmsCompletions } from "./training-lms-bridge.server"

export type TrainingCourseCompletionStat = {
  readonly courseId: string
  readonly courseCode: string
  readonly courseName: string
  readonly assignmentCount: number
  readonly completedCount: number
  readonly completionRate: number
}

export type TrainingAnalyticsSummary = {
  readonly totalAssignments: number
  readonly openAssignments: number
  readonly totalRecords: number
  readonly expiringWithin90Days: number
  readonly totalCostAmount: string | null
  readonly courseStats: readonly TrainingCourseCompletionStat[]
  /** HRM-LMS-023 — blended catalog rows linked via `trainingCourseId`. */
  readonly lmsLinkedCourseCount: number
  readonly lmsLinkedCompletedCount: number
  readonly lmsLinkedCertificateCount: number
}

export async function getTrainingAnalyticsSummary(
  organizationId: string
): Promise<TrainingAnalyticsSummary> {
  const [assignmentAgg, recordAgg, lmsLinkedSummary] = await Promise.all([
    db
      .select({
        total: count(),
        open: sql<number>`count(*) filter (where ${hrmTrainingAssignment.state} in ('assigned', 'overdue'))`,
      })
      .from(hrmTrainingAssignment)
      .where(eq(hrmTrainingAssignment.organizationId, organizationId))
      .then((rows) => rows[0]),
    db
      .select({
        total: count(),
        expiring: sql<number>`count(*) filter (where ${hrmTrainingRecord.expiresAt} is not null and ${hrmTrainingRecord.expiresAt} <= current_date + interval '90 days')`,
        cost: sum(hrmTrainingRecord.costAmount),
      })
      .from(hrmTrainingRecord)
      .where(eq(hrmTrainingRecord.organizationId, organizationId))
      .then((rows) => rows[0]),
    summarizeTrainingDevelopmentLmsCompletions({ organizationId }),
  ])

  const courses = await db
    .select({
      courseId: hrmTrainingCourse.id,
      courseCode: hrmTrainingCourse.code,
      courseName: hrmTrainingCourse.name,
    })
    .from(hrmTrainingCourse)
    .where(
      and(
        eq(hrmTrainingCourse.organizationId, organizationId),
        eq(hrmTrainingCourse.state, "active")
      )
    )

  const courseStats: TrainingCourseCompletionStat[] = []
  for (const course of courses) {
    const [assignments] = await db
      .select({ c: count() })
      .from(hrmTrainingAssignment)
      .where(
        and(
          eq(hrmTrainingAssignment.organizationId, organizationId),
          eq(hrmTrainingAssignment.courseId, course.courseId)
        )
      )

    const [completed] = await db
      .select({ c: count() })
      .from(hrmTrainingRecord)
      .where(
        and(
          eq(hrmTrainingRecord.organizationId, organizationId),
          eq(hrmTrainingRecord.courseId, course.courseId)
        )
      )

    const assignmentCount = Number(assignments?.c ?? 0)
    const completedCount = Number(completed?.c ?? 0)
    const completionRate =
      assignmentCount > 0
        ? Math.round((completedCount / assignmentCount) * 100)
        : completedCount > 0
          ? 100
          : 0

    courseStats.push({
      courseId: course.courseId,
      courseCode: course.courseCode,
      courseName: course.courseName,
      assignmentCount,
      completedCount,
      completionRate,
    })
  }

  courseStats.sort((a, b) => b.completionRate - a.completionRate)

  return {
    totalAssignments: Number(assignmentAgg?.total ?? 0),
    openAssignments: Number(assignmentAgg?.open ?? 0),
    totalRecords: Number(recordAgg?.total ?? 0),
    expiringWithin90Days: Number(recordAgg?.expiring ?? 0),
    totalCostAmount: recordAgg?.cost?.toString() ?? null,
    courseStats,
    lmsLinkedCourseCount: lmsLinkedSummary.linkedCourseCount,
    lmsLinkedCompletedCount: lmsLinkedSummary.completedCount,
    lmsLinkedCertificateCount: lmsLinkedSummary.withCertificateCount,
  }
}

export type TrainingFeedbackAggregate = {
  readonly courseId: string
  readonly courseCode: string
  readonly courseName: string
  readonly feedbackCount: number
  readonly averageRating: number | null
}

export async function listTrainingFeedbackAggregatesForOrg(
  organizationId: string
): Promise<readonly TrainingFeedbackAggregate[]> {
  const rows = await db
    .select({
      courseId: hrmTrainingRecord.courseId,
      courseCode: hrmTrainingCourse.code,
      courseName: hrmTrainingCourse.name,
      feedbackCount: count(hrmTrainingRecord.feedbackRating),
      averageRating: sql<
        number | null
      >`avg(${hrmTrainingRecord.feedbackRating})`,
    })
    .from(hrmTrainingRecord)
    .innerJoin(
      hrmTrainingCourse,
      eq(hrmTrainingCourse.id, hrmTrainingRecord.courseId)
    )
    .where(
      and(
        eq(hrmTrainingRecord.organizationId, organizationId),
        isNotNull(hrmTrainingRecord.feedbackRating)
      )
    )
    .groupBy(
      hrmTrainingRecord.courseId,
      hrmTrainingCourse.code,
      hrmTrainingCourse.name
    )

  return rows.map((row) => ({
    courseId: row.courseId,
    courseCode: row.courseCode,
    courseName: row.courseName,
    feedbackCount: Number(row.feedbackCount),
    averageRating:
      row.averageRating === null
        ? null
        : Math.round(row.averageRating * 10) / 10,
  }))
}
