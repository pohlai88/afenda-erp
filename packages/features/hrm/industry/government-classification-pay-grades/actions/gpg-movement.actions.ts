"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type {
  ApplyGpgGradeMovementFormState,
  CreateGpgGradeMovementFormState,
} from "../../../_core/shared"
import {
  applyGpgGradeMovementDraft,
  createGpgGradeMovement,
} from "../data/gpg-grade-movements.server"
import {
  applyGpgGradeMovementDraftFormSchema,
  createGpgGradeMovementFormSchema,
} from "../schemas/gpg.schema"

async function requireGpgManagePermission(input: {
  organizationId: string
  userId: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "government_pay_grade",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage government pay grades.",
    })
  }
  return null
}

export async function createGpgGradeMovementAction(
  _prev: CreateGpgGradeMovementFormState | undefined,
  formData: FormData
): Promise<CreateGpgGradeMovementFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const payBandRaw = formData.get("payBandId")
  const parsed = createGpgGradeMovementFormSchema.safeParse({
    employeeId: formData.get("employeeId"),
    movementType: formData.get("movementType"),
    classificationId: formData.get("classificationId"),
    toPayGradeId: formData.get("toPayGradeId"),
    toStep: formData.get("toStep"),
    salaryTableVersionId: formData.get("salaryTableVersionId"),
    payBandId: typeof payBandRaw === "string" && payBandRaw ? payBandRaw : null,
    effectiveDate: formData.get("effectiveDate"),
    reason: formData.get("reason") || null,
    retentionAmount: formData.get("retentionAmount") || null,
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = parsed.data
  const result = await createGpgGradeMovement({
    organizationId,
    userId,
    employeeId: data.employeeId,
    movementType: data.movementType,
    classificationId: data.classificationId,
    toPayGradeId: data.toPayGradeId,
    toStep: data.toStep,
    salaryTableVersionId: data.salaryTableVersionId,
    payBandId: data.payBandId ?? null,
    effectiveDate: data.effectiveDate,
    reason: data.reason ?? null,
    retentionAmount: data.retentionAmount ?? null,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, movementId: result.movementId }
}

export async function applyGpgGradeMovementDraftAction(
  _prev: ApplyGpgGradeMovementFormState | undefined,
  formData: FormData
): Promise<ApplyGpgGradeMovementFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const denied = await requireGpgManagePermission({ organizationId, userId })
  if (denied) return denied

  const parsed = applyGpgGradeMovementDraftFormSchema.safeParse({
    movementId: formData.get("movementId"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: "Invalid movement." })
  }

  const result = await applyGpgGradeMovementDraft({
    organizationId,
    userId,
    movementId: parsed.data.movementId,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true }
}
