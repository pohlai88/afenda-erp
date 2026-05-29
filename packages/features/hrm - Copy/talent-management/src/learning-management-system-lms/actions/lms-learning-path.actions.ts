"use server"

import { after } from "next/server"
import { and, eq, max } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmLmsCourse,
  hrmLmsLearningPath,
  hrmLmsPathCourse,
} from "@afenda/platform/db/schema"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import {
  revalidateLmsPage,
  requireLmsFormPermission,
} from "../data/lms-action-guard.server"
import type { LmsMutationFormState } from "../data/lms.types.shared"
import { isPostgresUniqueViolation } from "../lms-db.shared"
import { HRM_LMS_AUDIT } from "../lms.contract"
import {
  addLmsPathCourseFormSchema,
  createLmsLearningPathFormSchema,
  normalizeLmsPathCode,
  updateLmsLearningPathFormSchema,
} from "../schemas/lms.schema"

export async function createLmsLearningPathAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "create")
  if (!gate.ok) return gate.response

  const parsed = createLmsLearningPathFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    code: formData.get("code"),
    name: formData.get("name"),
    pathType: formData.get("pathType") || "role",
    description: formData.get("description") || undefined,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid learning path payload." })
  }

  const { session } = gate
  const code = normalizeLmsPathCode(parsed.data.code)
  const organizationId = session.organizationId
  const userId = session.userId

  let row: { id: string } | undefined
  try {
    ;[row] = await db
      .insert(hrmLmsLearningPath)
      .values({
        organizationId,
        code,
        name: parsed.data.name,
        pathType: parsed.data.pathType,
        description: parsed.data.description ?? null,
        state: "active",
        createdByUserId: userId,
        updatedByUserId: userId,
      })
      .returning({ id: hrmLmsLearningPath.id })
  } catch (err) {
    if (isPostgresUniqueViolation(err)) {
      return hrmActionFailure({
        form: "A learning path with this code already exists.",
        code: "Duplicate",
      })
    }
    throw err
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.learningPathCreate,
      actorUserId: userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_learning_path",
      resourceId: row?.id ?? "",
      metadata: { code, pathType: parsed.data.pathType },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: row?.id }
}

export async function updateLmsLearningPathAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "update")
  if (!gate.ok) return gate.response

  const parsed = updateLmsLearningPathFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    learningPathId: formData.get("learningPathId"),
    name: formData.get("name"),
    pathType: formData.get("pathType"),
    description: formData.get("description") || undefined,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid learning path update payload." })
  }

  const { session } = gate
  const organizationId = session.organizationId
  const { learningPathId } = parsed.data

  const [updated] = await db
    .update(hrmLmsLearningPath)
    .set({
      name: parsed.data.name,
      pathType: parsed.data.pathType,
      description: parsed.data.description ?? null,
      updatedAt: new Date(),
      updatedByUserId: session.userId,
    })
    .where(
      and(
        eq(hrmLmsLearningPath.organizationId, organizationId),
        eq(hrmLmsLearningPath.id, learningPathId),
        eq(hrmLmsLearningPath.state, "active")
      )
    )
    .returning({ id: hrmLmsLearningPath.id, code: hrmLmsLearningPath.code })

  if (!updated) {
    return hrmActionFailure({
      form: "Learning path not found.",
      learningPathId: "Invalid",
    })
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.learningPathUpdate,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_learning_path",
      resourceId: learningPathId,
      metadata: { code: updated.code, pathType: parsed.data.pathType },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: learningPathId }
}

export async function archiveLmsLearningPathAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "update")
  if (!gate.ok) return gate.response

  const organizationId = gate.session.organizationId
  const learningPathId = String(formData.get("learningPathId") ?? "")
  if (!learningPathId) {
    return hrmActionFailure({
      form: "Learning path is required.",
      learningPathId: "Required",
    })
  }

  const [updated] = await db
    .update(hrmLmsLearningPath)
    .set({
      state: "archived",
      updatedAt: new Date(),
      updatedByUserId: gate.session.userId,
    })
    .where(
      and(
        eq(hrmLmsLearningPath.organizationId, organizationId),
        eq(hrmLmsLearningPath.id, learningPathId)
      )
    )
    .returning({ id: hrmLmsLearningPath.id })

  if (!updated) {
    return hrmActionFailure({
      form: "Learning path not found.",
      learningPathId: "Invalid",
    })
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.learningPathDeprecate,
      actorUserId: gate.session.userId,
      actorSessionId: gate.session.sessionId,
      organizationId,
      resourceType: "hrm_lms_learning_path",
      resourceId: learningPathId,
      metadata: {},
    })
  )

  revalidateLmsPage()
  return { ok: true, id: learningPathId }
}

export async function addLmsPathCourseAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "create")
  if (!gate.ok) return gate.response

  const parsed = addLmsPathCourseFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    learningPathId: formData.get("learningPathId"),
    courseId: formData.get("courseId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid path course payload." })
  }

  const { session } = gate
  const organizationId = session.organizationId
  const { learningPathId, courseId } = parsed.data

  const [[path], [course]] = await Promise.all([
    db
      .select({ id: hrmLmsLearningPath.id, state: hrmLmsLearningPath.state })
      .from(hrmLmsLearningPath)
      .where(
        and(
          eq(hrmLmsLearningPath.organizationId, organizationId),
          eq(hrmLmsLearningPath.id, learningPathId)
        )
      )
      .limit(1),
    db
      .select({ id: hrmLmsCourse.id, state: hrmLmsCourse.state })
      .from(hrmLmsCourse)
      .where(
        and(
          eq(hrmLmsCourse.organizationId, organizationId),
          eq(hrmLmsCourse.id, courseId)
        )
      )
      .limit(1),
  ])

  if (!path || path.state === "archived") {
    return hrmActionFailure({
      form: "Learning path not found.",
      learningPathId: "Invalid",
    })
  }
  if (!course || course.state === "archived") {
    return hrmActionFailure({
      form: "Course not found or archived.",
      courseId: "Invalid",
    })
  }

  const [orderRow] = await db
    .select({ maxOrder: max(hrmLmsPathCourse.sortOrder) })
    .from(hrmLmsPathCourse)
    .where(
      and(
        eq(hrmLmsPathCourse.organizationId, organizationId),
        eq(hrmLmsPathCourse.learningPathId, learningPathId)
      )
    )

  const nextOrder = (orderRow?.maxOrder ?? -1) + 1

  let row: { id: string } | undefined
  try {
    ;[row] = await db
      .insert(hrmLmsPathCourse)
      .values({
        organizationId,
        learningPathId,
        courseId,
        sortOrder: nextOrder,
      })
      .returning({ id: hrmLmsPathCourse.id })
  } catch (err) {
    if (isPostgresUniqueViolation(err)) {
      return hrmActionFailure({
        form: "This course is already on the learning path.",
        courseId: "Duplicate",
      })
    }
    throw err
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.pathCourseCreate,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_path_course",
      resourceId: row?.id ?? "",
      metadata: { learningPathId, courseId, sortOrder: nextOrder },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: row?.id }
}

export async function removeLmsPathCourseAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "update")
  if (!gate.ok) return gate.response

  const organizationId = gate.session.organizationId
  const pathCourseId = String(formData.get("pathCourseId") ?? "")
  if (!pathCourseId) {
    return hrmActionFailure({
      form: "Path course row is required.",
      pathCourseId: "Required",
    })
  }

  const [deleted] = await db
    .delete(hrmLmsPathCourse)
    .where(
      and(
        eq(hrmLmsPathCourse.organizationId, organizationId),
        eq(hrmLmsPathCourse.id, pathCourseId)
      )
    )
    .returning({ id: hrmLmsPathCourse.id })

  if (!deleted) {
    return hrmActionFailure({
      form: "Path course not found.",
      pathCourseId: "Invalid",
    })
  }

  revalidateLmsPage()
  return { ok: true, id: pathCourseId }
}

export async function submitCreateLmsLearningPath(formData: FormData) {
  await createLmsLearningPathAction(formData)
}

export async function submitUpdateLmsLearningPath(formData: FormData) {
  await updateLmsLearningPathAction(formData)
}

export async function submitArchiveLmsLearningPath(formData: FormData) {
  await archiveLmsLearningPathAction(formData)
}

export async function submitAddLmsPathCourse(formData: FormData) {
  await addLmsPathCourseAction(formData)
}

export async function submitRemoveLmsPathCourse(formData: FormData) {
  await removeLmsPathCourseAction(formData)
}
