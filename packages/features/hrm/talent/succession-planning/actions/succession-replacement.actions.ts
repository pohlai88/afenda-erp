"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import { createSuccessionReplacementPlan } from "../data/succession-bench.server"
import {
  createReplacementPlanFormSchema,
  type SuccessionMutationFormState,
  withSuccessionNullableFields,
} from "../schemas/succession.schema"

async function requireSuccessionManagePermission(input: {
  organizationId: string
  userId: string
}) {
  const allowed = await canUseErpPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permission: {
      module: "hrm",
      object: "succession",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage replacement plans.",
    })
  }
  return null
}

export async function createSuccessionReplacementPlanAction(
  _prev: SuccessionMutationFormState | undefined,
  formData: FormData
): Promise<SuccessionMutationFormState> {
  const session = await requireOrgSession()
  const denied = await requireSuccessionManagePermission({
    organizationId: session.organizationId,
    userId: session.userId,
  })
  if (denied) return denied

  const parsed = createReplacementPlanFormSchema.safeParse({
    criticalRoleId: formData.get("criticalRoleId"),
    planKind: formData.get("planKind"),
    primaryNominationId: formData.get("primaryNominationId") || null,
    interimEmployeeId: formData.get("interimEmployeeId") || null,
    effectiveFrom: formData.get("effectiveFrom") || null,
    notes: formData.get("notes") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const data = withSuccessionNullableFields(parsed.data, [
    "primaryNominationId",
    "interimEmployeeId",
    "effectiveFrom",
    "notes",
  ])
  const result = await createSuccessionReplacementPlan({
    organizationId: session.organizationId,
    userId: session.userId,
    ...data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, id: result.planId }
}
