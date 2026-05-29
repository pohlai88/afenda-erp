"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type {
  RecordMscCertificationFormState,
  RecordMscTrainingFormState,
} from "../data/msc-form-state.shared"
import {
  recordMscSafetyCertification,
  recordMscTrainingCompletion,
} from "../data/msc-records.server"
import {
  recordMscCertificationFormSchema,
  recordMscTrainingFormSchema,
} from "../schemas/msc.schema"

async function requireMscUpdatePermission(input: {
  organizationId: string
  userId: string
  errorMessage: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "manufacturing_safety",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({ form: input.errorMessage })
  }
  return null
}

export async function recordMscTrainingFormAction(
  _prev: RecordMscTrainingFormState | undefined,
  formData: FormData
): Promise<RecordMscTrainingFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireMscUpdatePermission({
    organizationId,
    userId,
    errorMessage:
      "You are not authorized to record manufacturing safety training.",
  })
  if (denied) return denied

  const parsed = recordMscTrainingFormSchema.safeParse({
    obligationId: formData.get("obligationId"),
    trainingCategory: formData.get("trainingCategory"),
    completedAt: formData.get("completedAt"),
    ppeAcknowledged: formData.get("ppeAcknowledged") === "on",
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const completedAt = new Date(parsed.data.completedAt)
  if (Number.isNaN(completedAt.getTime())) {
    return hrmActionFailure({ form: "Completion date is invalid." })
  }

  const result = await recordMscTrainingCompletion({
    organizationId,
    userId,
    obligationId: parsed.data.obligationId,
    trainingCategory: parsed.data.trainingCategory,
    completedAt,
    ppeAcknowledged: parsed.data.ppeAcknowledged,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true }
}

export async function recordMscCertificationFormAction(
  _prev: RecordMscCertificationFormState | undefined,
  formData: FormData
): Promise<RecordMscCertificationFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireMscUpdatePermission({
    organizationId,
    userId,
    errorMessage:
      "You are not authorized to record manufacturing safety certifications.",
  })
  if (denied) return denied

  const parsed = recordMscCertificationFormSchema.safeParse({
    obligationId: formData.get("obligationId"),
    certificationType: formData.get("certificationType") || "general",
    certificateRef: formData.get("certificateRef") || null,
    issueDate: formData.get("issueDate") || null,
    expiryDate: formData.get("expiryDate") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await recordMscSafetyCertification({
    organizationId,
    userId,
    obligationId: parsed.data.obligationId,
    certificationType: parsed.data.certificationType ?? "general",
    certificateRef: parsed.data.certificateRef ?? null,
    issueDate: parsed.data.issueDate ?? null,
    expiryDate: parsed.data.expiryDate ?? null,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true, certificationId: result.certificationId }
}
