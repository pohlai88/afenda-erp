import { FatalError } from "workflow"

import type { TciIngestRunPayload } from "../schemas/tci-ingest-run-payload.schema"

import { ingestTimeClockBatch } from "./tci-punch-commands.server"

export async function timeClockIngestWorkflow(payload: TciIngestRunPayload) {
  "use workflow"

  try {
    await runTimeClockIngestBatchStep(payload)
  } catch (err) {
    throw err instanceof FatalError
      ? err
      : new FatalError("time_clock_ingest_failed")
  }
}

async function runTimeClockIngestBatchStep(payload: TciIngestRunPayload) {
  "use step"

  const result = await ingestTimeClockBatch(
    {
      organizationId: payload.organizationId,
      userId: payload.actorUserId,
      sessionId: payload.actorSessionId,
    },
    payload.batch,
    {
      ingestAuthKind: payload.ingestAuthKind,
      deferUiRevalidate: false,
    }
  )

  if (!("batchId" in result)) {
    throw new FatalError(result.errors.form ?? "time_clock_ingest_rejected")
  }

  return result
}
