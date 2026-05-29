"use server"

import { after } from "next/server"
import { and, eq } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmLmsCourse } from "@afenda/platform/db/schema"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import {
  revalidateLmsPage,
  requireLmsFormPermission,
} from "../data/lms-action-guard.server"
import type { LmsMutationFormState } from "../data/lms.types.shared"
import { isPostgresUniqueViolation } from "../lms-db.shared"
import { HRM_LMS_AUDIT } from "../lms.contract"
import {
  createLmsCourseFormSchema,
  normalizeLmsCourseCode,
  updateLmsCourseFormSchema,
} from "../schemas/lms.schema"

export async function createLmsCourseAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "create")
  if (!gate.ok) return gate.response

  const parsed = createLmsCourseFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    code: formData.get("code"),
    title: formData.get("title"),
    courseType: formData.get("courseType") || "online_course",
    category: formData.get("category") || undefined,
    description: formData.get("description") || undefined,
    provider: formData.get("provider") || undefined,
    durationMinutes: formData.get("durationMinutes") || undefined,
    level: formData.get("level") || undefined,
    language: formData.get("language") || undefined,
    deliveryMode: formData.get("deliveryMode") || "online",
    validityDays: formData.get("validityDays") || undefined,
    trainingCourseId: formData.get("trainingCourseId") || undefined,
    selfEnrollAllowed: formData.get("selfEnrollAllowed")?.toString(),
    approvalRequired: formData.get("approvalRequired")?.toString(),
    complianceMandatory: formData.get("complianceMandatory")?.toString(),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid course payload." })
  }

  const { session } = gate
  const code = normalizeLmsCourseCode(parsed.data.code)
  const organizationId = session.organizationId
  const userId = session.userId

  let row: { id: string } | undefined
  try {
    ;[row] = await db
      .insert(hrmLmsCourse)
      .values({
        organizationId,
        code,
        title: parsed.data.title,
        courseType: parsed.data.courseType,
        category: parsed.data.category ?? null,
        description: parsed.data.description ?? null,
        provider: parsed.data.provider ?? null,
        durationMinutes: parsed.data.durationMinutes ?? null,
        level: parsed.data.level ?? null,
        language: parsed.data.language ?? null,
        deliveryMode: parsed.data.deliveryMode,
        validityDays: parsed.data.validityDays ?? null,
        trainingCourseId: parsed.data.trainingCourseId ?? null,
        selfEnrollAllowed: parsed.data.selfEnrollAllowed,
        approvalRequired: parsed.data.approvalRequired,
        complianceMandatory: parsed.data.complianceMandatory,
        state: "active",
        createdByUserId: userId,
        updatedByUserId: userId,
      })
      .returning({ id: hrmLmsCourse.id })
  } catch (err) {
    if (isPostgresUniqueViolation(err)) {
      return hrmActionFailure({
        form: "A course with this code already exists.",
        code: "Duplicate",
      })
    }
    throw err
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.courseCreate,
      actorUserId: userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_course",
      resourceId: row?.id ?? "",
      metadata: { code, courseType: parsed.data.courseType },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: row?.id }
}

export async function updateLmsCourseAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "update")
  if (!gate.ok) return gate.response

  const parsed = updateLmsCourseFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    category: formData.get("category") || undefined,
    description: formData.get("description") || undefined,
    selfEnrollAllowed: formData.get("selfEnrollAllowed")?.toString(),
    approvalRequired: formData.get("approvalRequired")?.toString(),
    complianceMandatory: formData.get("complianceMandatory")?.toString(),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid course update payload." })
  }

  const { session } = gate
  const organizationId = session.organizationId
  const { courseId } = parsed.data

  const [updated] = await db
    .update(hrmLmsCourse)
    .set({
      title: parsed.data.title,
      category: parsed.data.category ?? null,
      description: parsed.data.description ?? null,
      selfEnrollAllowed: parsed.data.selfEnrollAllowed,
      approvalRequired: parsed.data.approvalRequired,
      complianceMandatory: parsed.data.complianceMandatory,
      updatedAt: new Date(),
      updatedByUserId: session.userId,
    })
    .where(
      and(
        eq(hrmLmsCourse.organizationId, organizationId),
        eq(hrmLmsCourse.id, courseId),
        eq(hrmLmsCourse.state, "active")
      )
    )
    .returning({ id: hrmLmsCourse.id, code: hrmLmsCourse.code })

  if (!updated) {
    return hrmActionFailure({ form: "Course not found.", courseId: "Invalid" })
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.courseUpdate,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_course",
      resourceId: courseId,
      metadata: { code: updated.code },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: courseId }
}

export async function archiveLmsCourseAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "update")
  if (!gate.ok) return gate.response

  const organizationId = gate.session.organizationId
  const courseId = String(formData.get("courseId") ?? "")
  if (!courseId) {
    return hrmActionFailure({
      form: "Course is required.",
      courseId: "Required",
    })
  }

  const [updated] = await db
    .update(hrmLmsCourse)
    .set({
      state: "archived",
      updatedAt: new Date(),
      updatedByUserId: gate.session.userId,
    })
    .where(
      and(
        eq(hrmLmsCourse.organizationId, organizationId),
        eq(hrmLmsCourse.id, courseId)
      )
    )
    .returning({ id: hrmLmsCourse.id })

  if (!updated) {
    return hrmActionFailure({ form: "Course not found.", courseId: "Invalid" })
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.courseDeprecate,
      actorUserId: gate.session.userId,
      actorSessionId: gate.session.sessionId,
      organizationId,
      resourceType: "hrm_lms_course",
      resourceId: courseId,
      metadata: {},
    })
  )

  revalidateLmsPage()
  return { ok: true, id: courseId }
}

export async function submitCreateLmsCourse(formData: FormData) {
  await createLmsCourseAction(formData)
}

export async function submitUpdateLmsCourse(formData: FormData) {
  await updateLmsCourseAction(formData)
}

export async function submitArchiveLmsCourse(formData: FormData) {
  await archiveLmsCourseAction(formData)
}
