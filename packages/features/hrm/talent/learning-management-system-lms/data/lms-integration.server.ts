import "server-only"

import { and, eq, isNotNull } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmLmsCertificate,
  hrmLmsCourse,
  hrmLmsEnrollment,
  hrmLmsLearningPath,
  hrmLmsProgress,
} from "@afenda/platform/db/schema"

import { resolveLmsProgressDisplayStatus } from "../lms-progress.shared"

function resolveProgressCompletedAt(
  status: string,
  updatedAt: Date
): string | null {
  if (status !== "completed" && status !== "renewed") {
    return null
  }
  return updatedAt.toISOString()
}

export type LmsComplianceMandatoryCompletionRow = {
  readonly employeeId: string
  readonly courseId: string
  readonly courseCode: string
  readonly status: string
  readonly completedAt: string | null
}

export type LmsOnboardingLearningCompletionRow = {
  readonly employeeId: string
  readonly learningPathId: string | null
  readonly courseId: string | null
  readonly status: string
  readonly completedAt: string | null
}

export type LmsTrainingDevelopmentCompletionRef = {
  readonly employeeId: string
  readonly courseId: string
  readonly courseCode: string
  readonly certificateRef: string | null
  readonly completedAt: string | null
  readonly trainingCourseId: string | null
}

/** HRM-LMS-021 — mandatory training completion export for compliance module. */
export async function getLmsComplianceCompletionSnapshot(input: {
  organizationId: string
  employeeId?: string
}): Promise<readonly LmsComplianceMandatoryCompletionRow[]> {
  const employeeFilter =
    input.employeeId != null
      ? eq(hrmLmsEnrollment.employeeId, input.employeeId)
      : undefined

  const rows = await db
    .select({
      employeeId: hrmLmsEnrollment.employeeId,
      courseId: hrmLmsCourse.id,
      courseCode: hrmLmsCourse.code,
      status: hrmLmsProgress.status,
      percentComplete: hrmLmsProgress.percentComplete,
      enrolledAt: hrmLmsEnrollment.enrolledAt,
      validityDays: hrmLmsCourse.validityDays,
      progressUpdatedAt: hrmLmsProgress.updatedAt,
    })
    .from(hrmLmsProgress)
    .innerJoin(
      hrmLmsEnrollment,
      eq(hrmLmsProgress.enrollmentId, hrmLmsEnrollment.id)
    )
    .innerJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .where(
      and(
        eq(hrmLmsProgress.organizationId, input.organizationId),
        eq(hrmLmsEnrollment.approvalState, "approved"),
        eq(hrmLmsCourse.complianceMandatory, true),
        employeeFilter
      )
    )

  return rows.map((row) => {
    const displayStatus = resolveLmsProgressDisplayStatus({
      status: row.status,
      percentComplete: row.percentComplete,
      enrolledAt: row.enrolledAt,
      validityDays: row.validityDays,
    })
    return {
      employeeId: row.employeeId,
      courseId: row.courseId,
      courseCode: row.courseCode,
      status: displayStatus,
      completedAt: resolveProgressCompletedAt(
        row.status,
        row.progressUpdatedAt
      ),
    }
  })
}

/** HRM-LMS-022 — onboarding / lifecycle read contract. */
export async function getLmsOnboardingCompletionSnapshot(input: {
  organizationId: string
  employeeId: string
}): Promise<readonly LmsOnboardingLearningCompletionRow[]> {
  const rows = await db
    .select({
      employeeId: hrmLmsEnrollment.employeeId,
      learningPathId: hrmLmsEnrollment.learningPathId,
      courseId: hrmLmsEnrollment.courseId,
      status: hrmLmsProgress.status,
      percentComplete: hrmLmsProgress.percentComplete,
      enrolledAt: hrmLmsEnrollment.enrolledAt,
      validityDays: hrmLmsCourse.validityDays,
      progressUpdatedAt: hrmLmsProgress.updatedAt,
      pathType: hrmLmsLearningPath.pathType,
    })
    .from(hrmLmsEnrollment)
    .leftJoin(
      hrmLmsProgress,
      eq(hrmLmsProgress.enrollmentId, hrmLmsEnrollment.id)
    )
    .leftJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .leftJoin(
      hrmLmsLearningPath,
      eq(hrmLmsEnrollment.learningPathId, hrmLmsLearningPath.id)
    )
    .where(
      and(
        eq(hrmLmsEnrollment.organizationId, input.organizationId),
        eq(hrmLmsEnrollment.employeeId, input.employeeId),
        eq(hrmLmsEnrollment.approvalState, "approved")
      )
    )

  return rows
    .filter((row) => row.pathType === "onboarding")
    .map((row) => {
      const displayStatus = row.status
        ? resolveLmsProgressDisplayStatus({
            status: row.status,
            percentComplete: row.percentComplete ?? 0,
            enrolledAt: row.enrolledAt,
            validityDays: row.validityDays,
          })
        : "not_started"
      return {
        employeeId: row.employeeId,
        learningPathId: row.learningPathId,
        courseId: row.courseId,
        status: displayStatus,
        completedAt:
          row.status && row.progressUpdatedAt
            ? resolveProgressCompletedAt(row.status, row.progressUpdatedAt)
            : null,
      }
    })
}

/** HRM-LMS-023 — Training & Development read contract. */
export async function getLmsTrainingDevelopmentRefs(input: {
  organizationId: string
  employeeId?: string
}): Promise<readonly LmsTrainingDevelopmentCompletionRef[]> {
  const employeeFilter =
    input.employeeId != null
      ? eq(hrmLmsEnrollment.employeeId, input.employeeId)
      : undefined

  const rows = await db
    .select({
      employeeId: hrmLmsEnrollment.employeeId,
      courseId: hrmLmsCourse.id,
      courseCode: hrmLmsCourse.code,
      trainingCourseId: hrmLmsCourse.trainingCourseId,
      progressStatus: hrmLmsProgress.status,
      progressUpdatedAt: hrmLmsProgress.updatedAt,
      certificateRef: hrmLmsCertificate.certificateRef,
    })
    .from(hrmLmsProgress)
    .innerJoin(
      hrmLmsEnrollment,
      eq(hrmLmsProgress.enrollmentId, hrmLmsEnrollment.id)
    )
    .innerJoin(hrmLmsCourse, eq(hrmLmsEnrollment.courseId, hrmLmsCourse.id))
    .leftJoin(
      hrmLmsCertificate,
      eq(hrmLmsCertificate.enrollmentId, hrmLmsEnrollment.id)
    )
    .where(
      and(
        eq(hrmLmsProgress.organizationId, input.organizationId),
        eq(hrmLmsEnrollment.approvalState, "approved"),
        isNotNull(hrmLmsCourse.trainingCourseId),
        employeeFilter
      )
    )

  return rows.map((row) => ({
    employeeId: row.employeeId,
    courseId: row.courseId,
    courseCode: row.courseCode,
    certificateRef: row.certificateRef,
    completedAt: resolveProgressCompletedAt(
      row.progressStatus,
      row.progressUpdatedAt
    ),
    trainingCourseId: row.trainingCourseId,
  }))
}
