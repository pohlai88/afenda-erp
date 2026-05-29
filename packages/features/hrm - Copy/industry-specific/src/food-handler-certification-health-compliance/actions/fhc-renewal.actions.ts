"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type {
  SubmitFhcHealthRenewalFormState,
  SubmitFhcPermitRenewalFormState,
} from "@afenda/feature-hrm-core/shared"
import {
  submitFhcHealthRenewal,
  submitFhcPermitRenewal,
} from "../data/fhc-renewal.server"
import {
  submitFhcHealthRenewalFormSchema,
  submitFhcPermitRenewalFormSchema,
} from "../schemas/fhc.schema"

export async function submitFhcPermitRenewalFormAction(
  _prev: SubmitFhcPermitRenewalFormState | undefined,
  formData: FormData
): Promise<SubmitFhcPermitRenewalFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "food_handler_compliance",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to submit permit renewals.",
    })
  }

  const parsed = submitFhcPermitRenewalFormSchema.safeParse({
    obligationId: formData.get("obligationId"),
    permitNumber: formData.get("permitNumber"),
    issuingAuthority: formData.get("issuingAuthority") || null,
    issueDate: formData.get("issueDate") || null,
    expiryDate: formData.get("expiryDate") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await submitFhcPermitRenewal({
    organizationId,
    userId,
    obligationId: parsed.data.obligationId,
    permitNumber: parsed.data.permitNumber,
    issuingAuthority: parsed.data.issuingAuthority?.trim() || null,
    issueDate: parsed.data.issueDate || null,
    expiryDate: parsed.data.expiryDate || null,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, permitId: result.permitId }
}

export async function submitFhcHealthRenewalFormAction(
  _prev: SubmitFhcHealthRenewalFormState | undefined,
  formData: FormData
): Promise<SubmitFhcHealthRenewalFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "food_handler_compliance",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to submit health certificate renewals.",
    })
  }

  const canAudit = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "food_handler_compliance",
      function: "audit",
    },
  })

  const parsed = submitFhcHealthRenewalFormSchema.safeParse({
    obligationId: formData.get("obligationId"),
    certificateRef: formData.get("certificateRef") || null,
    issuedAt: formData.get("issuedAt") || null,
    expiresAt: formData.get("expiresAt") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await submitFhcHealthRenewal({
    organizationId,
    userId,
    obligationId: parsed.data.obligationId,
    certificateRef: parsed.data.certificateRef?.trim() || null,
    issuedAt: parsed.data.issuedAt || null,
    expiresAt: parsed.data.expiresAt || null,
    canPersistHealthCertificateRef: canAudit,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, certificateId: result.certificateId }
}
