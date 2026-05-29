import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@afenda/platform/db"
import {
  hrmLmsAssignment,
  hrmLmsCourse,
  hrmLmsEnrollment,
  hrmLmsLearningPath,
  hrmLmsProgress,
} from "@afenda/platform/db/schema"

import type { HrmLmsEnrollmentApprovalState } from "../schemas/lms-workflow-state.shared"

export type LmsAssignTarget =
  | { kind: "course"; courseId: string }
  | { kind: "path"; learningPathId: string }

export type CreateLmsEnrollmentBundleInput = {
  organizationId: string
  employeeId: string
  actorUserId: string
  target: LmsAssignTarget
  mandatory: boolean
  withAssignment: boolean
  approvalState: HrmLmsEnrollmentApprovalState
}

export type CreateLmsEnrollmentBundleResult =
  | {
      ok: true
      assignmentId: string | null
      enrollmentId: string
      progressCreated: boolean
    }
  | { ok: false; message: string }

async function findOpenEnrollment(input: {
  organizationId: string
  employeeId: string
  target: LmsAssignTarget
}): Promise<{ id: string } | undefined> {
  const base = and(
    eq(hrmLmsEnrollment.organizationId, input.organizationId),
    eq(hrmLmsEnrollment.employeeId, input.employeeId)
  )
  const where =
    input.target.kind === "course"
      ? and(base, eq(hrmLmsEnrollment.courseId, input.target.courseId))
      : and(
          base,
          eq(hrmLmsEnrollment.learningPathId, input.target.learningPathId)
        )

  const [row] = await db
    .select({ id: hrmLmsEnrollment.id })
    .from(hrmLmsEnrollment)
    .where(where)
    .limit(1)

  return row
}

export async function createLmsEnrollmentBundle(
  input: CreateLmsEnrollmentBundleInput
): Promise<CreateLmsEnrollmentBundleResult> {
  const existing = await findOpenEnrollment({
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    target: input.target,
  })
  if (existing) {
    return {
      ok: false,
      message: "Employee already has an enrollment for this target.",
    }
  }

  return db.transaction(async (tx) => {
    let assignmentId: string | null = null

    if (input.withAssignment) {
      const [assignment] = await tx
        .insert(hrmLmsAssignment)
        .values({
          organizationId: input.organizationId,
          employeeId: input.employeeId,
          courseId:
            input.target.kind === "course" ? input.target.courseId : null,
          learningPathId:
            input.target.kind === "path" ? input.target.learningPathId : null,
          mandatory: input.mandatory,
          assignedByUserId: input.actorUserId,
        })
        .returning({ id: hrmLmsAssignment.id })
      assignmentId = assignment?.id ?? null
    }

    const [enrollment] = await tx
      .insert(hrmLmsEnrollment)
      .values({
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        assignmentId,
        courseId: input.target.kind === "course" ? input.target.courseId : null,
        learningPathId:
          input.target.kind === "path" ? input.target.learningPathId : null,
        approvalState: input.approvalState,
        enrolledByUserId: input.actorUserId,
      })
      .returning({ id: hrmLmsEnrollment.id })

    const enrollmentId = enrollment?.id ?? ""
    let progressCreated = false

    if (input.approvalState === "approved" && enrollmentId) {
      await tx.insert(hrmLmsProgress).values({
        organizationId: input.organizationId,
        enrollmentId,
        status: "not_started",
      })
      progressCreated = true
    }

    return {
      ok: true,
      assignmentId,
      enrollmentId,
      progressCreated,
    }
  })
}

export async function loadLmsCourseAssignContext(
  organizationId: string,
  courseId: string
): Promise<
  | {
      ok: true
      selfEnrollAllowed: boolean
      approvalRequired: boolean
      complianceMandatory: boolean
      state: string
    }
  | { ok: false }
> {
  const [course] = await db
    .select({
      selfEnrollAllowed: hrmLmsCourse.selfEnrollAllowed,
      approvalRequired: hrmLmsCourse.approvalRequired,
      complianceMandatory: hrmLmsCourse.complianceMandatory,
      state: hrmLmsCourse.state,
    })
    .from(hrmLmsCourse)
    .where(
      and(
        eq(hrmLmsCourse.organizationId, organizationId),
        eq(hrmLmsCourse.id, courseId)
      )
    )
    .limit(1)

  if (!course || course.state === "archived") return { ok: false }
  return { ok: true, ...course }
}

export async function loadLmsPathAssignContext(
  organizationId: string,
  learningPathId: string
): Promise<{ ok: true; state: string } | { ok: false }> {
  const [path] = await db
    .select({ state: hrmLmsLearningPath.state })
    .from(hrmLmsLearningPath)
    .where(
      and(
        eq(hrmLmsLearningPath.organizationId, organizationId),
        eq(hrmLmsLearningPath.id, learningPathId)
      )
    )
    .limit(1)

  if (!path || path.state === "archived") return { ok: false }
  return { ok: true, state: path.state }
}

export async function approveLmsEnrollmentInTransaction(input: {
  organizationId: string
  enrollmentId: string
  actorUserId: string
}): Promise<{ ok: true } | { ok: false; message: string }> {
  return db.transaction(async (tx) => {
    const [enrollment] = await tx
      .update(hrmLmsEnrollment)
      .set({
        approvalState: "approved",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(hrmLmsEnrollment.organizationId, input.organizationId),
          eq(hrmLmsEnrollment.id, input.enrollmentId),
          eq(hrmLmsEnrollment.approvalState, "pending")
        )
      )
      .returning({ id: hrmLmsEnrollment.id })

    if (!enrollment) {
      return { ok: false, message: "Enrollment not found or not pending." }
    }

    const [existingProgress] = await tx
      .select({ id: hrmLmsProgress.id })
      .from(hrmLmsProgress)
      .where(eq(hrmLmsProgress.enrollmentId, enrollment.id))
      .limit(1)

    if (!existingProgress) {
      await tx.insert(hrmLmsProgress).values({
        organizationId: input.organizationId,
        enrollmentId: enrollment.id,
        status: "not_started",
      })
    }

    return { ok: true }
  })
}

export async function rejectLmsEnrollmentInTransaction(input: {
  organizationId: string
  enrollmentId: string
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const [updated] = await db
    .update(hrmLmsEnrollment)
    .set({
      approvalState: "rejected",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(hrmLmsEnrollment.organizationId, input.organizationId),
        eq(hrmLmsEnrollment.id, input.enrollmentId),
        eq(hrmLmsEnrollment.approvalState, "pending")
      )
    )
    .returning({ id: hrmLmsEnrollment.id })

  if (!updated) {
    return { ok: false, message: "Enrollment not found or not pending." }
  }
  return { ok: true }
}
