import "server-only"

import { and, eq, sql } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import { hrmTimeClockSyncBatch, importJob } from "@afenda/platform/db/schema"

import { HRM_TCI_AUDIT } from "../tci.contract"
import {
  TCI_MANUAL_IMPORT_JOB_SYNC_BATCH_METADATA_KEY,
  TCI_MANUAL_IMPORT_SOURCE_KIND,
} from "../tci-manual-import.shared"
import type { TimeClockCommandContext } from "./tci-punch-commands.server"
import {
  revalidateTimeClockSurfaces,
  updateTimeClockOrgCacheTag,
} from "./tci-revalidate.server"

export type TimeClockManualImportRowOutcome =
  | "accepted"
  | "duplicate"
  | "rejected"

function readSyncBatchIdFromJobMetadata(
  metadata: Record<string, unknown> | null
): string | null {
  const value = metadata?.[TCI_MANUAL_IMPORT_JOB_SYNC_BATCH_METADATA_KEY]
  return typeof value === "string" && value.length > 0 ? value : null
}

/** Creates a running `manual_import` batch and links it on the org import job. */
export async function ensureTimeClockManualImportSyncBatchForJob(input: {
  organizationId: string
  userId: string
  sessionId: string | null
  jobId: string
  totalRows: number
}): Promise<string> {
  const [job] = await db
    .select({
      id: importJob.id,
      metadata: importJob.metadata,
    })
    .from(importJob)
    .where(
      and(
        eq(importJob.id, input.jobId),
        eq(importJob.organizationId, input.organizationId)
      )
    )
    .limit(1)

  if (!job) {
    throw new Error("Import job not found for manual time-clock sync batch.")
  }

  const existing = readSyncBatchIdFromJobMetadata(job.metadata)
  if (existing) {
    return existing
  }

  const batchId = crypto.randomUUID()
  await db.insert(hrmTimeClockSyncBatch).values({
    id: batchId,
    organizationId: input.organizationId,
    deviceId: null,
    sourceKind: TCI_MANUAL_IMPORT_SOURCE_KIND,
    state: "running",
    receivedCount: input.totalRows,
    createdByUserId: input.userId,
  })

  const metadata = {
    ...(job.metadata ?? {}),
    [TCI_MANUAL_IMPORT_JOB_SYNC_BATCH_METADATA_KEY]: batchId,
  }

  await db
    .update(importJob)
    .set({ metadata, updatedAt: new Date() })
    .where(eq(importJob.id, input.jobId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_TCI_AUDIT.syncRun,
    actorUserId: input.userId,
    actorSessionId: input.sessionId,
    organizationId: input.organizationId,
    resourceType: "hrm_time_clock_sync_batch",
    resourceId: batchId,
    metadata: {
      sourceKind: TCI_MANUAL_IMPORT_SOURCE_KIND,
      importJobId: input.jobId,
      received: input.totalRows,
    },
  })

  return batchId
}

export async function recordTimeClockManualImportRowOutcome(
  batchId: string,
  outcome: TimeClockManualImportRowOutcome
): Promise<void> {
  if (outcome === "accepted") {
    await db
      .update(hrmTimeClockSyncBatch)
      .set({
        acceptedCount: sql`${hrmTimeClockSyncBatch.acceptedCount} + 1`,
      })
      .where(eq(hrmTimeClockSyncBatch.id, batchId))
    return
  }
  if (outcome === "duplicate") {
    await db
      .update(hrmTimeClockSyncBatch)
      .set({
        duplicateCount: sql`${hrmTimeClockSyncBatch.duplicateCount} + 1`,
      })
      .where(eq(hrmTimeClockSyncBatch.id, batchId))
    return
  }
  await db
    .update(hrmTimeClockSyncBatch)
    .set({
      rejectedCount: sql`${hrmTimeClockSyncBatch.rejectedCount} + 1`,
    })
    .where(eq(hrmTimeClockSyncBatch.id, batchId))
}

export async function finalizeTimeClockManualImportSyncBatchForJob(input: {
  ctx: TimeClockCommandContext
  jobId: string
}): Promise<void> {
  const [job] = await db
    .select({
      metadata: importJob.metadata,
      totalRows: importJob.totalRows,
      successCount: importJob.successCount,
      failureCount: importJob.failureCount,
    })
    .from(importJob)
    .where(
      and(
        eq(importJob.id, input.jobId),
        eq(importJob.organizationId, input.ctx.organizationId)
      )
    )
    .limit(1)

  const batchId = readSyncBatchIdFromJobMetadata(job?.metadata ?? null)
  if (!batchId) {
    return
  }

  const [batch] = await db
    .select({
      acceptedCount: hrmTimeClockSyncBatch.acceptedCount,
      rejectedCount: hrmTimeClockSyncBatch.rejectedCount,
    })
    .from(hrmTimeClockSyncBatch)
    .where(eq(hrmTimeClockSyncBatch.id, batchId))
    .limit(1)

  const accepted = batch?.acceptedCount ?? 0
  const rejected = batch?.rejectedCount ?? 0
  const state =
    accepted === 0 && (rejected > 0 || (job?.failureCount ?? 0) > 0)
      ? "failed"
      : "completed"

  await db
    .update(hrmTimeClockSyncBatch)
    .set({
      state,
      receivedCount: job?.totalRows ?? 0,
      finishedAt: new Date(),
      errorSummary:
        state === "failed"
          ? `Manual import job ${input.jobId}: ${job?.failureCount ?? 0} row failures`
          : null,
    })
    .where(eq(hrmTimeClockSyncBatch.id, batchId))

  updateTimeClockOrgCacheTag(input.ctx.organizationId)
  revalidateTimeClockSurfaces(input.ctx.organizationId)
}
