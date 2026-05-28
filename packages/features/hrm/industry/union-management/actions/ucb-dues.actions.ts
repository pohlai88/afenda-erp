"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import {
  createUcbDuesReference,
  updateUcbDuesApprovalState,
} from "../data/ucb-dues.server"
import {
  createDuesReferenceFormSchema,
  type UcbMutationFormState,
  updateDuesApprovalFormSchema,
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
    return hrmActionFailure({ form: "You are not authorized to manage union dues." })
  }
  return null
}

export async function createUcbDuesReferenceAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createDuesReferenceFormSchema.safeParse({
    membershipId: formData.get("membershipId"),
    amountRef: formData.get("amountRef"),
    currencyCode: formData.get("currencyCode") || "USD",
    effectiveFrom: formData.get("effectiveFrom") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withUcbNullableFields(parsed.data, ["effectiveFrom"])
  const result = await createUcbDuesReference({
    organizationId: session.organizationId,
    userId: session.userId,
    membershipId: data.membershipId,
    amountRef: data.amountRef,
    currencyCode: data.currencyCode,
    effectiveFrom: data.effectiveFrom,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.duesReferenceId }
}

export async function updateUcbDuesApprovalAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = updateDuesApprovalFormSchema.safeParse({
    duesReferenceId: formData.get("duesReferenceId"),
    approvalState: formData.get("approvalState"),
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await updateUcbDuesApprovalState({
    organizationId: session.organizationId,
    userId: session.userId,
    ...parsed.data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true }
}
