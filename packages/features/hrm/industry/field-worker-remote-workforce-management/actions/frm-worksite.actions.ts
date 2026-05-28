"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type { CreateFrmWorksiteFormState } from "../../../_core/shared"
import { createFrmWorksite } from "../data/frm-worksites.server"
import { createFrmWorksiteFormSchema } from "../schemas/frm.schema"

export async function createFrmWorksiteAction(
  _prev: CreateFrmWorksiteFormState | undefined,
  formData: FormData
): Promise<CreateFrmWorksiteFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "field_workforce",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage field worksites.",
    })
  }

  const parsed = createFrmWorksiteFormSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    worksiteType: formData.get("worksiteType"),
    countryCode: formData.get("countryCode") || null,
    city: formData.get("city") || null,
    approvedRemote: formData.get("approvedRemote") === "on",
  })

  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createFrmWorksite({
    organizationId,
    userId,
    code: parsed.data.code,
    name: parsed.data.name,
    worksiteType: parsed.data.worksiteType,
    countryCode: parsed.data.countryCode ?? null,
    city: parsed.data.city ?? null,
    approvedRemote: parsed.data.approvedRemote ?? false,
  })

  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }

  return { ok: true, worksiteId: result.worksiteId }
}
