import { and, count, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { buildPaginatedWindow, clampPageSize } from "./list-window.shared";
import { hrEmployees } from "./hr";
import {
  hrTimeClockDevices,
  hrTimeClockRawPunches,
} from "./hr-time-clock";

export type HrTimeClockRawPunchRow = {
  id: string;
  deviceId: string;
  deviceName: string;
  externalDeviceId: string;
  employeeId: string | null;
  employeeNumber: string | null;
  employeeDisplayName: string | null;
  punchType: (typeof hrTimeClockRawPunches.$inferSelect)["punchType"];
  punchedAt: Date;
  capturedAt: Date;
  validationStatus: (typeof hrTimeClockRawPunches.$inferSelect)["validationStatus"];
  source: string;
  syncBatchId: string | null;
};

export type HrTimeClockRawPunchWindow = {
  rows: readonly HrTimeClockRawPunchRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrTimeClockValidatedPunchRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  deviceName: string;
  locationCode: string | null;
  punchType: (typeof hrTimeClockRawPunches.$inferSelect)["punchType"];
  punchedAt: Date;
  workDate: Date;
};

export type HrTimeClockValidatedPunchWindow = {
  rows: readonly HrTimeClockValidatedPunchRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

function employeeSearchFilter(trimmedSearch: string) {
  const pattern = `%${trimmedSearch}%`;
  return or(
    ilike(hrEmployees.employeeNumber, pattern),
    ilike(hrEmployees.legalName, pattern),
    ilike(hrEmployees.preferredName, pattern),
  )!;
}

/** HRM-TCI-006/029 — raw punch substrate window. */
export async function listHrTimeClockRawPunchesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  deviceId?: string;
  employeeId?: string;
  validationStatus?: (typeof hrTimeClockRawPunches.$inferSelect)["validationStatus"];
  punchedFrom?: Date;
  punchedTo?: Date;
}): Promise<HrTimeClockRawPunchWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrTimeClockRawPunches.organizationId, input.organizationId),
    ];

    if (input.deviceId) {
      conditions.push(eq(hrTimeClockRawPunches.deviceId, input.deviceId));
    }
    if (input.employeeId) {
      conditions.push(eq(hrTimeClockRawPunches.employeeId, input.employeeId));
    }
    if (input.validationStatus) {
      conditions.push(
        eq(hrTimeClockRawPunches.validationStatus, input.validationStatus),
      );
    }
    if (input.punchedFrom) {
      conditions.push(gte(hrTimeClockRawPunches.punchedAt, input.punchedFrom));
    }
    if (input.punchedTo) {
      conditions.push(lte(hrTimeClockRawPunches.punchedAt, input.punchedTo));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      conditions.push(
        or(
          ilike(hrTimeClockDevices.name, `%${trimmedSearch}%`),
          ilike(hrTimeClockDevices.externalDeviceId, `%${trimmedSearch}%`),
          employeeSearchFilter(trimmedSearch),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrTimeClockRawPunches)
      .innerJoin(
        hrTimeClockDevices,
        eq(hrTimeClockRawPunches.deviceId, hrTimeClockDevices.id),
      )
      .leftJoin(
        hrEmployees,
        eq(hrTimeClockRawPunches.employeeId, hrEmployees.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrTimeClockRawPunches.id,
        deviceId: hrTimeClockRawPunches.deviceId,
        deviceName: hrTimeClockDevices.name,
        externalDeviceId: hrTimeClockDevices.externalDeviceId,
        employeeId: hrTimeClockRawPunches.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        punchType: hrTimeClockRawPunches.punchType,
        punchedAt: hrTimeClockRawPunches.punchedAt,
        capturedAt: hrTimeClockRawPunches.capturedAt,
        validationStatus: hrTimeClockRawPunches.validationStatus,
        source: hrTimeClockRawPunches.source,
        syncBatchId: hrTimeClockRawPunches.syncBatchId,
      })
      .from(hrTimeClockRawPunches)
      .innerJoin(
        hrTimeClockDevices,
        eq(hrTimeClockRawPunches.deviceId, hrTimeClockDevices.id),
      )
      .leftJoin(
        hrEmployees,
        eq(hrTimeClockRawPunches.employeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(desc(hrTimeClockRawPunches.punchedAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        deviceId: row.deviceId,
        deviceName: row.deviceName,
        externalDeviceId: row.externalDeviceId,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName ?? row.legalName,
        punchType: row.punchType,
        punchedAt: row.punchedAt,
        capturedAt: row.capturedAt,
        validationStatus: row.validationStatus,
        source: row.source,
        syncBatchId: row.syncBatchId,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

/** HRM-TCI-021 — validated punches exposed to Leave & Attendance Management. */
export async function listHrTimeClockValidatedPunchesForLamWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  punchedFrom?: Date;
  punchedTo?: Date;
}): Promise<HrTimeClockValidatedPunchWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const punchedFrom =
    input.punchedFrom ??
    new Date(Date.now() - 14 * 86_400_000);
  const punchedTo = input.punchedTo ?? new Date();

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrTimeClockRawPunches.organizationId, input.organizationId),
      eq(hrTimeClockRawPunches.validationStatus, "valid"),
      sql`${hrTimeClockRawPunches.employeeId} IS NOT NULL`,
      gte(hrTimeClockRawPunches.punchedAt, punchedFrom),
      lte(hrTimeClockRawPunches.punchedAt, punchedTo),
    ];

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      conditions.push(employeeSearchFilter(trimmedSearch));
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrTimeClockRawPunches)
      .innerJoin(
        hrTimeClockDevices,
        eq(hrTimeClockRawPunches.deviceId, hrTimeClockDevices.id),
      )
      .innerJoin(
        hrEmployees,
        eq(hrTimeClockRawPunches.employeeId, hrEmployees.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrTimeClockRawPunches.id,
        employeeId: hrTimeClockRawPunches.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        deviceName: hrTimeClockDevices.name,
        locationCode: hrTimeClockDevices.locationCode,
        punchType: hrTimeClockRawPunches.punchType,
        punchedAt: hrTimeClockRawPunches.punchedAt,
      })
      .from(hrTimeClockRawPunches)
      .innerJoin(
        hrTimeClockDevices,
        eq(hrTimeClockRawPunches.deviceId, hrTimeClockDevices.id),
      )
      .innerJoin(
        hrEmployees,
        eq(hrTimeClockRawPunches.employeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(desc(hrTimeClockRawPunches.punchedAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId!,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName ?? row.legalName,
        deviceName: row.deviceName,
        locationCode: row.locationCode,
        punchType: row.punchType,
        punchedAt: row.punchedAt,
        workDate: new Date(
          Date.UTC(
            row.punchedAt.getUTCFullYear(),
            row.punchedAt.getUTCMonth(),
            row.punchedAt.getUTCDate(),
          ),
        ),
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}
