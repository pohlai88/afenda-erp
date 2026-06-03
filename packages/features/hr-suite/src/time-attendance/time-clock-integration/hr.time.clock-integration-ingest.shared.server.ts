import {
  classifyHrTimeClockPunchType,
  buildHrTimeClockIdempotencyKey,
  getHrTimeClockDeviceByExternalId,
  getHrTimeClockDeviceById,
  HrTimeClockCommandError,
  ingestHrTimeClockPunchBatch,
  ingestHrTimeClockPunches,
  type HrTimeClockIngestBatchResult,
  type HrTimeClockIngestPunchInput as DbHrTimeClockIngestPunchInput,
  type HrTimeClockPunchIngestSource,
} from "@afenda/db";

import type { HrTimeClockIngestPunchInput } from "./hr.time.clock-integration-punch.schema";

export {
  classifyHrTimeClockPunchType,
  buildHrTimeClockIdempotencyKey,
  HrTimeClockCommandError,
};
export type { HrTimeClockIngestBatchResult, HrTimeClockPunchIngestSource };

function toDbPunch(
  punch: HrTimeClockIngestPunchInput,
): DbHrTimeClockIngestPunchInput {
  return {
    externalPunchId: punch.externalPunchId,
    idempotencyKey: punch.idempotencyKey,
    punchType: punch.punchType,
    punchedAt: new Date(punch.punchedAt),
    capturedAt: punch.capturedAt ? new Date(punch.capturedAt) : undefined,
    employeeId: punch.employeeId,
    deviceUserId: punch.deviceUserId,
    badgeId: punch.badgeId,
    biometricId: punch.biometricId,
    clockId: punch.clockId,
    rawPayload: punch.rawPayload,
  };
}

export async function ingestHrTimeClockManualImportBatch(input: {
  organizationId: string;
  deviceId: string;
  batchKey?: string | null;
  punches: readonly HrTimeClockIngestPunchInput[];
}): Promise<HrTimeClockIngestBatchResult> {
  return ingestHrTimeClockPunches({
    organizationId: input.organizationId,
    deviceId: input.deviceId,
    source: "manual_import",
    batchKey: input.batchKey,
    punches: input.punches.map(toDbPunch),
  });
}

export async function ingestHrTimeClockApiPunchBatch(input: {
  organizationId: string;
  deviceId: string;
  batchKey?: string | null;
  offlineReconcile?: boolean;
  punches: readonly HrTimeClockIngestPunchInput[];
}): Promise<HrTimeClockIngestBatchResult> {
  const source: HrTimeClockPunchIngestSource = input.offlineReconcile
    ? "offline_reconcile"
    : "api_ingest";

  return ingestHrTimeClockPunches({
    organizationId: input.organizationId,
    deviceId: input.deviceId,
    source,
    batchKey: input.batchKey,
    punches: input.punches.map(toDbPunch),
  });
}

export async function ingestHrTimeClockAutomatedSyncBatch(input: {
  organizationId: string;
  deviceId: string;
  batchKey: string;
  punches: readonly HrTimeClockIngestPunchInput[];
}): Promise<HrTimeClockIngestBatchResult> {
  return ingestHrTimeClockPunchBatch({
    organizationId: input.organizationId,
    deviceId: input.deviceId,
    batchKey: input.batchKey,
    source: "scheduled_sync",
    punches: input.punches.map(toDbPunch),
  });
}

export async function ingestHrTimeClockDeviceSyncBatch(input: {
  organizationId: string;
  deviceId: string;
  batchKey: string;
  punches: readonly HrTimeClockIngestPunchInput[];
}): Promise<HrTimeClockIngestBatchResult> {
  return ingestHrTimeClockPunchBatch({
    organizationId: input.organizationId,
    deviceId: input.deviceId,
    batchKey: input.batchKey,
    source: "device_sync",
    punches: input.punches.map(toDbPunch),
  });
}

/** HRM-TCI-012 — delayed punches after connectivity returns. */
export async function ingestHrTimeClockOfflineReconcileBatch(input: {
  organizationId: string;
  deviceId: string;
  batchKey?: string | null;
  punches: readonly HrTimeClockIngestPunchInput[];
}): Promise<HrTimeClockIngestBatchResult> {
  return ingestHrTimeClockPunches({
    organizationId: input.organizationId,
    deviceId: input.deviceId,
    source: "offline_reconcile",
    batchKey: input.batchKey,
    punches: input.punches.map(toDbPunch),
  });
}

export async function resolveHrTimeClockIngestDevice(input: {
  organizationId: string;
  deviceId?: string | null;
  externalDeviceId?: string | null;
}) {
  if (input.deviceId?.trim()) {
    return getHrTimeClockDeviceById({
      organizationId: input.organizationId,
      deviceId: input.deviceId.trim(),
    });
  }

  const externalDeviceId = input.externalDeviceId?.trim();
  if (!externalDeviceId) {
    return null;
  }

  return getHrTimeClockDeviceByExternalId({
    organizationId: input.organizationId,
    externalDeviceId,
  });
}
