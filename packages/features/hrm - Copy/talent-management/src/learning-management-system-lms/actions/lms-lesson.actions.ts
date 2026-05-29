"use server"

import { after } from "next/server"
import { and, eq, max } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmLmsLesson } from "@afenda/platform/db/schema"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import {
  revalidateLmsPage,
  requireLmsFormPermission,
} from "../data/lms-action-guard.server"
import type { LmsMutationFormState } from "../data/lms.types.shared"
import { isPostgresUniqueViolation } from "../lms-db.shared"
import { HRM_LMS_AUDIT } from "../lms.contract"
import {
  createLmsLessonFormSchema,
  normalizeLmsLessonCode,
} from "../schemas/lms.schema"

export async function createLmsLessonAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "update")
  if (!gate.ok) return gate.response

  const parsed = createLmsLessonFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    courseId: formData.get("courseId"),
    code: formData.get("code"),
    title: formData.get("title"),
    estimatedMinutes: formData.get("estimatedMinutes") || undefined,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid lesson payload." })
  }

  const { session } = gate
  const organizationId = session.organizationId
  const code = normalizeLmsLessonCode(parsed.data.code)

  const [maxOrder] = await db
    .select({ value: max(hrmLmsLesson.sortOrder) })
    .from(hrmLmsLesson)
    .where(
      and(
        eq(hrmLmsLesson.organizationId, organizationId),
        eq(hrmLmsLesson.courseId, parsed.data.courseId)
      )
    )

  const sortOrder = Number(maxOrder?.value ?? -1) + 1

  let row: { id: string } | undefined
  try {
    ;[row] = await db
      .insert(hrmLmsLesson)
      .values({
        organizationId,
        courseId: parsed.data.courseId,
        code,
        title: parsed.data.title,
        sortOrder,
        estimatedMinutes: parsed.data.estimatedMinutes ?? null,
      })
      .returning({ id: hrmLmsLesson.id })
  } catch (error) {
    if (isPostgresUniqueViolation(error)) {
      return hrmActionFailure({
        form: "Lesson code already exists on this course.",
        code: "Duplicate",
      })
    }
    throw error
  }

  const lessonId = row?.id ?? ""
  if (!lessonId) {
    return hrmActionFailure({ form: "Could not create lesson." })
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.lessonCreate,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_lesson",
      resourceId: lessonId,
      metadata: { courseId: parsed.data.courseId, code },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: lessonId }
}

export async function submitCreateLmsLesson(formData: FormData) {
  await createLmsLessonAction(formData)
}
