import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { buildPaginatedWindow, clampPageSize } from "./list-window.shared";
import { hrEmployees } from "./schema/hr";
import {
  hrTimeClockDevices,
  hrTimeClockPunchExceptions,
  hrTimeClockRawPunches,
} from "./schema/hr-time-clock";

export type HrTimeClockPunchExceptionRow = {
  id: string;
  rawPunchId: string;
  exceptionCode: (typeof hrTimeClockPunchExceptions.$inferSelect)["exceptionCode"];
  employeeId: string | null;
  employeeNumber: string | null;
  employeeDisplayName: string | null;
  deviceName: string;
  locationCode: string | null;
  punchType: (typeof hrTimeClockRawPunches.$inferSelect)["punchType"];
  punchedAt: Date;
  validationStatus: (typeof hrTimeClockRawPunches.$inferSelect)["validationStatus"];
};

export type HrTimeClockPunchExceptionWindow = {
  rows: readonly HrTimeClockPunchExceptionRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

/** HRM-TCI-017/018/019 — punch exception flags window. */
export async function listHrTimeClockPunchExceptionsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  exceptionCode?: (typeof hrTimeClockPunchExceptions.$inferSelect)["exceptionCode"];
  deviceId?: string;
}): Promise<HrTimeClockPunchExceptionWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrTimeClockPunchExceptions.organizationId, input.organizationId),
    ];

    if (input.exceptionCode) {
      conditions.push(
        eq(hrTimeClockPunchExceptions.exceptionCode, input.exceptionCode),
      );
    }
    if (input.deviceId) {
      conditions.push(eq(hrTimeClockRawPunches.deviceId, input.deviceId));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrTimeClockDevices.name, pattern),
          ilike(hrEmployees.employeeNumber, pattern),
          ilike(hrEmployees.legalName, pattern),
          ilike(hrEmployees.preferredName, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrTimeClockPunchExceptions)
      .innerJoin(
        hrTimeClockRawPunches,
        eq(hrTimeClockPunchExceptions.rawPunchId, hrTimeClockRawPunches.id),
      )
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
        id: hrTimeClockPunchExceptions.id,
        rawPunchId: hrTimeClockPunchExceptions.rawPunchId,
        exceptionCode: hrTimeClockPunchExceptions.exceptionCode,
        employeeId: hrTimeClockRawPunches.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        deviceName: hrTimeClockDevices.name,
        locationCode: hrTimeClockDevices.locationCode,
        punchType: hrTimeClockRawPunches.punchType,
        punchedAt: hrTimeClockRawPunches.punchedAt,
        validationStatus: hrTimeClockRawPunches.validationStatus,
      })
      .from(hrTimeClockPunchExceptions)
      .innerJoin(
        hrTimeClockRawPunches,
        eq(hrTimeClockPunchExceptions.rawPunchId, hrTimeClockRawPunches.id),
      )
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
        rawPunchId: row.rawPunchId,
        exceptionCode: row.exceptionCode,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName ?? row.legalName,
        deviceName: row.deviceName,
        locationCode: row.locationCode,
        punchType: row.punchType,
        punchedAt: row.punchedAt,
        validationStatus: row.validationStatus,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}
