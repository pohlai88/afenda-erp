import { createHash } from "crypto"

import type { TimeClockIngestPunchInput } from "./schemas/tci.schema"

/** `hrm_attendance_event` column used for repeated-sync idempotency (HRM-TCI-013). */
export const TCI_DEDUPLICATION_ATTENDANCE_HASH_COLUMN =
  "rawPayloadHash" as const

/** Optional punch field; when omitted the server derives a canonical SHA-256 hex digest. */
export const TCI_DEDUPLICATION_PUNCH_FIELD = "rawPayloadHash" as const

export type TimeClockPunchPayloadHashInput = {
  readonly organizationId: string
  readonly deviceId: string
  readonly employeeId: string
  readonly punch: Pick<
    TimeClockIngestPunchInput,
    "eventType" | "occurredAtIso" | "sourceRef" | "rawPayloadHash"
  >
}

/**
 * Stable idempotency key for batch ingest and offline replay.
 * Device-supplied `rawPayloadHash` wins; otherwise derive from org + device + employee + punch identity.
 */
export function resolveTimeClockPunchPayloadHash(
  input: TimeClockPunchPayloadHashInput
): string {
  const explicit = input.punch.rawPayloadHash?.trim()
  if (explicit) return explicit

  return createHash("sha256")
    .update(
      JSON.stringify({
        organizationId: input.organizationId,
        deviceId: input.deviceId,
        employeeId: input.employeeId,
        eventType: input.punch.eventType,
        occurredAt: input.punch.occurredAtIso,
        sourceRef: input.punch.sourceRef ?? null,
      })
    )
    .digest("hex")
}
