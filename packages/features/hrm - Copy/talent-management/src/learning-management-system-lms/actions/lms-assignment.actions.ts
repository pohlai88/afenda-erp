"use server"

import { after } from "next/server"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import {
  revalidateLmsPage,
  requireLmsFormPermission,
} from "../data/lms-action-guard.server"
import {
  createLmsEnrollmentBundle,
  loadLmsCourseAssignContext,
  loadLmsPathAssignContext,
} from "../data/lms-enrollment.mutations.server"
import type { LmsMutationFormState } from "../data/lms.types.shared"
import { HRM_LMS_AUDIT } from "../lms.contract"
import { assignLmsFormSchema } from "../schemas/lms.schema"

export async function assignLmsAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "create")
  if (!gate.ok) return gate.response

  const parsed = assignLmsFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    employeeId: formData.get("employeeId"),
    courseId: formData.get("courseId") || undefined,
    learningPathId: formData.get("learningPathId") || undefined,
    mandatory: formData.get("mandatory")?.toString(),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid assignment payload." })
  }

  const { session } = gate
  const organizationId = session.organizationId
  const userId = session.userId

  let mandatory = parsed.data.mandatory ?? false
  let approvalState: "approved" | "pending" = "approved"

  const target = parsed.data.courseId
    ? { kind: "course" as const, courseId: parsed.data.courseId }
    : {
        kind: "path" as const,
        learningPathId: parsed.data.learningPathId!,
      }

  if (target.kind === "course") {
    const course = await loadLmsCourseAssignContext(
      organizationId,
      target.courseId
    )
    if (!course.ok) {
      return hrmActionFailure({
        form: "Course not found.",
        courseId: "Invalid",
      })
    }
    if (course.complianceMandatory) mandatory = true
    if (course.approvalRequired) approvalState = "pending"
  } else {
    const path = await loadLmsPathAssignContext(
      organizationId,
      target.learningPathId
    )
    if (!path.ok) {
      return hrmActionFailure({
        form: "Learning path not found.",
        learningPathId: "Invalid",
      })
    }
  }

  const result = await createLmsEnrollmentBundle({
    organizationId,
    employeeId: parsed.data.employeeId,
    actorUserId: userId,
    target,
    mandatory,
    withAssignment: true,
    approvalState,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.message })
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.assignmentCreate,
      actorUserId: userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_assignment",
      resourceId: result.assignmentId ?? "",
      metadata: {
        employeeId: parsed.data.employeeId,
        courseId: parsed.data.courseId ?? null,
        learningPathId: parsed.data.learningPathId ?? null,
        mandatory,
      },
    })
  )

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.enrollmentCreate,
      actorUserId: userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_enrollment",
      resourceId: result.enrollmentId,
      metadata: { approvalState },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: result.enrollmentId }
}

export async function submitAssignLms(formData: FormData) {
  await assignLmsAction(formData)
}
