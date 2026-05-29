import "server-only"

import type { OrgSession } from "@afenda/platform/auth"

import { requireHrmPermission } from "@afenda/feature-hrm-core/governance"
import { TCI_DEVICE_ADMIN_PERMISSION } from "../tci-device-admin-access.shared"

export type TimeClockDeviceAdminAccessGate =
  | { readonly ok: false; readonly error: string }
  | { readonly ok: true; readonly session: OrgSession }

function mapSessionGate(
  gate: Awaited<ReturnType<typeof requireHrmPermission>>
): TimeClockDeviceAdminAccessGate {
  if (!gate.ok) {
    return { ok: false, error: gate.error }
  }
  return { ok: true, session: gate.session }
}

export async function requireTimeClockDeviceAdminPermission(): Promise<TimeClockDeviceAdminAccessGate> {
  return mapSessionGate(
    await requireHrmPermission({
      object: TCI_DEVICE_ADMIN_PERMISSION.object,
      function: TCI_DEVICE_ADMIN_PERMISSION.function,
      errorMessage: "Time clock device admin permission required.",
    })
  )
}
