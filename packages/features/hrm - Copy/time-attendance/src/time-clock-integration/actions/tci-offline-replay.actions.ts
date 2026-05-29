"use server"

import { requireHrmPermission } from "@afenda/feature-hrm-core/governance"
import { hrmActionFailure } from "@afenda/feature-hrm-core/governance"
import { ingestTimeClockBatch } from "../data/tci-punch-commands.server"
import { resolveTciOfflineReplayEnabled } from "../data/tci-offline-replay-enablement.server"
import { timeClockIngestBatchSchema } from "../schemas/tci.schema"
import { TCI_OFFLINE_REPLAY_SOURCE_KIND } from "../tci-offline-replay.shared"
import type { ReplayOfflineTimeClockBatchFormState } from "../tci-action-state.shared"

/**
 * ERP door for buffered punches after a terminal reconnects (HRM-TCI-012).
 * JSON body in `batchJson` form field matching `timeClockIngestBatchSchema`.
 */
export async function replayOfflineTimeClockPunchBatchAction(
  _prev: ReplayOfflineTimeClockBatchFormState | undefined,
  formData: FormData
): Promise<ReplayOfflineTimeClockBatchFormState> {
  const gate = await requireHrmPermission({
    object: "time_clock_device",
    function: "update",
    errorMessage: "Time clock device permission required for offline replay.",
  })
  if (!gate.ok) return hrmActionFailure({ form: gate.error })
  const { organizationId, userId, sessionId } = gate.session

  const enabled = await resolveTciOfflineReplayEnabled(organizationId)
  if (!enabled) {
    return hrmActionFailure({
      form: "Offline punch synchronization is not enabled for this organization.",
    })
  }

  const batchJson = formData.get("batchJson")
  if (typeof batchJson !== "string" || !batchJson.trim()) {
    return hrmActionFailure({ form: "Batch payload is required." })
  }

  let raw: unknown
  try {
    raw = JSON.parse(batchJson) as unknown
  } catch {
    return hrmActionFailure({ form: "Batch payload must be valid JSON." })
  }

  const parsed = timeClockIngestBatchSchema.safeParse(raw)
  if (!parsed.success) {
    return hrmActionFailure({
      form: parsed.error.issues[0]?.message ?? "Invalid offline replay batch.",
    })
  }

  if (parsed.data.organizationId !== organizationId) {
    return hrmActionFailure({ form: "Organization mismatch." })
  }

  const result = await ingestTimeClockBatch(
    { organizationId, userId, sessionId },
    {
      ...parsed.data,
      sourceKind: TCI_OFFLINE_REPLAY_SOURCE_KIND,
    }
  )

  if (!("batchId" in result)) {
    return hrmActionFailure({ form: result.errors.form })
  }

  return {
    ok: true,
    batchId: result.batchId,
    accepted: result.accepted,
    duplicates: result.duplicates,
    rejected: result.rejected,
  }
}
