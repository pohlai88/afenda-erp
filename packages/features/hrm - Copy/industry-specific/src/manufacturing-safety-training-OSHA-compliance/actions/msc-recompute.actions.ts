"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { RecomputeMscObligationsFormState } from "../data/msc-form-state.shared"
import { recomputeMscObligationsForOrg } from "../data/msc-obligations.server"

export async function recomputeMscObligationsAction(
  _prev: RecomputeMscObligationsFormState | undefined
): Promise<RecomputeMscObligationsFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId, sessionId } = session

  const allowed = await canUseErpPermission({
    organizationId,
    userId,
    permission: {
      module: "hrm",
      object: "manufacturing_safety",
      function: "update",
    },
  })
  if (!allowed) {
    return hrmActionFailure({
      form: "You are not authorized to recompute manufacturing safety obligations.",
    })
  }

  const result = await recomputeMscObligationsForOrg({
    organizationId,
    userId,
    sessionId,
  })

  if (!result.ok) {
    return hrmActionFailure({
      form: result.form ?? "Recompute failed.",
    })
  }

  return {
    ok: true,
    created: result.created,
    updated: result.updated,
    removed: result.removed,
  }
}
