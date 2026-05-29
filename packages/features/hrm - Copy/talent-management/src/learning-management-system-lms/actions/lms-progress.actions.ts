"use server"

import { after } from "next/server"
import { and, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmLmsEnrollment } from "@afenda/platform/db/schema"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import { revalidateLmsPage } from "../data/lms-action-guard.server"
import { requireLmsLearnerOrManageForm } from "../data/lms-learner-guard.server"
import { advanceLmsLessonProgress } from "../data/lms-progress.mutations.server"
import type { LmsMutationFormState } from "../data/lms.types.shared"
import { HRM_LMS_AUDIT } from "../lms.contract"
import { advanceLmsLessonFormSchema } from "../schemas/lms.schema"
import { completeBoardingTasksForLmsCourseCompletion } from "@afenda/feature-hrm-employee-management/server"

export async function advanceLmsLessonAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsLearnerOrManageForm(formData)
  if (!gate.ok) return gate.response

  const parsed = advanceLmsLessonFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    enrollmentId: formData.get("enrollmentId"),
    lessonId: formData.get("lessonId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid lesson progress payload." })
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
        form: "You can only update progress on your own enrollments.",
      })
    }
  }

  const result = await advanceLmsLessonProgress({
    organizationId,
    enrollmentId: parsed.data.enrollmentId,
    lessonId: parsed.data.lessonId,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.message })
  }

  if (result.transitionedToCompleted) {
    after(() =>
      completeBoardingTasksForLmsCourseCompletion({
        organizationId,
        employeeId: result.employeeId,
        courseId: result.courseId,
        actorUserId: session.userId,
      })
    )
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.progressUpdate,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_progress",
      resourceId: parsed.data.enrollmentId,
      metadata: { lessonId: parsed.data.lessonId },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: parsed.data.enrollmentId }
}

export async function submitAdvanceLmsLesson(formData: FormData) {
  await advanceLmsLessonAction(formData)
}
