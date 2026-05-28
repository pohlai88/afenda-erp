"use server"

import { after } from "next/server"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"

import { findLeaveEmployeeForUser } from "../../../time-attendance/server"
import { hrmActionFailure } from "../../../_core/governance"
import {
  revalidateLmsPage,
  requireLmsFormPermission,
} from "../data/lms-action-guard.server"
import {
  approveLmsEnrollmentInTransaction,
  createLmsEnrollmentBundle,
  loadLmsCourseAssignContext,
  rejectLmsEnrollmentInTransaction,
} from "../data/lms-enrollment.mutations.server"
import type { LmsMutationFormState } from "../data/lms.types.shared"
import { HRM_LMS_AUDIT } from "../lms.contract"
import {
  lmsEnrollmentDecisionFormSchema,
  selfEnrollLmsCourseFormSchema,
} from "../schemas/lms.schema"

export async function selfEnrollLmsCourseAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "create")
  if (!gate.ok) return gate.response

  const parsed = selfEnrollLmsCourseFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    courseId: formData.get("courseId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid self-enrollment payload." })
  }

  const { session } = gate
  const organizationId = session.organizationId
  const employee = await findLeaveEmployeeForUser(
    organizationId,
    session.userId
  )
  if (!employee) {
    return hrmActionFailure({
      form: "No employee profile is linked to your account for this organization.",
    })
  }

  const course = await loadLmsCourseAssignContext(
    organizationId,
    parsed.data.courseId
  )
  if (!course.ok) {
    return hrmActionFailure({ form: "Course not found.", courseId: "Invalid" })
  }
  if (!course.selfEnrollAllowed) {
    return hrmActionFailure({
      form: "Self-enrollment is not enabled for this course.",
    })
  }

  const approvalState = course.approvalRequired ? "pending" : "approved"
  const mandatory = course.complianceMandatory

  const result = await createLmsEnrollmentBundle({
    organizationId,
    employeeId: employee.id,
    actorUserId: session.userId,
    target: { kind: "course", courseId: parsed.data.courseId },
    mandatory,
    withAssignment: false,
    approvalState,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.message })
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.enrollmentCreate,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_enrollment",
      resourceId: result.enrollmentId,
      metadata: { selfEnroll: true, approvalState },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: result.enrollmentId }
}

export async function approveLmsEnrollmentAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "update")
  if (!gate.ok) return gate.response

  const parsed = lmsEnrollmentDecisionFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    enrollmentId: formData.get("enrollmentId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid enrollment id." })
  }

  const { session } = gate
  const organizationId = session.organizationId
  const enrollmentId = parsed.data.enrollmentId

  const result = await approveLmsEnrollmentInTransaction({
    organizationId,
    enrollmentId,
    actorUserId: session.userId,
  })
  if (!result.ok) {
    return hrmActionFailure({
      form: result.message,
      enrollmentId: "Invalid",
    })
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.enrollmentApprove,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_enrollment",
      resourceId: enrollmentId,
      metadata: {},
    })
  )

  revalidateLmsPage()
  return { ok: true, id: enrollmentId }
}

export async function rejectLmsEnrollmentAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "update")
  if (!gate.ok) return gate.response

  const parsed = lmsEnrollmentDecisionFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    enrollmentId: formData.get("enrollmentId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid enrollment id." })
  }

  const { session } = gate
  const organizationId = session.organizationId
  const enrollmentId = parsed.data.enrollmentId

  const result = await rejectLmsEnrollmentInTransaction({
    organizationId,
    enrollmentId,
  })
  if (!result.ok) {
    return hrmActionFailure({
      form: result.message,
      enrollmentId: "Invalid",
    })
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.enrollmentReject,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_enrollment",
      resourceId: enrollmentId,
      metadata: {},
    })
  )

  revalidateLmsPage()
  return { ok: true, id: enrollmentId }
}

export async function submitSelfEnrollLmsCourse(formData: FormData) {
  await selfEnrollLmsCourseAction(formData)
}

export async function submitApproveLmsEnrollment(formData: FormData) {
  await approveLmsEnrollmentAction(formData)
}

export async function submitRejectLmsEnrollment(formData: FormData) {
  await rejectLmsEnrollmentAction(formData)
}
