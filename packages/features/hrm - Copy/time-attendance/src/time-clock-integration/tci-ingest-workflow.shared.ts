/** Cron vendor loop budget under route `maxDuration` 60s (see `tci-scheduled-sync.server.ts`). */
const TCI_ROUTE_SAFE_WALL_MS = 50_000

/**
 * Estimated wall time per punch (resolve context + persist + deferred regen) under route
 * `maxDuration` 60s. Batches at or above this count enqueue durable WDK ingest (P4).
 */
export const TCI_INGEST_WORKFLOW_PUNCH_THRESHOLD = 50

/** Conservative per-punch budget used for documentation and future adaptive enqueue. */
export const TCI_INGEST_ESTIMATED_MS_PER_PUNCH = Math.floor(
  TCI_ROUTE_SAFE_WALL_MS / TCI_INGEST_WORKFLOW_PUNCH_THRESHOLD
)

export function shouldEnqueueTimeClockIngestWorkflow(
  punchCount: number
): boolean {
  return punchCount >= TCI_INGEST_WORKFLOW_PUNCH_THRESHOLD
}
