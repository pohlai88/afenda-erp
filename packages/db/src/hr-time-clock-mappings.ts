import { and, count, desc, eq, or, type SQL } from "drizzle-orm";
import { runWithOrganizationContext, type AfendaTransaction } from "./client";
import { createEntityId } from "./ids";
import { buildPaginatedWindow, clampPageSize } from "./list-window.shared";
import {
  assertEmployeeExists,
} from "./hr-time-clock-devices";
import { HrTimeClockCommandError } from "./hr-time-clock.types";
import { hrEmployees } from "./hr";
import {
  hrTimeClockAuditEvents,
  hrTimeClockDevices,
  hrTimeClockEmployeeMappings,
} from "./hr-time-clock";

export type HrTimeClockEmployeeMappingRow = {
  id: string;
  deviceId: string;
  externalDeviceId: string;
  deviceName: string;
  employeeId: string;
  employeeNumber: string | null;
  employeeLegalName: string | null;
  employeePreferredName: string | null;
  deviceUserId: string | null;
  badgeId: string | null;
  biometricId: string | null;
  clockId: string | null;
  status: (typeof hrTimeClockEmployeeMappings.$inferSelect)["status"];
  updatedAt: Date;
};

export type HrTimeClockEmployeeMappingWindow = {
  rows: readonly HrTimeClockEmployeeMappingRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

function normalizeOptionalIdentity(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function assertMappingIdentityPresent(input: {
  deviceUserId?: string | null;
  badgeId?: string | null;
  biometricId?: string | null;
  clockId?: string | null;
}): void {
  if (
    !normalizeOptionalIdentity(input.deviceUserId) &&
    !normalizeOptionalIdentity(input.badgeId) &&
    !normalizeOptionalIdentity(input.biometricId) &&
    !normalizeOptionalIdentity(input.clockId)
  ) {
    throw new HrTimeClockCommandError("mapping_identity_required");
  }
}

async function assertDeviceExists(
  db: AfendaTransaction,
  organizationId: string,
  deviceId: string,
): Promise<{ id: string; externalDeviceId: string; name: string }> {
  const [device] = await db
    .select({
      id: hrTimeClockDevices.id,
      externalDeviceId: hrTimeClockDevices.externalDeviceId,
      name: hrTimeClockDevices.name,
    })
    .from(hrTimeClockDevices)
    .where(
      and(
        eq(hrTimeClockDevices.organizationId, organizationId),
        eq(hrTimeClockDevices.id, deviceId),
      ),
    )
    .limit(1);

  if (!device) {
    throw new HrTimeClockCommandError("device_not_found");
  }

  return device;
}

export async function listHrTimeClockEmployeeMappingsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  deviceId?: string;
  employeeId?: string;
  status?: (typeof hrTimeClockEmployeeMappings.$inferSelect)["status"];
}): Promise<HrTimeClockEmployeeMappingWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrTimeClockEmployeeMappings.organizationId, input.organizationId),
    ];

    if (input.deviceId) {
      conditions.push(eq(hrTimeClockEmployeeMappings.deviceId, input.deviceId));
    }

    if (input.employeeId) {
      conditions.push(
        eq(hrTimeClockEmployeeMappings.employeeId, input.employeeId),
      );
    }

    if (input.status) {
      conditions.push(eq(hrTimeClockEmployeeMappings.status, input.status));
    } else {
      conditions.push(eq(hrTimeClockEmployeeMappings.status, "active"));
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrTimeClockEmployeeMappings)
      .where(whereClause);

    const rows = await db
      .select({
        id: hrTimeClockEmployeeMappings.id,
        deviceId: hrTimeClockEmployeeMappings.deviceId,
        externalDeviceId: hrTimeClockDevices.externalDeviceId,
        deviceName: hrTimeClockDevices.name,
        employeeId: hrTimeClockEmployeeMappings.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        employeeLegalName: hrEmployees.legalName,
        employeePreferredName: hrEmployees.preferredName,
        deviceUserId: hrTimeClockEmployeeMappings.deviceUserId,
        badgeId: hrTimeClockEmployeeMappings.badgeId,
        biometricId: hrTimeClockEmployeeMappings.biometricId,
        clockId: hrTimeClockEmployeeMappings.clockId,
        status: hrTimeClockEmployeeMappings.status,
        updatedAt: hrTimeClockEmployeeMappings.updatedAt,
      })
      .from(hrTimeClockEmployeeMappings)
      .innerJoin(
        hrTimeClockDevices,
        eq(hrTimeClockEmployeeMappings.deviceId, hrTimeClockDevices.id),
      )
      .innerJoin(
        hrEmployees,
        eq(hrTimeClockEmployeeMappings.employeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(desc(hrTimeClockEmployeeMappings.updatedAt))
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

export async function getHrTimeClockEmployeeMappingById(input: {
  organizationId: string;
  mappingId: string;
}): Promise<HrTimeClockEmployeeMappingRow | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select({
        id: hrTimeClockEmployeeMappings.id,
        deviceId: hrTimeClockEmployeeMappings.deviceId,
        externalDeviceId: hrTimeClockDevices.externalDeviceId,
        deviceName: hrTimeClockDevices.name,
        employeeId: hrTimeClockEmployeeMappings.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        employeeLegalName: hrEmployees.legalName,
        employeePreferredName: hrEmployees.preferredName,
        deviceUserId: hrTimeClockEmployeeMappings.deviceUserId,
        badgeId: hrTimeClockEmployeeMappings.badgeId,
        biometricId: hrTimeClockEmployeeMappings.biometricId,
        clockId: hrTimeClockEmployeeMappings.clockId,
        status: hrTimeClockEmployeeMappings.status,
        updatedAt: hrTimeClockEmployeeMappings.updatedAt,
      })
      .from(hrTimeClockEmployeeMappings)
      .innerJoin(
        hrTimeClockDevices,
        eq(hrTimeClockEmployeeMappings.deviceId, hrTimeClockDevices.id),
      )
      .innerJoin(
        hrEmployees,
        eq(hrTimeClockEmployeeMappings.employeeId, hrEmployees.id),
      )
      .where(
        and(
          eq(hrTimeClockEmployeeMappings.organizationId, input.organizationId),
          eq(hrTimeClockEmployeeMappings.id, input.mappingId),
        ),
      )
      .limit(1);

    return row ?? null;
  });
}

export async function upsertHrTimeClockEmployeeMappingInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorAuthUserId: string;
    mappingId?: string;
    deviceId: string;
    employeeId: string;
    deviceUserId?: string | null;
    badgeId?: string | null;
    biometricId?: string | null;
    clockId?: string | null;
    status?: (typeof hrTimeClockEmployeeMappings.$inferSelect)["status"];
  },
): Promise<{ mappingId: string; created: boolean }> {
  assertMappingIdentityPresent(input);
  await assertDeviceExists(db, input.organizationId, input.deviceId);
  await assertEmployeeExists(db, input.organizationId, input.employeeId);

  const identity = {
    deviceUserId: normalizeOptionalIdentity(input.deviceUserId),
    badgeId: normalizeOptionalIdentity(input.badgeId),
    biometricId: normalizeOptionalIdentity(input.biometricId),
    clockId: normalizeOptionalIdentity(input.clockId),
  };

  if (input.mappingId) {
    const [existing] = await db
      .select({ id: hrTimeClockEmployeeMappings.id })
      .from(hrTimeClockEmployeeMappings)
      .where(
        and(
          eq(hrTimeClockEmployeeMappings.organizationId, input.organizationId),
          eq(hrTimeClockEmployeeMappings.id, input.mappingId),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new HrTimeClockCommandError("mapping_not_found");
    }

    await db
      .update(hrTimeClockEmployeeMappings)
      .set({
        deviceId: input.deviceId,
        employeeId: input.employeeId,
        ...identity,
        status: input.status ?? "active",
      })
      .where(eq(hrTimeClockEmployeeMappings.id, existing.id));

    await db.insert(hrTimeClockAuditEvents).values({
      id: createEntityId("hr_tci_audit"),
      organizationId: input.organizationId,
      deviceId: input.deviceId,
      mappingId: existing.id,
      employeeId: input.employeeId,
      action: "mapping_updated",
      actorAuthUserId: input.actorAuthUserId,
      summary: "Updated time clock employee mapping",
      metadata: { ...identity },
    });

    return { mappingId: existing.id, created: false };
  }

  const mappingId = createEntityId("hr_tci_map");
  await db.insert(hrTimeClockEmployeeMappings).values({
    id: mappingId,
    organizationId: input.organizationId,
    deviceId: input.deviceId,
    employeeId: input.employeeId,
    ...identity,
    status: input.status ?? "active",
  });

  await db.insert(hrTimeClockAuditEvents).values({
    id: createEntityId("hr_tci_audit"),
    organizationId: input.organizationId,
    deviceId: input.deviceId,
    mappingId,
    employeeId: input.employeeId,
    action: "mapping_created",
    actorAuthUserId: input.actorAuthUserId,
    summary: "Created time clock employee mapping",
    metadata: { ...identity },
  });

  return { mappingId, created: true };
}

export async function upsertHrTimeClockEmployeeMapping(input: {
  organizationId: string;
  actorAuthUserId: string;
  mappingId?: string;
  deviceId: string;
  employeeId: string;
  deviceUserId?: string | null;
  badgeId?: string | null;
  biometricId?: string | null;
  clockId?: string | null;
  status?: (typeof hrTimeClockEmployeeMappings.$inferSelect)["status"];
}): Promise<{ mappingId: string; created: boolean }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    upsertHrTimeClockEmployeeMappingInTx(db, input),
  );
}

export async function archiveHrTimeClockEmployeeMappingInTx(
  db: AfendaTransaction,
  input: {
    organizationId: string;
    actorAuthUserId: string;
    mappingId: string;
  },
): Promise<{ mappingId: string }> {
  const [existing] = await db
    .select({
      id: hrTimeClockEmployeeMappings.id,
      deviceId: hrTimeClockEmployeeMappings.deviceId,
      employeeId: hrTimeClockEmployeeMappings.employeeId,
    })
    .from(hrTimeClockEmployeeMappings)
    .where(
      and(
        eq(hrTimeClockEmployeeMappings.organizationId, input.organizationId),
        eq(hrTimeClockEmployeeMappings.id, input.mappingId),
      ),
    )
    .limit(1);

  if (!existing) {
    throw new HrTimeClockCommandError("mapping_not_found");
  }

  await db
    .update(hrTimeClockEmployeeMappings)
    .set({ status: "inactive" })
    .where(eq(hrTimeClockEmployeeMappings.id, existing.id));

  await db.insert(hrTimeClockAuditEvents).values({
    id: createEntityId("hr_tci_audit"),
    organizationId: input.organizationId,
    deviceId: existing.deviceId,
    mappingId: existing.id,
    employeeId: existing.employeeId,
    action: "mapping_archived",
    actorAuthUserId: input.actorAuthUserId,
    summary: "Archived time clock employee mapping",
  });

  return { mappingId: existing.id };
}

export async function archiveHrTimeClockEmployeeMapping(input: {
  organizationId: string;
  actorAuthUserId: string;
  mappingId: string;
}): Promise<{ mappingId: string }> {
  return runWithOrganizationContext(input.organizationId, (db) =>
    archiveHrTimeClockEmployeeMappingInTx(db, input),
  );
}

export async function resolveHrTimeClockEmployeeMapping(input: {
  organizationId: string;
  deviceId: string;
  deviceUserId?: string | null;
  badgeId?: string | null;
  biometricId?: string | null;
  clockId?: string | null;
}): Promise<(typeof hrTimeClockEmployeeMappings.$inferSelect) | null> {
  const deviceUserId = normalizeOptionalIdentity(input.deviceUserId);
  const badgeId = normalizeOptionalIdentity(input.badgeId);
  const biometricId = normalizeOptionalIdentity(input.biometricId);
  const clockId = normalizeOptionalIdentity(input.clockId);

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

  if (identityFilters.length === 0) {
    return null;
  }

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
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

    return row ?? null;
  });
}
