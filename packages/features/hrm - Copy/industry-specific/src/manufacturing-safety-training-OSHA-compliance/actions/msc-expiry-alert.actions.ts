"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import type { EmitMscExpiryAlertsFormState } from "../data/msc-form-state.shared"
import { emitMscExpiryAlertsForOrg } from "../data/msc-expiry-notification.server"

export async function emitMscExpiryAlertsFormAction(
  _prev: EmitMscExpiryAlertsFormState | undefined,
  _formData: FormData
): Promise<EmitMscExpiryAlertsFormState> {
  const session = await requireOrgSession()
  const { organizationId, userId } = session

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
      form: "You are not authorized to emit manufacturing safety expiry alerts.",
    })
  }

  try {
    const result = await emitMscExpiryAlertsForOrg({
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
