"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type { CreateRwsStoreFormState } from "../../../_core/shared"
import { createRwsStore } from "../data/rws-stores.server"
import { createRwsStoreFormSchema } from "../schemas/rws.schema"

async function requireRwsManagePermission(input: {
  organizationId: string
  userId: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "retail_schedule",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage retail scheduling.",
    })
  }
  return null
}

export async function createRwsStoreAction(
  _prev: CreateRwsStoreFormState | undefined,
  formData: FormData
): Promise<CreateRwsStoreFormState> {
  const session = await requireOrgSession()
  const denied = await requireRwsManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createRwsStoreFormSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    branchRef: formData.get("branchRef") || null,
    departmentRef: formData.get("departmentRef") || null,
    legalEntityRef: formData.get("legalEntityRef") || null,
    locationRef: formData.get("locationRef") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createRwsStore({
    organizationId: session.organizationId,
    userId: session.userId,
    code: parsed.data.code,
    name: parsed.data.name,
    branchRef: parsed.data.branchRef ?? null,
    departmentRef: parsed.data.departmentRef ?? null,
    legalEntityRef: parsed.data.legalEntityRef ?? null,
    locationRef: parsed.data.locationRef ?? null,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, storeId: result.storeId }
}
