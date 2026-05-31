import { and, eq, or, type SQL } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { appendHrTimeClockAuditEvent } from "./hr-time-clock-devices";
import { HrTimeClockCommandError } from "./hr-time-clock.types";
import type { HrTimeClockPunchType } from "./hr-time-clock.types";
import { runHrTimeClockPunchValidationPipeline } from "./hr-time-clock-validation";
import {
  hrTimeClockDevices,
  hrTimeClockEmployeeMappings,
  hrTimeClockRawPunches,
  hrTimeClockSyncBatches,
} from "./schema/hr-time-clock";

export type HrTimeClockPunchIngestSource =
  | "device_sync"
  | "api_ingest"
  | "manual_import"
  | "scheduled_sync"
  | "offline_reconcile";

export type HrTimeClockIngestPunchInput = {
  externalPunchId?: string | null;
  idempotencyKey?: string | null;
  punchType?: string | null;
  punchedAt: Date;
  capturedAt?: Date | null;
  employeeId?: string | null;
  deviceUserId?: string | null;
  badgeId?: string | null;
  biometricId?: string | null;
  clockId?: string | null;
  rawPayload?: Record<string, unknown>;
};

export type HrTimeClockIngestPunchResult = {
  idempotencyKey: string;
  rawPunchId: string | null;
  status: "inserted" | "duplicate";
};

export type HrTimeClockIngestBatchResult = {
  batchId: string;
  insertedCount: number;
  duplicateCount: number;
  punchResults: readonly HrTimeClockIngestPunchResult[];
};

const punchTypeAliases: Record<string, HrTimeClockPunchType> = {
  clock_in: "clock_in",
  clock_out: "clock_out",
  break_in: "break_in",
  break_out: "break_out",
  break_start: "break_in",
  break_end: "break_out",
  breakstart: "break_in",
  breakend: "break_out",
  transfer: "transfer",
  correction: "correction",
};

export function classifyHrTimeClockPunchType(input: {
  punchType?: string | null;
  breaksEnabled: boolean;
}): HrTimeClockPunchType {
  const normalized = (input.punchType ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const classified = punchTypeAliases[normalized];
  if (!classified) {
    return "clock_in";
  }

  if (
    (classified === "break_in" || classified === "break_out") &&
    !input.breaksEnabled
  ) {
    return classified;
  }

  return classified;
}

export function buildHrTimeClockIdempotencyKey(input: {
  organizationId: string;
  deviceId: string;
  idempotencyKey?: string | null;
  externalPunchId?: string | null;
  punchType: HrTimeClockPunchType;
  punchedAt: Date;
  employeeId?: string | null;
  deviceUserId?: string | null;
}): string {
  const explicit = input.idempotencyKey?.trim();
  if (explicit) {
    return explicit;
  }

  const external = input.externalPunchId?.trim();
  if (external) {
    return `${input.deviceId}:${external}`;
  }

  const identity =
    input.employeeId?.trim() ||
    input.deviceUserId?.trim() ||
    "unknown";
  return `${input.deviceId}:${identity}:${input.punchType}:${input.punchedAt.toISOString()}`;
}

async function findRawPunchByIdempotencyKey(
  db: AfendaTransaction,
  input: { organizationId: string; idempotencyKey: string },
): Promise<{ id: string } | null> {
  const [row] = await db
    .select({ id: hrTimeClockRawPunches.id })
    .from(hrTimeClockRawPunches)
    .where(
      and(
        eq(hrTimeClockRawPunches.organizationId, input.organizationId),
        eq(hrTimeClockRawPunches.idempotencyKey, input.idempotencyKey),
      ),
    )
    .limit(1);

  return row ?? null;
}

async function ensureSyncBatchInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    deviceId: string;
    batchKey: string;
    source: HrTimeClockPunchIngestSource;
  },
): Promise<{ batchId: string; created: boolean }> {
  const batchKey = input.batchKey.trim();
  if (!batchKey) {
    throw new HrTimeClockCommandError("device_not_found");
  }

  const [existing] = await db
    .select({
      id: hrTimeClockSyncBatches.id,
      status: hrTimeClockSyncBatches.status,
    })
    .from(hrTimeClockSyncBatches)
    .where(
      and(
        eq(hrTimeClockSyncBatches.organizationId, input.organizationId),
        eq(hrTimeClockSyncBatches.batchKey, batchKey),
      ),
    )
    .limit(1);

  if (existing) {
    return { batchId: existing.id, created: false };
  }

  const batchId = createEntityId("hr_tci_batch");
  await db.insert(hrTimeClockSyncBatches).values({
    id: batchId,
    organizationId: input.organizationId,
    deviceId: input.deviceId,
    batchKey,
    status: "running",
    recordCount: 0,
  });

  await appendHrTimeClockAuditEvent({
    organizationId: input.organizationId,
    action: "sync_started",
    summary: `Time clock sync batch started (${input.source}).`,
    deviceId: input.deviceId,
    syncBatchId: batchId,
    metadata: { batchKey, source: input.source },
  });

  return { batchId, created: true };
}

async function ingestSinglePunchInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    deviceId: string;
    breaksEnabled: boolean;
    syncBatchId?: string | null;
    source: HrTimeClockPunchIngestSource;
    punch: HrTimeClockIngestPunchInput;
  },
): Promise<HrTimeClockIngestPunchResult> {
  const punchType = classifyHrTimeClockPunchType({
    punchType: input.punch.punchType,
    breaksEnabled: input.breaksEnabled,
  });
  const punchedAt = input.punch.punchedAt;
  const capturedAt = input.punch.capturedAt ?? punchedAt;
  const idempotencyKey = buildHrTimeClockIdempotencyKey({
    organizationId: input.organizationId,
    deviceId: input.deviceId,
    idempotencyKey: input.punch.idempotencyKey,
    externalPunchId: input.punch.externalPunchId,
    punchType,
    punchedAt,
    employeeId: input.punch.employeeId,
    deviceUserId: input.punch.deviceUserId,
  });

  const existing = await findRawPunchByIdempotencyKey(db, {
    organizationId: input.organizationId,
    idempotencyKey,
  });
  if (existing) {
    return {
      idempotencyKey,
      rawPunchId: existing.id,
      status: "duplicate",
    };
  }

  let employeeId = input.punch.employeeId?.trim() || null;
  let mappingId: string | null = null;

  if (!employeeId) {
    const deviceUserId = input.punch.deviceUserId?.trim() || null;
    const badgeId = input.punch.badgeId?.trim() || null;
    const biometricId = input.punch.biometricId?.trim() || null;
    const clockId = input.punch.clockId?.trim() || null;
    const identityFilters = [
      deviceUserId
        ? eq(hrTimeClockEmployeeMappings.deviceUserId, deviceUserId)
        : undefined,
      badgeId ? eq(hrTimeClockEmployeeMappings.badgeId, badgeId) : undefined,
      biometricId
        ? eq(hrTimeClockEmployeeMappings.biometricId, biometricId)
        : undefined,
      clockId ? eq(hrTimeClockEmployeeMappings.clockId, clockId) : undefined,
    ].filter(
      (
        condition,
      ): condition is Exclude<typeof condition, undefined | null> =>
        condition !== undefined && condition !== null,
    );

    if (identityFilters.length > 0) {
      const [mapping] = await db
        .select({
          id: hrTimeClockEmployeeMappings.id,
          employeeId: hrTimeClockEmployeeMappings.employeeId,
        })
        .from(hrTimeClockEmployeeMappings)
        .where(
          and(
            eq(hrTimeClockEmployeeMappings.organizationId, input.organizationId),
            eq(hrTimeClockEmployeeMappings.deviceId, input.deviceId),
            eq(hrTimeClockEmployeeMappings.status, "active"),
            or(...(identityFilters as SQL[])),
          ),
        )
        .limit(1);

      if (mapping) {
        employeeId = mapping.employeeId;
        mappingId = mapping.id;
      }
    }
  }

  const rawPunchId = createEntityId("hr_tci_punch");
  const isOffline =
    input.source === "offline_reconcile" ||
    capturedAt.getTime() !== punchedAt.getTime();

  await db.insert(hrTimeClockRawPunches).values({
    id: rawPunchId,
    organizationId: input.organizationId,
    deviceId: input.deviceId,
    mappingId,
    employeeId,
    externalPunchId: input.punch.externalPunchId?.trim() || null,
    punchType,
    punchedAt,
    capturedAt,
    source: input.source,
    syncBatchId: input.syncBatchId ?? null,
    idempotencyKey,
    validationStatus: "pending",
    rawPayload: {
      ...(input.punch.rawPayload ?? {}),
      ingestSource: input.source,
      offlineCaptured: isOffline,
    },
  });

  await appendHrTimeClockAuditEvent({
    organizationId: input.organizationId,
    action: "punch_captured",
    summary: `Raw punch captured (${punchType}).`,
    deviceId: input.deviceId,
    mappingId,
    rawPunchId,
    syncBatchId: input.syncBatchId ?? null,
    employeeId,
    metadata: {
      idempotencyKey,
      externalPunchId: input.punch.externalPunchId ?? null,
      source: input.source,
    },
  });

  return {
    idempotencyKey,
    rawPunchId,
    status: "inserted",
  };
}

async function completeSyncBatchInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    batchId: string;
    deviceId: string;
    recordCount: number;
    duplicateCount: number;
    failed?: boolean;
    errorMessage?: string | null;
  },
): Promise<void> {
  await db
    .update(hrTimeClockSyncBatches)
    .set({
      status: input.failed ? "failed" : "completed",
      completedAt: new Date(),
      recordCount: input.recordCount,
      errorMessage: input.errorMessage ?? null,
      updatedAt: new Date(),
    })
    .where(eq(hrTimeClockSyncBatches.id, input.batchId));

  await db
    .update(hrTimeClockDevices)
    .set({ lastSyncAt: new Date(), updatedAt: new Date() })
    .where(eq(hrTimeClockDevices.id, input.deviceId));

  await appendHrTimeClockAuditEvent({
    organizationId: input.organizationId,
    action: input.failed ? "sync_failed" : "sync_completed",
    summary: input.failed
      ? "Time clock sync batch failed."
      : "Time clock sync batch completed.",
    deviceId: input.deviceId,
    syncBatchId: input.batchId,
    metadata: {
      recordCount: input.recordCount,
      duplicateCount: input.duplicateCount,
      errorMessage: input.errorMessage ?? null,
    },
  });
}

export async function ingestHrTimeClockPunchBatch(input: {
  organizationId: string;
  deviceId: string;
  batchKey: string;
  source: HrTimeClockPunchIngestSource;
  punches: readonly HrTimeClockIngestPunchInput[];
  actorAuthUserId?: string | null;
}): Promise<HrTimeClockIngestBatchResult> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [device] = await db
      .select({
        id: hrTimeClockDevices.id,
        breaksEnabled: hrTimeClockDevices.breaksEnabled,
      })
      .from(hrTimeClockDevices)
      .where(
        and(
          eq(hrTimeClockDevices.organizationId, input.organizationId),
          eq(hrTimeClockDevices.id, input.deviceId),
        ),
      )
      .limit(1);

    if (!device) {
      throw new HrTimeClockCommandError("device_not_found");
    }

    const { batchId } = await ensureSyncBatchInTx(db, {
      organizationId: input.organizationId,
      deviceId: input.deviceId,
      batchKey: input.batchKey,
      source: input.source,
    });

    const punchResults: HrTimeClockIngestPunchResult[] = [];
    const insertedRawPunchIds: string[] = [];
    let insertedCount = 0;
    let duplicateCount = 0;

    for (const punch of input.punches) {
      const result = await ingestSinglePunchInTx(db, {
        organizationId: input.organizationId,
        deviceId: input.deviceId,
        breaksEnabled: device.breaksEnabled,
        syncBatchId: batchId,
        source: input.source,
        punch,
      });
      punchResults.push(result);
      if (result.status === "inserted") {
        insertedCount += 1;
        if (result.rawPunchId) {
          insertedRawPunchIds.push(result.rawPunchId);
        }
      } else {
        duplicateCount += 1;
      }
    }

    await completeSyncBatchInTx(db, {
      organizationId: input.organizationId,
      batchId,
      deviceId: input.deviceId,
      recordCount: insertedCount,
      duplicateCount,
    });

    return {
      batchId,
      insertedCount,
      duplicateCount,
      punchResults,
      insertedRawPunchIds,
    };
  }).then(async (batchResult) => {
    for (const rawPunchId of batchResult.insertedRawPunchIds) {
      await runHrTimeClockPunchValidationPipeline({
        organizationId: input.organizationId,
        rawPunchId,
        actorAuthUserId: input.actorAuthUserId ?? null,
      });
    }

    const { insertedRawPunchIds: _ignored, ...result } = batchResult;
    return result;
  });
}

export async function ingestHrTimeClockPunches(input: {
  organizationId: string;
  deviceId: string;
  source: HrTimeClockPunchIngestSource;
  punches: readonly HrTimeClockIngestPunchInput[];
  batchKey?: string | null;
}): Promise<HrTimeClockIngestBatchResult> {
  const batchKey =
    input.batchKey?.trim() ||
    `${input.source}:${input.deviceId}:${Date.now()}`;

  return ingestHrTimeClockPunchBatch({
    organizationId: input.organizationId,
    deviceId: input.deviceId,
    batchKey,
    source: input.source,
    punches: input.punches,
  });
}
