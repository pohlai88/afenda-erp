import "server-only"

import { eq, sql } from "drizzle-orm"

import { writeIamAuditEventFromNextHeaders } from "@afenda/platform/auth"
import { db } from "@afenda/platform/db"
import {
  hrmAttendanceEvent,
  hrmTimeClockDevice,
  hrmTimeClockPunchException,
  hrmTimeClockSyncBatch,
} from "@afenda/platform/db/schema"

import { hrmActionFailure } from "../../../_core/governance"
import { regenerateAttendanceDayFromEvents } from "../../leave-attendance-management/data/attendance-aggregator.server"
import { HRM_TCI_AUDIT } from "../tci.contract"
import type {
  TimeClockIngestBatchInput,
  TimeClockIngestPunchInput,
} from "../schemas/tci.schema"
import type { TciDetectionOutcome } from "../schemas/tci-workflow-state.shared"

import { TCI_OFFLINE_REPLAY_SOURCE_KIND } from "../tci-offline-replay.shared"
import { TCI_DUPLICATE_PUNCH_DETECTION_OUTCOME } from "../tci-duplicate-detection.shared"
import { resolveTimeClockPunchPayloadHash } from "../tci-punch-deduplication.shared"

import {
  revalidateTimeClockSurfaces,
  shouldRevalidateTimeClockUi,
  updateTimeClockOrgCacheTag,
} from "./tci-revalidate.server"
import {
  evaluateTimeClockPunch,
  resolveTimeClockIngestContext,
} from "./tci-validation.server"

async function auditTimeClockValidationExceptionSubmit(
  ctx: TimeClockCommandContext,
  input: {
    readonly exceptionId: string
    readonly deviceId: string
    readonly employeeId: string
    readonly detectionOutcome: TciDetectionOutcome
    readonly syncBatchId?: string | null
  }
): Promise<void> {
  await writeIamAuditEventFromNextHeaders({
    action: HRM_TCI_AUDIT.exceptionSubmit,
    actorUserId: ctx.userId,
    actorSessionId: ctx.sessionId,
    organizationId: ctx.organizationId,
    resourceType: "hrm_time_clock_punch_exception",
    resourceId: input.exceptionId,
    metadata: {
      deviceId: input.deviceId,
      employeeId: input.employeeId,
      detectionOutcome: input.detectionOutcome,
      syncBatchId: input.syncBatchId ?? null,
    },
  })
}

export type TimeClockCommandContext = {
  readonly organizationId: string
  readonly userId: string
  readonly sessionId: string | null
}

export type PersistedTimeClockPunchAccepted = {
  readonly status: "accepted"
  readonly eventId: string
  readonly attendanceDate: string
  readonly regenerateResult: "skipped" | "updated" | "locked"
}

export type PersistTimeClockPunchOutcome =
  | PersistedTimeClockPunchAccepted
  | { readonly status: "duplicate" }
  | {
      readonly status: "rejected"
      readonly outcome: TciDetectionOutcome
      readonly message: string
      readonly exceptionId?: string
    }

export type PersistTimeClockPunchOptions = {
  readonly syncBatchId?: string | null
  /** Rejected punches (not duplicate): write exception inbox when true (default). */
  readonly recordExceptionOnReject?: boolean
  /**
   * HRM-TCI-018 — detected payload duplicates: write exception inbox while still
   * returning `{ status: "duplicate" }` for batch tallies (HRM-TCI-013).
   */
  readonly recordExceptionOnDuplicate?: boolean
  /** HR approval: allow punches outside the shift window. */
  readonly hrOverrideShiftWindow?: boolean
  /** Batch ingest defers day regen to a single pass per employee/date. */
  readonly skipRegenerate?: boolean
  /** Batch ingest defers layout invalidation to batch end or route `after()`. */
  readonly skipRevalidate?: boolean
}

export type IngestTimeClockBatchOptions = {
  readonly deferUiRevalidate?: boolean
  readonly ingestAuthKind?: "integration_api_key" | "org_session"
}

function ingestContextCacheKey(punch: TimeClockIngestPunchInput): string {
  return `${punch.externalDeviceId}\u0000${punch.clockUserId}`
}

function regenTargetKey(employeeId: string, attendanceDate: string): string {
  return `${employeeId}\u0000${attendanceDate}`
}

/**
 * Sole writer for `source = 'device'` on `hrm_attendance_event`.
 */
export async function persistTimeClockPunch(input: {
  ctx: TimeClockCommandContext
  deviceId: string
  employeeId: string
  punch: TimeClockIngestPunchInput
  options?: PersistTimeClockPunchOptions
}): Promise<PersistTimeClockPunchOutcome> {
  const options = input.options ?? {}
  const validation = await evaluateTimeClockPunch({
    organizationId: input.ctx.organizationId,
    deviceId: input.deviceId,
    employeeId: input.employeeId,
    punch: input.punch,
  })

  if (!validation.ok) {
    if (validation.outcome === TCI_DUPLICATE_PUNCH_DETECTION_OUTCOME) {
      if (options.recordExceptionOnDuplicate !== false) {
        const exceptionId = crypto.randomUUID()
        await db.insert(hrmTimeClockPunchException).values({
          id: exceptionId,
          organizationId: input.ctx.organizationId,
          employeeId: input.employeeId,
          deviceId: input.deviceId,
          syncBatchId: options.syncBatchId ?? null,
          state: "submitted",
          eventType: input.punch.eventType,
          occurredAt: new Date(input.punch.occurredAtIso),
          detectionOutcome: TCI_DUPLICATE_PUNCH_DETECTION_OUTCOME,
          reason: validation.message,
          rawPayloadHash:
            input.punch.rawPayloadHash ??
            resolveTimeClockPunchPayloadHash({
              organizationId: input.ctx.organizationId,
              deviceId: input.deviceId,
              employeeId: input.employeeId,
              punch: input.punch,
            }),
          sourceRef: input.punch.sourceRef ?? null,
        })
        await auditTimeClockValidationExceptionSubmit(input.ctx, {
          exceptionId,
          deviceId: input.deviceId,
          employeeId: input.employeeId,
          detectionOutcome: TCI_DUPLICATE_PUNCH_DETECTION_OUTCOME,
          syncBatchId: options.syncBatchId,
        })
      }
      return { status: "duplicate" }
    }

    const allowHrOverride =
      options.hrOverrideShiftWindow &&
      validation.outcome === "outside_shift_window"

    if (!allowHrOverride) {
      let exceptionId: string | undefined
      if (options.recordExceptionOnReject !== false) {
        exceptionId = crypto.randomUUID()
        await db.insert(hrmTimeClockPunchException).values({
          id: exceptionId,
          organizationId: input.ctx.organizationId,
          employeeId: input.employeeId,
          deviceId: input.deviceId,
          syncBatchId: options.syncBatchId ?? null,
          state: "submitted",
          eventType: input.punch.eventType,
          occurredAt: new Date(input.punch.occurredAtIso),
          detectionOutcome: validation.outcome,
          reason: validation.message,
          rawPayloadHash: input.punch.rawPayloadHash ?? null,
          sourceRef: input.punch.sourceRef ?? null,
        })
        await auditTimeClockValidationExceptionSubmit(input.ctx, {
          exceptionId,
          deviceId: input.deviceId,
          employeeId: input.employeeId,
          detectionOutcome: validation.outcome,
          syncBatchId: options.syncBatchId,
        })
      }
      return {
        status: "rejected",
        outcome: validation.outcome,
        message: validation.message,
        exceptionId,
      }
    }
  }

  const occurredAt = new Date(input.punch.occurredAtIso)
  const attendanceDate = occurredAt.toISOString().slice(0, 10)
  const rawPayloadHash = resolveTimeClockPunchPayloadHash({
    organizationId: input.ctx.organizationId,
    deviceId: input.deviceId,
    employeeId: input.employeeId,
    punch: input.punch,
  })

  const eventId = crypto.randomUUID()
  await db.insert(hrmAttendanceEvent).values({
    id: eventId,
    organizationId: input.ctx.organizationId,
    employeeId: input.employeeId,
    eventType: input.punch.eventType,
    occurredAt,
    source: "device",
    sourceRef: input.punch.sourceRef ?? input.deviceId,
    deviceId: input.deviceId,
    rawPayloadHash,
    metadata: { syncBatchId: options.syncBatchId ?? null },
    createdByUserId: input.ctx.userId,
  })

  await db
    .update(hrmTimeClockDevice)
    .set({
      lastSyncAt: occurredAt,
      syncStatus: "ok",
      updatedAt: sql`now()`,
    })
    .where(eq(hrmTimeClockDevice.id, input.deviceId))

  const regenerateResult = options.skipRegenerate
    ? ("skipped" as const)
    : await regenerateAttendanceDayFromEvents({
        organizationId: input.ctx.organizationId,
        employeeId: input.employeeId,
        attendanceDate,
        actorUserId: input.ctx.userId,
      })

  await writeIamAuditEventFromNextHeaders({
    action: HRM_TCI_AUDIT.punchCreate,
    actorUserId: input.ctx.userId,
    actorSessionId: input.ctx.sessionId,
    organizationId: input.ctx.organizationId,
    resourceType: "hrm_attendance_event",
    resourceId: eventId,
    metadata: {
      deviceId: input.deviceId,
      eventType: input.punch.eventType,
      source: "device",
    },
  })

  if (!options.skipRevalidate) {
    updateTimeClockOrgCacheTag(input.ctx.organizationId)
    revalidateTimeClockSurfaces(input.ctx.organizationId)
  }

  return {
    status: "accepted",
    eventId,
    attendanceDate,
    regenerateResult,
  }
}

export type IngestTimeClockBatchResult = {
  readonly batchId: string
  readonly accepted: number
  readonly duplicates: number
  readonly rejected: number
  readonly uiRevalidate: boolean
}

export async function ingestTimeClockBatch(
  ctx: TimeClockCommandContext,
  input: TimeClockIngestBatchInput,
  batchOptions?: IngestTimeClockBatchOptions
): Promise<
  IngestTimeClockBatchResult | { ok: false; errors: { form?: string } }
> {
  if (input.organizationId !== ctx.organizationId) {
    return hrmActionFailure({ form: "Organization mismatch." })
  }

  const batchId = crypto.randomUUID()
  const resolvedDeviceId =
    input.deviceId ??
    (input.punches.length === 1
      ? (
          await resolveTimeClockIngestContext({
            organizationId: ctx.organizationId,
            punch: input.punches[0]!,
          })
        )?.device.id
      : null) ??
    null

  await db.insert(hrmTimeClockSyncBatch).values({
    id: batchId,
    organizationId: ctx.organizationId,
    deviceId: resolvedDeviceId,
    sourceKind: input.sourceKind,
    state: "running",
    receivedCount: input.punches.length,
    createdByUserId: ctx.userId,
  })

  let accepted = 0
  let duplicates = 0
  let rejected = 0
  const regenTargets = new Map<
    string,
    { readonly employeeId: string; readonly attendanceDate: string }
  >()
  const ingestContextCache = new Map<
    string,
    Awaited<ReturnType<typeof resolveTimeClockIngestContext>>
  >()

  for (const punch of input.punches) {
    const cacheKey = ingestContextCacheKey(punch)
    let resolved = ingestContextCache.get(cacheKey)
    if (resolved === undefined) {
      resolved = await resolveTimeClockIngestContext({
        organizationId: ctx.organizationId,
        punch,
      })
      ingestContextCache.set(cacheKey, resolved)
    }
    if (!resolved?.employeeId) {
      rejected += 1
      continue
    }

    const outcome = await persistTimeClockPunch({
      ctx,
      deviceId: resolved.device.id,
      employeeId: resolved.employeeId,
      punch,
      options: {
        syncBatchId: batchId,
        recordExceptionOnReject: true,
        skipRegenerate: true,
        skipRevalidate: true,
      },
    })

    if (outcome.status === "accepted") {
      accepted += 1
      regenTargets.set(
        regenTargetKey(resolved.employeeId, outcome.attendanceDate),
        {
          employeeId: resolved.employeeId,
          attendanceDate: outcome.attendanceDate,
        }
      )
    } else if (outcome.status === "duplicate") {
      duplicates += 1
    } else {
      rejected += 1
    }
  }

  for (const target of regenTargets.values()) {
    await regenerateAttendanceDayFromEvents({
      organizationId: ctx.organizationId,
      employeeId: target.employeeId,
      attendanceDate: target.attendanceDate,
      actorUserId: ctx.userId,
    })
  }

  await db
    .update(hrmTimeClockSyncBatch)
    .set({
      state: rejected > 0 && accepted === 0 ? "failed" : "completed",
      acceptedCount: accepted,
      duplicateCount: duplicates,
      rejectedCount: rejected,
      finishedAt: new Date(),
    })
    .where(eq(hrmTimeClockSyncBatch.id, batchId))

  await writeIamAuditEventFromNextHeaders({
    action: HRM_TCI_AUDIT.syncRun,
    actorUserId: ctx.userId,
    actorSessionId: ctx.sessionId,
    organizationId: ctx.organizationId,
    resourceType: "hrm_time_clock_sync_batch",
    resourceId: batchId,
    metadata: { accepted, duplicates, rejected },
  })

  if (input.sourceKind === TCI_OFFLINE_REPLAY_SOURCE_KIND && resolvedDeviceId) {
    const finishedAt = new Date()
    await db
      .update(hrmTimeClockDevice)
      .set({
        syncStatus: rejected > 0 && accepted === 0 ? "failed" : "ok",
        lastSyncAt: finishedAt,
        updatedAt: finishedAt,
      })
      .where(eq(hrmTimeClockDevice.id, resolvedDeviceId))
  }

  const uiRevalidate = shouldRevalidateTimeClockUi({
    sourceKind: input.sourceKind,
    actorUserId: ctx.userId,
    ingestAuthKind: batchOptions?.ingestAuthKind,
  })

  if (uiRevalidate && !batchOptions?.deferUiRevalidate) {
    revalidateTimeClockSurfaces(ctx.organizationId)
  }

  return {
    batchId,
    accepted,
    duplicates,
    rejected,
    uiRevalidate,
  }
}
