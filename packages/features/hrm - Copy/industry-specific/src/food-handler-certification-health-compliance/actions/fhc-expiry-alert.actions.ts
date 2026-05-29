"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { EmitFhcExpiryAlertsFormState } from "@afenda/feature-hrm-core/shared"
import { emitFhcExpiryAlertsForOrg } from "../data/fhc-expiry-notification.server"

export async function emitFhcExpiryAlertsFormAction(
  _prev: EmitFhcExpiryAlertsFormState | undefined,
  _formData: FormData
): Promise<EmitFhcExpiryAlertsFormState> {
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
      form: "You are not authorized to emit expiry alerts.",
    })
  }

  try {
    const result = await emitFhcExpiryAlertsForOrg({
      organizationId,
      actorUserId: userId,
    })
    return {
      ok: true,
      emittedInApp: result.emittedInApp,
      emittedEmail: result.emittedEmail,
      skipped: result.skipped,
    }
  } catch {
    return hrmActionFailure({
      form: "Expiry alerts could not be delivered. Try again shortly.",
    })
  }
}
