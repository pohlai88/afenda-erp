"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { CreateRwsDemandReferenceFormState } from "@afenda/feature-hrm-core/shared"
import { createRwsLaborDemandReference } from "../data/rws-demand.server"
import { createRwsDemandReferenceFormSchema } from "../schemas/rws.schema"

export async function createRwsDemandReferenceAction(
  _prev: CreateRwsDemandReferenceFormState | undefined,
  formData: FormData
): Promise<CreateRwsDemandReferenceFormState> {
  const session = await requireOrgSession()
  const allowed = await canUseErpPermission({
    organizationId: session.organizationId,
    userId: session.userId,
    permission: {
      module: "hrm",
      object: "retail_schedule",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to manage labor demand references.",
    })
  }

  const parsed = createRwsDemandReferenceFormSchema.safeParse({
    schedulePeriodId: formData.get("schedulePeriodId"),
    storeId: formData.get("storeId"),
    referenceKind: formData.get("referenceKind"),
    externalRef: formData.get("externalRef") || null,
    notes: formData.get("notes") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await createRwsLaborDemandReference({
    organizationId: session.organizationId,
    userId: session.userId,
    schedulePeriodId: parsed.data.schedulePeriodId,
    storeId: parsed.data.storeId,
    referenceKind: parsed.data.referenceKind,
    externalRef: parsed.data.externalRef ?? null,
    notes: parsed.data.notes ?? null,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, demandReferenceId: result.demandReferenceId }
}
