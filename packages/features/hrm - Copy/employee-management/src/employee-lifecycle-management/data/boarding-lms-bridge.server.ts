import "server-only"

import { and, eq, inArray, sql } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmBoardingInstance,
  hrmBoardingTask,
  hrmLmsCourse,
} from "@afenda/platform/db/schema"

import { getLmsOnboardingCompletionSnapshot } from "@afenda/feature-hrm-talent-management/server"

import { transitionBoardingTask } from "./boarding.mutations.server"

/** HRM-LMS-022 consumer — onboarding learning completion rows for lifecycle surfaces. */
export async function listOnboardingLearningCompletionForEmployee(input: {
  readonly organizationId: string
  readonly employeeId: string
}) {
  return getLmsOnboardingCompletionSnapshot(input)
}

export async function summarizeOnboardingLearningCompletion(input: {
  readonly organizationId: string
  readonly employeeId: string
}): Promise<{
  readonly total: number
  readonly completed: number
  readonly inProgress: number
  readonly blocked: number
}> {
  const rows = await listOnboardingLearningCompletionForEmployee(input)
  let completed = 0
  let inProgress = 0
  let blocked = 0

  for (const row of rows) {
    if (row.status === "completed" || row.status === "renewed") {
      completed += 1
      continue
    }
    if (
      row.status === "failed" ||
      row.status === "overdue" ||
      row.status === "expired" ||
      row.status === "cancelled"
    ) {
      blocked += 1
      continue
    }
    inProgress += 1
  }

  return {
    total: rows.length,
    completed,
    inProgress,
    blocked,
  }
}

/**
 * When an LMS course completes, close matching onboarding boarding tasks
 * (metadata `lmsCourseCode` mirrors TRN `trainingCourseCode` bridge pattern).
 */
export async function completeBoardingTasksForLmsCourseCompletion(input: {
  readonly organizationId: string
  readonly employeeId: string
  readonly courseId: string
  readonly actorUserId: string
  readonly certificateRef?: string | null
}): Promise<{ completedTaskIds: string[] }> {
  const [course] = await db
    .select({ code: hrmLmsCourse.code })
    .from(hrmLmsCourse)
    .where(
      and(
        eq(hrmLmsCourse.organizationId, input.organizationId),
        eq(hrmLmsCourse.id, input.courseId)
      )
    )
    .limit(1)

  if (!course) {
    return { completedTaskIds: [] }
  }

  const tasks = await db
    .select({
      taskId: hrmBoardingTask.id,
      taskStatus: hrmBoardingTask.status,
    })
    .from(hrmBoardingTask)
    .innerJoin(
      hrmBoardingInstance,
      eq(hrmBoardingInstance.id, hrmBoardingTask.instanceId)
    )
    .where(
      and(
        eq(hrmBoardingTask.organizationId, input.organizationId),
        eq(hrmBoardingInstance.employeeId, input.employeeId),
        eq(hrmBoardingInstance.kind, "onboarding"),
        inArray(hrmBoardingTask.status, ["pending", "in_progress", "blocked"]),
        sql`${hrmBoardingTask.metadata}->>'lmsCourseCode' = ${course.code}`
      )
    )

  const completedTaskIds: string[] = []

  for (const task of tasks) {
    if (task.taskStatus === "completed" || task.taskStatus === "waived") {
      continue
    }
    const result = await transitionBoardingTask({
      organizationId: input.organizationId,
      taskId: task.taskId,
      actorUserId: input.actorUserId,
      action: "complete",
      evidenceDocumentId: undefined,
    })
    if (result.ok) {
      completedTaskIds.push(task.taskId)
    }
  }

  return { completedTaskIds }
}
