"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type {
  RecordFhcHealthFormState,
  RecordFhcTrainingFormState,
  SubmitFhcPermitFormState,
} from "../../../_core/shared"
import {
  recordFhcTrainingCompletion,
  submitFhcFoodHandlerPermit,
  submitFhcHealthCertificate,
} from "../data/fhc-records.server"
import {
  recordFhcHealthFormSchema,
  recordFhcTrainingFormSchema,
  submitFhcPermitFormSchema,
} from "../schemas/fhc.schema"

export async function submitFhcPermitFormAction(
  _prev: SubmitFhcPermitFormState | undefined,
  formData: FormData
): Promise<SubmitFhcPermitFormState> {
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
      form: "You are not authorized to submit food handler permits.",
    })
  }

  const parsed = submitFhcPermitFormSchema.safeParse({
    obligationId: formData.get("obligationId"),
    permitNumber: formData.get("permitNumber"),
    issuingAuthority: formData.get("issuingAuthority") || null,
    issueDate: formData.get("issueDate") || null,
    expiryDate: formData.get("expiryDate") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({
      form: parsed.error.issues[0]?.message,
    })
  }

  const result = await submitFhcFoodHandlerPermit({
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

async function requireFhcUpdatePermission(input: {
  organizationId: string
  userId: string
  errorMessage: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "food_handler_compliance",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({ form: input.errorMessage })
  }
  return null
}

export async function recordFhcTrainingFormAction(
  _prev: RecordFhcTrainingFormState | undefined,
  formData: FormData
): Promise<RecordFhcTrainingFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireFhcUpdatePermission({
    organizationId,
    userId,
    errorMessage: "You are not authorized to record training completions.",
  })
  if (denied) return denied

  const parsed = recordFhcTrainingFormSchema.safeParse({
    obligationId: formData.get("obligationId"),
    trainingType: formData.get("trainingType"),
    completedAt: formData.get("completedAt"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const completedAt = new Date(parsed.data.completedAt)
  if (Number.isNaN(completedAt.getTime())) {
    return hrmActionFailure({ form: "Completion date is invalid." })
  }

  const result = await recordFhcTrainingCompletion({
    organizationId,
    userId,
    obligationId: parsed.data.obligationId,
    trainingType: parsed.data.trainingType,
    completedAt,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true }
}

export async function recordFhcHealthFormAction(
  _prev: RecordFhcHealthFormState | undefined,
  formData: FormData
): Promise<RecordFhcHealthFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireFhcUpdatePermission({
    organizationId,
    userId,
    errorMessage: "You are not authorized to submit health certificates.",
  })
  if (denied) return denied

  const parsed = recordFhcHealthFormSchema.safeParse({
    obligationId: formData.get("obligationId"),
    certificateRef: formData.get("certificateRef") || null,
    issuedAt: formData.get("issuedAt") || null,
    expiresAt: formData.get("expiresAt") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
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

  const result = await submitFhcHealthCertificate({
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
