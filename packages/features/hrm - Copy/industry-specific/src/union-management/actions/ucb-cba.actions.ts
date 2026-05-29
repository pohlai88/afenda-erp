"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import {
  createUcbCollectiveAgreement,
  updateUcbCollectiveAgreement,
} from "../data/ucb-cba.server"
import {
  createCbaFormSchema,
  type UcbMutationFormState,
  updateCbaFormSchema,
  withUcbNullableFields,
} from "../schemas/ucb.schema"

async function requireUcbManagePermission(input: {
  organizationId: string
  userId: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "union_collective_bargaining",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage collective agreements.",
    })
  }
  return null
}

export async function createUcbCbaAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createCbaFormSchema.safeParse({
    unionId: formData.get("unionId"),
    bargainingUnitId: formData.get("bargainingUnitId") || null,
    title: formData.get("title"),
    versionLabel: formData.get("versionLabel"),
    effectiveFrom: formData.get("effectiveFrom") || null,
    effectiveTo: formData.get("effectiveTo") || null,
    status: formData.get("status"),
    negotiationStatus: formData.get("negotiationStatus"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withUcbNullableFields(parsed.data, [
    "bargainingUnitId",
    "effectiveFrom",
    "effectiveTo",
  ])
  const result = await createUcbCollectiveAgreement({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.collectiveAgreementId }
}

export async function updateUcbCbaAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = updateCbaFormSchema.safeParse({
    collectiveAgreementId: formData.get("collectiveAgreementId"),
    unionId: formData.get("unionId"),
    bargainingUnitId: formData.get("bargainingUnitId") || null,
    title: formData.get("title"),
    versionLabel: formData.get("versionLabel"),
    effectiveFrom: formData.get("effectiveFrom") || null,
    effectiveTo: formData.get("effectiveTo") || null,
    status: formData.get("status"),
    negotiationStatus: formData.get("negotiationStatus"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withUcbNullableFields(parsed.data, [
    "bargainingUnitId",
    "effectiveFrom",
    "effectiveTo",
  ])
  const result = await updateUcbCollectiveAgreement({
    organizationId: session.organizationId,
    userId: session.userId,
    collectiveAgreementId: data.collectiveAgreementId,
    bargainingUnitId: data.bargainingUnitId,
    title: data.title,
    versionLabel: data.versionLabel,
    effectiveFrom: data.effectiveFrom,
    effectiveTo: data.effectiveTo,
    status: data.status,
    negotiationStatus: data.negotiationStatus,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true }
}
