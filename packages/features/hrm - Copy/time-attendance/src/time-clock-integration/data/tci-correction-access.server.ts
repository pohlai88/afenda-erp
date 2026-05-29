import "server-only"

import type { OrgSession } from "@afenda/platform/auth"

import { requireHrmPermission } from "@afenda/feature-hrm-core/governance"
import {
  TCI_CORRECTION_EXCEPTION_DECIDE_PERMISSION,
  TCI_CORRECTION_LAM_PERMISSION,
} from "../tci-correction-access.shared"

export type TimeClockCorrectionAccessGate =
  | { readonly ok: false; readonly error: string }
  | { readonly ok: true; readonly session: OrgSession }

function mapSessionGate(
  gate: Awaited<ReturnType<typeof requireHrmPermission>>
): TimeClockCorrectionAccessGate {
  if (!gate.ok) {
    return { ok: false, error: gate.error }
  }
  return { ok: true, session: gate.session }
}

export async function requireTimeClockExceptionDecisionPermission(): Promise<TimeClockCorrectionAccessGate> {
  return mapSessionGate(
    await requireHrmPermission({
      object: TCI_CORRECTION_EXCEPTION_DECIDE_PERMISSION.object,
      function: TCI_CORRECTION_EXCEPTION_DECIDE_PERMISSION.function,
      errorMessage: "Time clock exception decision permission required.",
    })
  )
}

export async function requireTimeClockAttendanceCorrectionPermission(): Promise<TimeClockCorrectionAccessGate> {
  return mapSessionGate(
    await requireHrmPermission({
      object: TCI_CORRECTION_LAM_PERMISSION.object,
      function: TCI_CORRECTION_LAM_PERMISSION.function,
      errorMessage: "HRM attendance update permission required.",
    })
  )
}
