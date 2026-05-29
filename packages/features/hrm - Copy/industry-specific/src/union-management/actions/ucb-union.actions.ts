"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import { createUcbUnion, updateUcbUnion } from "../data/ucb-union.server"
import {
  createUnionFormSchema,
  type UcbMutationFormState,
  updateUnionFormSchema,
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
      form: "You are not authorized to manage union records.",
    })
  }
  return null
}

export async function createUcbUnionAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createUnionFormSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    status: formData.get("status"),
    representativeRef: formData.get("representativeRef") || null,
    notes: formData.get("notes") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withUcbNullableFields(parsed.data, [
    "representativeRef",
    "notes",
  ])
  const result = await createUcbUnion({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.unionId }
}

export async function updateUcbUnionAction(
  _prev: UcbMutationFormState | undefined,
  formData: FormData
): Promise<UcbMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireUcbManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = updateUnionFormSchema.safeParse({
    unionId: formData.get("unionId"),
    name: formData.get("name"),
    status: formData.get("status"),
    representativeRef: formData.get("representativeRef") || null,
    notes: formData.get("notes") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withUcbNullableFields(parsed.data, [
    "representativeRef",
    "notes",
  ])
  const result = await updateUcbUnion({
    organizationId: session.organizationId,
    userId: session.userId,
    unionId: data.unionId,
    name: data.name,
    status: data.status,
    representativeRef: data.representativeRef,
    notes: data.notes,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true }
}
