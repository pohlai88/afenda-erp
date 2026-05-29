"use server"

import { after } from "next/server"
import { and, eq, max } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmLmsCourse, hrmLmsCourseContentRef } from "@afenda/platform/db/schema"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import {
  revalidateLmsPage,
  requireLmsFormPermission,
} from "../data/lms-action-guard.server"
import type { LmsMutationFormState } from "../data/lms.types.shared"
import { HRM_LMS_AUDIT } from "../lms.contract"
import { createLmsContentRefFormSchema } from "../schemas/lms.schema"

function normalizeOptionalUrl(value: string | undefined): string | null {
  if (!value?.trim()) return null
  try {
    return new URL(value.trim()).toString()
  } catch {
    return null
  }
}

export async function createLmsContentRefAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "create")
  if (!gate.ok) return gate.response

  const launchRaw = String(formData.get("launchUrl") ?? "").trim()
  const parsed = createLmsContentRefFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    courseId: formData.get("courseId"),
    refType: formData.get("refType") || "internal",
    label: formData.get("label"),
    launchUrl: launchRaw || undefined,
    packageRef: formData.get("packageRef") || undefined,
    contentStandard: formData.get("contentStandard") || undefined,
    enabled: formData.get("enabled")?.toString(),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid content reference payload." })
  }

  const launchUrl = normalizeOptionalUrl(parsed.data.launchUrl)
  if (launchRaw && !launchUrl) {
    return hrmActionFailure({ form: "Launch URL must be a valid URL." })
  }

  const { session } = gate
  const organizationId = session.organizationId
  const courseId = parsed.data.courseId

  const [course] = await db
    .select({ id: hrmLmsCourse.id })
    .from(hrmLmsCourse)
    .where(
      and(
        eq(hrmLmsCourse.organizationId, organizationId),
        eq(hrmLmsCourse.id, courseId)
      )
    )
    .limit(1)
  if (!course) {
    return hrmActionFailure({ form: "Course not found.", courseId: "Invalid" })
  }

  const [orderRow] = await db
    .select({ maxOrder: max(hrmLmsCourseContentRef.sortOrder) })
    .from(hrmLmsCourseContentRef)
    .where(
      and(
        eq(hrmLmsCourseContentRef.organizationId, organizationId),
        eq(hrmLmsCourseContentRef.courseId, courseId)
      )
    )

  const nextOrder = (orderRow?.maxOrder ?? -1) + 1

  const [row] = await db
    .insert(hrmLmsCourseContentRef)
    .values({
      organizationId,
      courseId,
      refType: parsed.data.refType,
      label: parsed.data.label,
      launchUrl,
      packageRef: parsed.data.packageRef ?? null,
      contentStandard: parsed.data.contentStandard ?? null,
      enabled: parsed.data.enabled,
      sortOrder: nextOrder,
    })
    .returning({ id: hrmLmsCourseContentRef.id })

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.contentRefCreate,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_course_content_ref",
      resourceId: row?.id ?? "",
      metadata: {
        courseId,
        refType: parsed.data.refType,
      },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: row?.id }
}

export async function submitCreateLmsContentRef(formData: FormData) {
  await createLmsContentRefAction(formData)
}
