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
} from "./hr.time.clock-integration-ingest.shared.server";
import { triggerHrTimeClockDeviceSync } from "./hr.time.clock-integration-sync.shared.server";
import { hrTimeClockAuditActions } from "./hr.time.clock-integration.event";
import {
  HrTimeClockAccessDeniedError,
  requireHrTimeClockWrite,
} from "./hr.time.clock-integration-access.policy.server";
import { hrTimeClockTriggerSyncSchema } from "./hr.time.clock-integration-sync.schema";

function mapSyncError(error: unknown): ActionResult<never> {
  if (error instanceof HrTimeClockCommandError) {
    return actionFailure(error.code);
  }
  if (error instanceof HrTimeClockAccessDeniedError) {
    return actionFailure(error.code);
  }
  if (error instanceof Error) {
    return actionFailure(error.message);
  }
  return actionFailure("hr_time_clock_sync_failed");
}

/** HRM-TCI-008 — operator-triggered punch synchronization. */
export async function triggerHrTimeClockSyncAction(
  input: unknown,
): Promise<
  ActionResult<{
    batchId: string | null;
    insertedCount: number;
    duplicateCount: number;
    skipped?: boolean;
    reason?: string;
  }>
> {
  const parsed = hrTimeClockTriggerSyncSchema.safeParse(input);
  if (!parsed.success) {
    return zodActionFailure(parsed.error);
  }

  let guard: Awaited<ReturnType<typeof requireHrTimeClockWrite>> | null = null;
  try {
    guard = await requireHrTimeClockWrite();
  } catch (error) {
    if (error instanceof HrTimeClockAccessDeniedError) {
      return actionFailure(error.code);
    }
    throw error;
  }

  try {
    const result = await triggerHrTimeClockDeviceSync({
      organizationId: guard!.organization.id,
      deviceId: parsed.data.deviceId,
      batchKey: parsed.data.batchKey,
      punches: parsed.data.punches,
    });

    const auditTargetId = result.batchId ?? parsed.data.deviceId;
    await writeExecutionAuditEvent({
      organizationId: guard!.organization.id,
      actorId: guard!.session.id,
      actorType: "user",
      action: result.batchId
        ? hrTimeClockAuditActions.sync.completed
        : hrTimeClockAuditActions.sync.started,
      targetType: "hr_time_clock_device",
      targetId: auditTargetId,
      summary: result.batchId
        ? "Time clock device sync completed."
        : "Time clock device sync started with no punch payload.",
      metadata: {
        deviceId: parsed.data.deviceId,
        insertedCount: result.insertedCount,
        duplicateCount: result.duplicateCount,
        skipped: "skipped" in result ? result.skipped : false,
      },
    });

    return actionSuccess({
      batchId: result.batchId,
      insertedCount: result.insertedCount,
      duplicateCount: result.duplicateCount,
      ...("skipped" in result
        ? { skipped: result.skipped, reason: result.reason }
        : {}),
    });
  } catch (error) {
    if (guard) {
      await writeExecutionAuditEvent({
        organizationId: guard.organization.id,
        actorId: guard.session.id,
        actorType: "user",
        action: hrTimeClockAuditActions.sync.failed,
        targetType: "hr_time_clock_device",
        targetId: parsed.data.deviceId,
        summary: "Time clock device sync failed.",
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      }).catch(() => undefined);
    }

    return mapSyncError(error);
  }
}
