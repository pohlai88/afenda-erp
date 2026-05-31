import { timingSafeEqual } from "node:crypto";

import {
  authenticateApiCredential,
  getHrTimeClockDeviceByExternalId,
  listHrTimeClockDevicesWindow,
  listOrganizationsForCoreErpSeed,
  type HrTimeClockDeviceRow,
} from "@afenda/db";

import type { HrTimeClockIngestPunchInput } from "../schemas/hr.time.clock-integration-punch.schema";
import {
  ingestHrTimeClockAutomatedSyncBatch,
  ingestHrTimeClockDeviceSyncBatch,
} from "./hr.time.clock-integration-ingest.shared.server";

const HR_TIME_CLOCK_API_SCOPE = "erp.write";

export type HrTimeClockIngestAuthContext =
  | {
      mode: "api_credential";
      organizationId: string;
      credentialId: string;
    }
  | {
      mode: "device_credential";
      organizationId: string;
      device: HrTimeClockDeviceRow;
    };

function parseBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }
  const match = /^Bearer\s+(.+)$/i.exec(authorizationHeader.trim());
  return match?.[1]?.trim() || null;
}

function timingSafeSecretEqual(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(providedBuffer, expectedBuffer);
}

/** HRM-TCI-010 — org API key or per-device integration secret. */
export async function resolveHrTimeClockIngestAuth(input: {
  authorizationHeader: string | null;
  organizationIdHeader?: string | null;
  externalDeviceIdHeader?: string | null;
}): Promise<
  | { ok: true; context: HrTimeClockIngestAuthContext }
  | { ok: false; reason: string }
> {
  const bearer = parseBearerToken(input.authorizationHeader);
  if (!bearer) {
    return { ok: false, reason: "missing_bearer" };
  }

  const externalDeviceId = input.externalDeviceIdHeader?.trim();
  const organizationId = input.organizationIdHeader?.trim();

  if (externalDeviceId && organizationId) {
    const device = await getHrTimeClockDeviceByExternalId({
      organizationId,
      externalDeviceId,
    });
    if (!device?.apiCredentialRef) {
      return { ok: false, reason: "device_not_configured" };
    }
    if (!timingSafeSecretEqual(bearer, device.apiCredentialRef)) {
      return { ok: false, reason: "invalid_device_credential" };
    }
    if (device.status !== "active") {
      return { ok: false, reason: "device_inactive" };
    }
    return {
      ok: true,
      context: {
        mode: "device_credential",
        organizationId,
        device,
      },
    };
  }

  const apiAuth = await authenticateApiCredential({
    rawKey: bearer,
    requiredScope: HR_TIME_CLOCK_API_SCOPE,
  });
  if (!apiAuth.ok) {
    return { ok: false, reason: apiAuth.reason };
  }

  return {
    ok: true,
    context: {
      mode: "api_credential",
      organizationId: apiAuth.organizationId,
      credentialId: apiAuth.credentialId,
    },
  };
}

function isSyncEnabled(device: HrTimeClockDeviceRow): boolean {
  return Boolean(device.syncConfig?.enabled);
}

/** HRM-TCI-008/011 — pull punches for devices with automated sync enabled. */
export async function runHrTimeClockScheduledSyncForOrganization(input: {
  organizationId: string;
  punchesByDeviceId?: Readonly<
    Record<string, readonly HrTimeClockIngestPunchInput[]>
  >;
}): Promise<{
  deviceCount: number;
  syncedDeviceCount: number;
  insertedCount: number;
  duplicateCount: number;
  skippedDeviceIds: readonly string[];
}> {
  const window = await listHrTimeClockDevicesWindow({
    organizationId: input.organizationId,
    limit: 500,
    offset: 0,
    status: "active",
  });

  const dueDevices = window.rows.filter(isSyncEnabled);
  let syncedDeviceCount = 0;
  let insertedCount = 0;
  let duplicateCount = 0;
  const skippedDeviceIds: string[] = [];

  for (const device of dueDevices) {
    const punches = input.punchesByDeviceId?.[device.id] ?? [];
    if (punches.length === 0) {
      skippedDeviceIds.push(device.id);
      continue;
    }

    const batchKey = `scheduled:${device.id}:${new Date().toISOString().slice(0, 13)}`;
    const result = await ingestHrTimeClockAutomatedSyncBatch({
      organizationId: input.organizationId,
      deviceId: device.id,
      batchKey,
      punches,
    });
    syncedDeviceCount += 1;
    insertedCount += result.insertedCount;
    duplicateCount += result.duplicateCount;
  }

  return {
    deviceCount: dueDevices.length,
    syncedDeviceCount,
    insertedCount,
    duplicateCount,
    skippedDeviceIds,
  };
}

export async function runHrTimeClockScheduledSyncSweep(input?: {
  organizationId?: string | null;
}): Promise<Record<string, unknown>> {
  const explicitOrgId = input?.organizationId?.trim();
  if (explicitOrgId) {
    const result = await runHrTimeClockScheduledSyncForOrganization({
      organizationId: explicitOrgId,
    });
    return { mode: "single-org", organizationId: explicitOrgId, ...result };
  }

  const organizations = await listOrganizationsForCoreErpSeed();
  if (organizations.length === 0) {
    return { skipped: true, reason: "no_organizations" };
  }

  const results = await Promise.allSettled(
    organizations.map(async (organization) => {
      const result = await runHrTimeClockScheduledSyncForOrganization({
        organizationId: organization.id,
      });
      return { organizationId: organization.id, ...result };
    }),
  );

  const completed: Array<Record<string, unknown>> = [];
  const failed: string[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      completed.push(result.value);
      continue;
    }
    failed.push(
      result.reason instanceof Error
        ? result.reason.message
        : String(result.reason),
    );
  }

  return {
    mode: "all-orgs",
    organizationCount: organizations.length,
    syncedOrganizationCount: completed.length,
    failedOrganizationCount: failed.length,
    failedReasons: failed,
    organizations: completed,
  };
}

/** HRM-TCI-008 — operator-triggered sync for a single device. */
export async function triggerHrTimeClockDeviceSync(input: {
  organizationId: string;
  deviceId: string;
  batchKey?: string | null;
  punches?: readonly HrTimeClockIngestPunchInput[];
}) {
  const punches = input.punches ?? [];
  const batchKey =
    input.batchKey?.trim() ||
    `manual-sync:${input.deviceId}:${Date.now()}`;

  if (punches.length > 0) {
    return ingestHrTimeClockDeviceSyncBatch({
      organizationId: input.organizationId,
      deviceId: input.deviceId,
      batchKey,
      punches,
    });
  }

  return {
    batchId: null,
    insertedCount: 0,
    duplicateCount: 0,
    punchResults: [] as const,
    skipped: true,
    reason: "no_punches_supplied",
  };
}
