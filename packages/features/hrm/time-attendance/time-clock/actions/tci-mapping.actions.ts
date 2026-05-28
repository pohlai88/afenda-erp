"use server"

import { requireHrmPermission } from "../../../_core/governance"
import { hrmActionFailure } from "../../../_core/governance"
import { upsertTimeClockMapping } from "../data/tci-mapping-commands.server"
import { upsertTimeClockMappingFormSchema } from "../schemas/tci.schema"

import type { TimeClockMutationFormState } from "../tci-action-state.shared"

export async function upsertTimeClockMappingAction(
  _prev: TimeClockMutationFormState | undefined,
  formData: FormData
): Promise<TimeClockMutationFormState> {
  const gate = await requireHrmPermission({
    object: "time_clock_mapping",
    function: "update",
    errorMessage: "Time clock mapping admin permission required.",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })
  const { organizationId, userId, sessionId } = gate.session

  const parsed = upsertTimeClockMappingFormSchema.safeParse({
    id: formData.get("id") || undefined,
    deviceId: formData.get("deviceId"),
    employeeId: formData.get("employeeId"),
    clockUserId: formData.get("clockUserId"),
    badgeId: formData.get("badgeId") || null,
    biometricRef: formData.get("biometricRef") || null,
    state: formData.get("state") || undefined,
  })
  if (!parsed.success) {
    const errs = parsed.error.flatten().fieldErrors
    return hrmActionFailure({
      deviceId: errs.deviceId?.[0],
      employeeId: errs.employeeId?.[0],
      clockUserId: errs.clockUserId?.[0],
      form: parsed.error.issues[0]?.message,
    })
  }

  return upsertTimeClockMapping(
    { organizationId, userId, sessionId },
    parsed.data
  )
}
