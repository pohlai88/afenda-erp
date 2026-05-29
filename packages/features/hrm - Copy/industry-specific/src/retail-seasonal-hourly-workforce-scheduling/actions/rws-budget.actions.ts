"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { UpsertRwsLaborBudgetFormState } from "@afenda/feature-hrm-core/shared"
import { upsertRwsLaborBudgetSnapshot } from "../data/rws-budget.server"
import { upsertRwsLaborBudgetFormSchema } from "../schemas/rws.schema"

export async function upsertRwsLaborBudgetAction(
  _prev: UpsertRwsLaborBudgetFormState | undefined,
  formData: FormData
): Promise<UpsertRwsLaborBudgetFormState> {
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
      form: "You are not authorized to manage labor budgets.",
    })
  }

  const parsed = upsertRwsLaborBudgetFormSchema.safeParse({
    schedulePeriodId: formData.get("schedulePeriodId"),
    storeId: formData.get("storeId"),
    approvedBudgetAmount: formData.get("approvedBudgetAmount"),
    currencyCode: formData.get("currencyCode") || null,
    notes: formData.get("notes") || null,
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await upsertRwsLaborBudgetSnapshot({
    organizationId: session.organizationId,
    userId: session.userId,
    schedulePeriodId: parsed.data.schedulePeriodId,
    storeId: parsed.data.storeId,
    approvedBudgetAmount: parsed.data.approvedBudgetAmount,
    currencyCode: parsed.data.currencyCode ?? null,
    notes: parsed.data.notes ?? null,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true, budgetSnapshotId: result.budgetSnapshotId }
}
