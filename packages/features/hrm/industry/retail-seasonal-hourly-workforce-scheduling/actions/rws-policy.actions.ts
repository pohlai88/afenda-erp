"use server"

import { requireOrgSession } from "@afenda/platform/auth"
import { canUseErpPermission } from "@afenda/platform/erp/rbac.server"

import { hrmActionFailure } from "../../../_core/governance"
import type { UpdateRwsRetailPolicyFormState } from "../../../_core/shared"
import { updateRwsRetailSchedulingPolicy } from "../data/rws-policy.server"
import { updateRwsRetailPolicyFormSchema } from "../schemas/rws.schema"

export async function updateRwsRetailPolicyAction(
  _prev: UpdateRwsRetailPolicyFormState | undefined,
  formData: FormData
): Promise<UpdateRwsRetailPolicyFormState> {
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
      form: "You are not authorized to update retail scheduling policy.",
    })
  }

  const parsed = updateRwsRetailPolicyFormSchema.safeParse({
    maxDailyHours: formData.get("maxDailyHours") || null,
    maxWeeklyHours: formData.get("maxWeeklyHours") || null,
    minRestHours: formData.get("minRestHours") || null,
    mealBreakMinutes: formData.get("mealBreakMinutes") || null,
    restBreakMinutes: formData.get("restBreakMinutes") || null,
    minorMaxDailyHours: formData.get("minorMaxDailyHours") || null,
    minorMaxWeeklyHours: formData.get("minorMaxWeeklyHours") || null,
    studentMaxWeeklyHours: formData.get("studentMaxWeeklyHours") || null,
    peakSeasonEnabled: formData.get("peakSeasonEnabled") ?? "false",
    holidayRuleEnabled: formData.get("holidayRuleEnabled") ?? "true",
    weekendRuleEnabled: formData.get("weekendRuleEnabled") ?? "true",
    lateNightRuleEnabled: formData.get("lateNightRuleEnabled") ?? "false",
  })
  if (!parsed.success) {
    return hrmActionFailure({ form: parsed.error.issues[0]?.message })
  }

  const result = await updateRwsRetailSchedulingPolicy({
    organizationId: session.organizationId,
    userId: session.userId,
    patch: parsed.data,
  })
  if (!result.ok) return hrmActionFailure({ form: result.form })
  return { ok: true }
}
