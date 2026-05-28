"use server"

import { after } from "next/server"
import { and, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmLmsAssessment, hrmLmsEnrollment } from "@afenda/platform/db/schema"

import { hrmActionFailure } from "../../../_core/governance"
import {
  revalidateLmsPage,
  requireLmsFormPermission,
} from "../data/lms-action-guard.server"
import { submitLmsAssessmentAttempt as recordLmsAssessmentAttempt } from "../data/lms-assessment.mutations.server"
import { requireLmsLearnerOrManageForm } from "../data/lms-learner-guard.server"
import type { LmsMutationFormState } from "../data/lms.types.shared"
import { isPostgresUniqueViolation } from "../lms-db.shared"
import { HRM_LMS_AUDIT } from "../lms.contract"
import {
  createLmsAssessmentFormSchema,
  normalizeLmsLessonCode,
  submitLmsAssessmentAttemptFormSchema,
} from "../schemas/lms.schema"

export async function createLmsAssessmentAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "update")
  if (!gate.ok) return gate.response

  const parsed = createLmsAssessmentFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    courseId: formData.get("courseId"),
    code: formData.get("code"),
    title: formData.get("title"),
    passingScore: formData.get("passingScore") || 70,
    maxAttempts: formData.get("maxAttempts") || 3,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid assessment payload." })
  }

  const { session } = gate
  const organizationId = session.organizationId
  const code = normalizeLmsLessonCode(parsed.data.code)

  let row: { id: string } | undefined
  try {
    ;[row] = await db
      .insert(hrmLmsAssessment)
      .values({
        organizationId,
        courseId: parsed.data.courseId,
        code,
        title: parsed.data.title,
        passingScore: parsed.data.passingScore,
        maxAttempts: parsed.data.maxAttempts,
      })
      .returning({ id: hrmLmsAssessment.id })
  } catch (error) {
    if (isPostgresUniqueViolation(error)) {
      return hrmActionFailure({
        form: "Assessment code already exists on this course.",
        code: "Duplicate",
      })
    }
    throw error
  }

  const assessmentId = row?.id ?? ""
  if (!assessmentId) {
    return hrmActionFailure({ form: "Could not create assessment." })
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.assessmentCreate,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_assessment",
      resourceId: assessmentId,
      metadata: { courseId: parsed.data.courseId, code },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: assessmentId }
}

export async function submitLmsAssessmentAttemptAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsLearnerOrManageForm(formData)
  if (!gate.ok) return gate.response

  const parsed = submitLmsAssessmentAttemptFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    enrollmentId: formData.get("enrollmentId"),
    assessmentId: formData.get("assessmentId"),
    score: formData.get("score"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid assessment attempt payload." })
  }

  const { session, canManage, employeeId } = gate
  const organizationId = session.organizationId

  if (!canManage && employeeId) {
    const [owned] = await db
      .select({ id: hrmLmsEnrollment.id })
      .from(hrmLmsEnrollment)
      .where(
        and(
          eq(hrmLmsEnrollment.organizationId, organizationId),
          eq(hrmLmsEnrollment.id, parsed.data.enrollmentId),
          eq(hrmLmsEnrollment.employeeId, employeeId)
        )
      )
      .limit(1)
    if (!owned) {
      return hrmActionFailure({
        form: "You can only submit attempts for your own enrollments.",
      })
    }
  }

  const result = await recordLmsAssessmentAttempt({
    organizationId,
    assessmentId: parsed.data.assessmentId,
    enrollmentId: parsed.data.enrollmentId,
    score: parsed.data.score,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.message })
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.assessmentAttemptCreate,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_assessment_attempt",
      resourceId: result.attemptId,
      metadata: {
        result: result.result,
        enrollmentId: parsed.data.enrollmentId,
      },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: result.attemptId }
}

export async function submitCreateLmsAssessment(formData: FormData) {
  await createLmsAssessmentAction(formData)
}

export async function submitLmsAssessmentAttempt(formData: FormData) {
  await submitLmsAssessmentAttemptAction(formData)
}
