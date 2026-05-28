"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type { CreateFhcOutletFormState } from "../../../_core/shared"
import { createFhcOutlet } from "../data/fhc-outlets.server"
import { createFhcOutletFormSchema } from "../schemas/fhc.schema"

export async function createFhcOutletAction(
  _prev: CreateFhcOutletFormState | undefined,
  formData: FormData
): Promise<CreateFhcOutletFormState> {
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
      form: "You are not authorized to create outlets.",
    })
  }

  const parsed = createFhcOutletFormSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    countryCode: formData.get("countryCode") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createFhcOutlet({
    organizationId,
    userId,
    code: parsed.data.code,
    name: parsed.data.name,
    countryCode: parsed.data.countryCode?.trim() || null,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true, outletId: result.outletId }
}
