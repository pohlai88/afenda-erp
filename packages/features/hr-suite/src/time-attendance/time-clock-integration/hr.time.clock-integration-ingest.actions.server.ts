"use server";

import {
  actionFailure,
  actionSuccess,
  type ActionResult,
  zodActionFailure,
} from "@afenda/governed-surface/schemas";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";

import {
  HrTimeClockCommandError,
  ingestHrTimeClockManualImportBatch,
  ingestHrTimeClockOfflineReconcileBatch,
} from "./hr.time.clock-integration-ingest.shared.server";
import { hrTimeClockAuditActions } from "./hr.time.clock-integration.event";
import {
  HrTimeClockAccessDeniedError,
  requireHrTimeClockWrite,
} from "./hr.time.clock-integration-access.policy.server";
import { hrTimeClockManualImportBatchSchema } from "./hr.time.clock-integration-punch.schema";
import { hrTimeClockOfflineReconcileSchema } from "./hr.time.clock-integration-sync.schema";

function mapIngestError(error: unknown): ActionResult<never> {
  if (error instanceof HrTimeClockCommandError) {
    return actionFailure(error.code);
  }
  if (error instanceof HrTimeClockAccessDeniedError) {
    return actionFailure(error.code);
  }
  if (error instanceof Error) {
    return actionFailure(error.message);
  }
  return actionFailure("hr_time_clock_ingest_failed");
}

/** HRM-TCI-009 — manual CSV/JSON attendance import. */
export async function importHrTimeClockPunchesAction(
  input: unknown,
): Promise<ActionResult<{ batchId: string; insertedCount: number; duplicateCount: number }>> {
  const parsed = hrTimeClockManualImportBatchSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  let guard: Awaited<ReturnType<typeof requireHrTimeClockWrite>>;
  try {
    guard = await requireHrTimeClockWrite();
  } catch (error) {
    if (error instanceof HrTimeClockAccessDeniedError) {
      return actionFailure(error.code);
    }
    throw error;
  }

  try {
    const result = await ingestHrTimeClockManualImportBatch({
      organizationId: guard.organization.id,
      deviceId: parsed.data.deviceId,
      batchKey: parsed.data.batchKey,
      punches: parsed.data.punches,
    });

    await writeExecutionAuditEvent({
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      actorType: "user",
      action: hrTimeClockAuditActions.sync.completed,
      targetType: "hr_time_clock_sync_batch",
      targetId: result.batchId,
      summary: "Manual time clock punch import completed.",
      metadata: {
        deviceId: parsed.data.deviceId,
        insertedCount: result.insertedCount,
        duplicateCount: result.duplicateCount,
        source: "manual_import",
      },
    });

    return actionSuccess({
      batchId: result.batchId,
      insertedCount: result.insertedCount,
      duplicateCount: result.duplicateCount,
    });
  } catch (error) {
    return mapIngestError(error);
  }
}

/** HRM-TCI-012 — offline punch reconciliation after reconnection. */
export async function reconcileHrTimeClockOfflinePunchesAction(
  input: unknown,
): Promise<ActionResult<{ batchId: string; insertedCount: number; duplicateCount: number }>> {
  const parsed = hrTimeClockOfflineReconcileSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  let guard: Awaited<ReturnType<typeof requireHrTimeClockWrite>>;
  try {
    guard = await requireHrTimeClockWrite();
  } catch (error) {
    if (error instanceof HrTimeClockAccessDeniedError) {
      return actionFailure(error.code);
    }
    throw error;
  }

  try {
    const result = await ingestHrTimeClockOfflineReconcileBatch({
      organizationId: guard.organization.id,
      deviceId: parsed.data.deviceId,
      batchKey: parsed.data.batchKey,
      punches: parsed.data.punches,
    });

    await writeExecutionAuditEvent({
      organizationId: guard.organization.id,
      actorId: guard.session.id,
      actorType: "user",
      action: hrTimeClockAuditActions.sync.completed,
      targetType: "hr_time_clock_sync_batch",
      targetId: result.batchId,
      summary: "Offline time clock punches reconciled.",
      metadata: {
        deviceId: parsed.data.deviceId,
        insertedCount: result.insertedCount,
        duplicateCount: result.duplicateCount,
        source: "offline_reconcile",
      },
    });

    return actionSuccess({
      batchId: result.batchId,
      insertedCount: result.insertedCount,
      duplicateCount: result.duplicateCount,
    });
  } catch (error) {
    return mapIngestError(error);
  }
}
