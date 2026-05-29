"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { CreateFhcDutyRestrictionFormState } from "@afenda/feature-hrm-core/shared"
import { createFhcDutyRestriction } from "../data/fhc-duty-restrictions.server"
import { createFhcDutyRestrictionFormSchema } from "../schemas/fhc.schema"

export async function createFhcDutyRestrictionAction(
  _prev: CreateFhcDutyRestrictionFormState | undefined,
  formData: FormData
): Promise<CreateFhcDutyRestrictionFormState> {
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
      form: "You are not authorized to create duty restrictions.",
    })
  }

  const parsed = createFhcDutyRestrictionFormSchema.safeParse({
    obligationId: formData.get("obligationId"),
    restrictionScope: formData.get("restrictionScope"),
    effectiveFrom: formData.get("effectiveFrom"),
    effectiveTo: formData.get("effectiveTo") || null,
    reason: formData.get("reason") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createFhcDutyRestriction({
    organizationId,
    userId,
    obligationId: parsed.data.obligationId,
    restrictionScope: parsed.data.restrictionScope,
    effectiveFrom: parsed.data.effectiveFrom,
    effectiveTo: parsed.data.effectiveTo?.trim() || null,
    reason: parsed.data.reason?.trim() || null,
  })
  if (!result.ok) {
    return hrmActionFailure({ form: result.form })
  }
  return { ok: true, restrictionId: result.restrictionId }
}
