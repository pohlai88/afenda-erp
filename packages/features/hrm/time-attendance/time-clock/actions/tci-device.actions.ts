"use server"

import { hrmActionFailure } from "../../../_core/governance"
import { requireTimeClockDeviceAdminPermission } from "../data/tci-device-admin-access.server"
import {
  revokeTimeClockDevice,
  upsertTimeClockDevice,
} from "../data/tci-device-commands.server"
import { upsertTimeClockDeviceFormSchema } from "../schemas/tci.schema"
import type { TimeClockDeviceMutationFormState } from "../tci-action-state.shared"

export async function upsertTimeClockDeviceAction(
  _prev: TimeClockDeviceMutationFormState | undefined,
  formData: FormData
): Promise<TimeClockDeviceMutationFormState> {
  const gate = await requireTimeClockDeviceAdminPermission()
  if (!gate.ok) return hrmActionFailure({ form: gate.error })
  const { organizationId, userId, sessionId } = gate.session

  const parsed = upsertTimeClockDeviceFormSchema.safeParse({
    id: formData.get("id") || undefined,
    externalDeviceId: formData.get("externalDeviceId"),
    name: formData.get("name"),
    deviceType: formData.get("deviceType"),
    locationRef: formData.get("locationRef") || null,
    state: formData.get("state") || undefined,
    integrationCredentialRef: formData.get("integrationCredentialRef") || null,
  })
  if (!parsed.success) {
    const errs = parsed.error.flatten().fieldErrors
    return hrmActionFailure({
      externalDeviceId: errs.externalDeviceId?.[0],
      name: errs.name?.[0],
      deviceType: errs.deviceType?.[0],
      form: parsed.error.issues[0]?.message,
    })
  }

  return upsertTimeClockDevice(
    { organizationId, userId, sessionId },
    parsed.data
  )
}

export async function revokeTimeClockDeviceAction(
  _prev: TimeClockDeviceMutationFormState | undefined,
  formData: FormData
): Promise<TimeClockDeviceMutationFormState> {
  const gate = await requireTimeClockDeviceAdminPermission()
  if (!gate.ok) return hrmActionFailure({ form: gate.error })
  const { organizationId, userId, sessionId } = gate.session

  const deviceId = formData.get("deviceId")
  if (typeof deviceId !== "string" || !deviceId) {
    return hrmActionFailure({ deviceId: "Device is required." })
  }

  return revokeTimeClockDevice({ organizationId, userId, sessionId }, deviceId)
}
