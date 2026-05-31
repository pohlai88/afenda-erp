import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./list-window.shared";
import { HrTimeClockCommandError } from "./hr-time-clock.types";
import { hrEmployees } from "./schema/hr";
import {
  hrTimeClockAuditEvents,
  hrTimeClockDevices,
  type HrTimeClockSyncConfig,
} from "./schema/hr-time-clock";

export type HrTimeClockDeviceRow = {
  id: string;
  externalDeviceId: string;
  name: string;
  deviceType: (typeof hrTimeClockDevices.$inferSelect)["deviceType"];
  locationCode: string | null;
  status: (typeof hrTimeClockDevices.$inferSelect)["status"];
  syncConfig: HrTimeClockSyncConfig;
  lastSyncAt: Date | null;
  apiCredentialRef: string | null;
  breaksEnabled: boolean;
  updatedAt: Date;
};

export type HrTimeClockDeviceWindow = {
  rows: readonly HrTimeClockDeviceRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

async function assertEmployeeExists(
  db: AfendaTransaction,
  organizationId: string,
  employeeId: string,
): Promise<void> {
  const [employee] = await db
    .select({ id: hrEmployees.id })
    .from(hrEmployees)
    .where(
      and(
        eq(hrEmployees.organizationId, organizationId),
        eq(hrEmployees.id, employeeId),
      ),
    )
    .limit(1);

  if (!employee) {
    throw new HrTimeClockCommandError("employee_not_found");
  }
}

export async function appendHrTimeClockAuditEvent(input: {
  organizationId: string;
  action: (typeof hrTimeClockAuditEvents.$inferSelect)["action"];
  summary: string;
  actorAuthUserId?: string | null;
  deviceId?: string | null;
  mappingId?: string | null;
  rawPunchId?: string | null;
  syncBatchId?: string | null;
  employeeId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<{ auditEventId: string }> {
  const auditEventId = createEntityId("hr_tci_audit");
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(hrTimeClockAuditEvents).values({
      id: auditEventId,
      organizationId: input.organizationId,
      action: input.action,
      summary: input.summary,
      actorAuthUserId: input.actorAuthUserId ?? null,
      deviceId: input.deviceId ?? null,
      mappingId: input.mappingId ?? null,
      rawPunchId: input.rawPunchId ?? null,
      syncBatchId: input.syncBatchId ?? null,
      employeeId: input.employeeId ?? null,
      metadata: input.metadata ?? {},
    });
  });
  return { auditEventId };
}

export async function listHrTimeClockDevicesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  status?: (typeof hrTimeClockDevices.$inferSelect)["status"];
  deviceType?: (typeof hrTimeClockDevices.$inferSelect)["deviceType"];
  locationCode?: string | null;
}): Promise<HrTimeClockDeviceWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrTimeClockDevices.organizationId, input.organizationId),
    ];

    if (input.status) {
      conditions.push(eq(hrTimeClockDevices.status, input.status));
    }

    if (input.deviceType) {
      conditions.push(eq(hrTimeClockDevices.deviceType, input.deviceType));
    }

    if (input.locationCode?.trim()) {
      conditions.push(
        eq(hrTimeClockDevices.locationCode, input.locationCode.trim()),
      );
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrTimeClockDevices.externalDeviceId, pattern),
          ilike(hrTimeClockDevices.name, pattern),
          ilike(hrTimeClockDevices.locationCode, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrTimeClockDevices)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrTimeClockDevices.id,
        externalDeviceId: hrTimeClockDevices.externalDeviceId,
        name: hrTimeClockDevices.name,
        deviceType: hrTimeClockDevices.deviceType,
        locationCode: hrTimeClockDevices.locationCode,
        status: hrTimeClockDevices.status,
        syncConfig: hrTimeClockDevices.syncConfig,
        lastSyncAt: hrTimeClockDevices.lastSyncAt,
        apiCredentialRef: hrTimeClockDevices.apiCredentialRef,
        breaksEnabled: hrTimeClockDevices.breaksEnabled,
        updatedAt: hrTimeClockDevices.updatedAt,
      })
      .from(hrTimeClockDevices)
      .where(whereClause)
      .orderBy(desc(hrTimeClockDevices.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const actualTotal = Number(totalRow?.total ?? 0);

    return buildPaginatedWindow({
      rows,
      pageSize,
      offset,
      totalCount: actualTotal,
    });
  });
}

export async function getHrTimeClockDeviceByExternalId(input: {
  organizationId: string;
  externalDeviceId: string;
}): Promise<HrTimeClockDeviceRow | null> {
  const externalDeviceId = input.externalDeviceId.trim();
  if (!externalDeviceId) {
    return null;
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        id: hrTimeClockDevices.id,
        externalDeviceId: hrTimeClockDevices.externalDeviceId,
        name: hrTimeClockDevices.name,
        deviceType: hrTimeClockDevices.deviceType,
        locationCode: hrTimeClockDevices.locationCode,
        status: hrTimeClockDevices.status,
        syncConfig: hrTimeClockDevices.syncConfig,
        lastSyncAt: hrTimeClockDevices.lastSyncAt,
        apiCredentialRef: hrTimeClockDevices.apiCredentialRef,
        breaksEnabled: hrTimeClockDevices.breaksEnabled,
        updatedAt: hrTimeClockDevices.updatedAt,
      })
      .from(hrTimeClockDevices)
      .where(
        and(
          eq(hrTimeClockDevices.organizationId, input.organizationId),
          eq(hrTimeClockDevices.externalDeviceId, externalDeviceId),
        ),
      )
      .limit(1);

    return row ?? null;
  });
}

export async function getHrTimeClockDeviceById(input: {
  organizationId: string;
  deviceId: string;
}): Promise<HrTimeClockDeviceRow | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        id: hrTimeClockDevices.id,
        externalDeviceId: hrTimeClockDevices.externalDeviceId,
        name: hrTimeClockDevices.name,
        deviceType: hrTimeClockDevices.deviceType,
        locationCode: hrTimeClockDevices.locationCode,
        status: hrTimeClockDevices.status,
        syncConfig: hrTimeClockDevices.syncConfig,
        lastSyncAt: hrTimeClockDevices.lastSyncAt,
        apiCredentialRef: hrTimeClockDevices.apiCredentialRef,
        breaksEnabled: hrTimeClockDevices.breaksEnabled,
        updatedAt: hrTimeClockDevices.updatedAt,
      })
      .from(hrTimeClockDevices)
      .where(
        and(
          eq(hrTimeClockDevices.organizationId, input.organizationId),
          eq(hrTimeClockDevices.id, input.deviceId),
        ),
      )
      .limit(1);

    return row ?? null;
  });
}

export async function registerHrTimeClockDeviceInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorAuthUserId: string;
    externalDeviceId: string;
    name: string;
    deviceType: (typeof hrTimeClockDevices.$inferSelect)["deviceType"];
    locationCode?: string | null;
    status?: (typeof hrTimeClockDevices.$inferSelect)["status"];
    syncConfig?: HrTimeClockSyncConfig;
    apiCredentialRef?: string | null;
    breaksEnabled?: boolean;
  },
): Promise<{ deviceId: string; created: boolean }> {
  const externalDeviceId = input.externalDeviceId.trim();
  if (!externalDeviceId) {
    throw new HrTimeClockCommandError("device_external_id_conflict");
  }

  const [existing] = await db
    .select({ id: hrTimeClockDevices.id })
    .from(hrTimeClockDevices)
    .where(
      and(
        eq(hrTimeClockDevices.organizationId, input.organizationId),
        eq(hrTimeClockDevices.externalDeviceId, externalDeviceId),
      ),
    )
    .limit(1);

  if (existing) {
    throw new HrTimeClockCommandError("device_external_id_conflict");
  }

  const deviceId = createEntityId("hr_tci_dev");
  await db.insert(hrTimeClockDevices).values({
    id: deviceId,
    organizationId: input.organizationId,
    externalDeviceId,
    name: input.name.trim(),
    deviceType: input.deviceType,
    locationCode: input.locationCode?.trim() || null,
    status: input.status ?? "inactive",
    syncConfig: input.syncConfig ?? { enabled: false },
    apiCredentialRef: input.apiCredentialRef?.trim() || null,
    breaksEnabled: input.breaksEnabled ?? false,
  });

  await db.insert(hrTimeClockAuditEvents).values({
    id: createEntityId("hr_tci_audit"),
    organizationId: input.organizationId,
    deviceId,
    action: "device_registered",
    actorAuthUserId: input.actorAuthUserId,
    summary: `Registered time clock device ${externalDeviceId}`,
    metadata: {
      externalDeviceId,
      deviceType: input.deviceType,
      created: true,
    },
  });

  return { deviceId, created: true };
}

export async function registerHrTimeClockDevice(input: {
  organizationId: string;
  actorAuthUserId: string;
  externalDeviceId: string;
  name: string;
  deviceType: (typeof hrTimeClockDevices.$inferSelect)["deviceType"];
  locationCode?: string | null;
  status?: (typeof hrTimeClockDevices.$inferSelect)["status"];
  syncConfig?: HrTimeClockSyncConfig;
  apiCredentialRef?: string | null;
  breaksEnabled?: boolean;
}): Promise<{ deviceId: string; created: boolean }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    registerHrTimeClockDeviceInTx(db, input),
  );
}

export async function updateHrTimeClockDeviceInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorAuthUserId: string;
    deviceId: string;
    name?: string;
    deviceType?: (typeof hrTimeClockDevices.$inferSelect)["deviceType"];
    locationCode?: string | null;
    status?: (typeof hrTimeClockDevices.$inferSelect)["status"];
    syncConfig?: HrTimeClockSyncConfig;
    apiCredentialRef?: string | null;
    breaksEnabled?: boolean;
    lastSyncAt?: Date | null;
  },
): Promise<{ deviceId: string }> {
  const [existing] = await db
    .select({
      id: hrTimeClockDevices.id,
      externalDeviceId: hrTimeClockDevices.externalDeviceId,
    })
    .from(hrTimeClockDevices)
    .where(
      and(
        eq(hrTimeClockDevices.organizationId, input.organizationId),
        eq(hrTimeClockDevices.id, input.deviceId),
      ),
    )
    .limit(1);

  if (!existing) {
    throw new HrTimeClockCommandError("device_not_found");
  }

  const patch: Partial<typeof hrTimeClockDevices.$inferInsert> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.deviceType !== undefined) patch.deviceType = input.deviceType;
  if (input.locationCode !== undefined) {
    patch.locationCode = input.locationCode?.trim() || null;
  }
  if (input.status !== undefined) patch.status = input.status;
  if (input.syncConfig !== undefined) patch.syncConfig = input.syncConfig;
  if (input.apiCredentialRef !== undefined) {
    patch.apiCredentialRef = input.apiCredentialRef?.trim() || null;
  }
  if (input.breaksEnabled !== undefined) patch.breaksEnabled = input.breaksEnabled;
  if (input.lastSyncAt !== undefined) patch.lastSyncAt = input.lastSyncAt;

  if (Object.keys(patch).length === 0) {
    return { deviceId: existing.id };
  }

  await db
    .update(hrTimeClockDevices)
    .set(patch)
    .where(eq(hrTimeClockDevices.id, existing.id));

  await db.insert(hrTimeClockAuditEvents).values({
    id: createEntityId("hr_tci_audit"),
    organizationId: input.organizationId,
    deviceId: existing.id,
    action: "device_updated",
    actorAuthUserId: input.actorAuthUserId,
    summary: `Updated time clock device ${existing.externalDeviceId}`,
    metadata: { patch },
  });

  return { deviceId: existing.id };
}

export async function updateHrTimeClockDevice(input: {
  organizationId: string;
  actorAuthUserId: string;
  deviceId: string;
  name?: string;
  deviceType?: (typeof hrTimeClockDevices.$inferSelect)["deviceType"];
  locationCode?: string | null;
  status?: (typeof hrTimeClockDevices.$inferSelect)["status"];
  syncConfig?: HrTimeClockSyncConfig;
  apiCredentialRef?: string | null;
  breaksEnabled?: boolean;
  lastSyncAt?: Date | null;
}): Promise<{ deviceId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    updateHrTimeClockDeviceInTx(db, input),
  );
}

export { assertEmployeeExists };
