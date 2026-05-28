"use server"

import { after } from "next/server"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"

import { hrmActionFailure } from "../../../_core/governance"
import {
  revalidateLmsPage,
  requireLmsFormPermission,
} from "../data/lms-action-guard.server"
import {
  issueLmsCertificate,
  renewLmsCertificate,
} from "../data/lms-certificate.mutations.server"
import type { LmsMutationFormState } from "../data/lms.types.shared"
import { HRM_LMS_AUDIT } from "../lms.contract"
import {
  issueLmsCertificateFormSchema,
  renewLmsCertificateFormSchema,
} from "../schemas/lms.schema"

export async function issueLmsCertificateAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "update")
  if (!gate.ok) return gate.response

  const parsed = issueLmsCertificateFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    enrollmentId: formData.get("enrollmentId"),
    certificateRef: formData.get("certificateRef") || undefined,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid certificate issue payload." })
  }

  const { session } = gate
  const organizationId = session.organizationId

  const result = await issueLmsCertificate({
    organizationId,
    enrollmentId: parsed.data.enrollmentId,
    certificateRef: parsed.data.certificateRef,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.message })
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.certificateIssue,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_certificate",
      resourceId: result.certificateId,
      metadata: { enrollmentId: parsed.data.enrollmentId },
    })
  )

  revalidateLmsPage()
  return { ok: true, id: result.certificateId }
}

export async function renewLmsCertificateAction(
  formData: FormData
): Promise<LmsMutationFormState> {
  const gate = await requireLmsFormPermission(formData, "update")
  if (!gate.ok) return gate.response

  const parsed = renewLmsCertificateFormSchema.safeParse({
    organizationId: formData.get("organizationId"),
    orgSlug: formData.get("orgSlug"),
    certificateId: formData.get("certificateId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid certificate renewal payload." })
  }

  const { session } = gate
  const organizationId = session.organizationId

  const result = await renewLmsCertificate({
    organizationId,
    certificateId: parsed.data.certificateId,
  })
  if (!result.ok) {
    return hrmActionFailure({
      form: result.message,
      certificateId: "Invalid",
    })
  }

  after(() =>
    writeIamAuditEventFromNextHeaders({
      action: HRM_LMS_AUDIT.certificateRenew,
      actorUserId: session.userId,
      actorSessionId: session.sessionId,
      organizationId,
      resourceType: "hrm_lms_certificate",
      resourceId: parsed.data.certificateId,
      metadata: {},
    })
  )

  revalidateLmsPage()
  return { ok: true, id: parsed.data.certificateId }
}

export async function submitIssueLmsCertificate(formData: FormData) {
  await issueLmsCertificateAction(formData)
}

export async function submitRenewLmsCertificate(formData: FormData) {
  await renewLmsCertificateAction(formData)
}
