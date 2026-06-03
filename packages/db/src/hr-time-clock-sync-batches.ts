import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { buildPaginatedWindow, clampPageSize } from "./list-window.shared";
import {
  hrTimeClockDevices,
  hrTimeClockSyncBatches,
} from "./hr-time-clock";

export type HrTimeClockSyncBatchRow = {
  id: string;
  deviceId: string;
  deviceName: string;
  externalDeviceId: string;
  locationCode: string | null;
  batchKey: string;
  status: (typeof hrTimeClockSyncBatches.$inferSelect)["status"];
  startedAt: Date;
  completedAt: Date | null;
  recordCount: number;
  errorMessage: string | null;
};

export type HrTimeClockSyncBatchWindow = {
  rows: readonly HrTimeClockSyncBatchRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export type HrTimeClockSyncAlertRow = {
  id: string;
  deviceId: string;
  deviceName: string;
  locationCode: string | null;
  batchKey: string;
  startedAt: Date;
  errorMessage: string | null;
};

/** HRM-TCI-008/026 — sync batch ledger window. */
export async function listHrTimeClockSyncBatchesWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  deviceId?: string;
  status?: (typeof hrTimeClockSyncBatches.$inferSelect)["status"];
}): Promise<HrTimeClockSyncBatchWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrTimeClockSyncBatches.organizationId, input.organizationId),
    ];

    if (input.deviceId) {
      conditions.push(eq(hrTimeClockSyncBatches.deviceId, input.deviceId));
    }
    if (input.status) {
      conditions.push(eq(hrTimeClockSyncBatches.status, input.status));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrTimeClockSyncBatches.batchKey, pattern),
          ilike(hrTimeClockDevices.name, pattern),
          ilike(hrTimeClockDevices.externalDeviceId, pattern),
          ilike(hrTimeClockDevices.locationCode, pattern),
        )!,
      );
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrTimeClockSyncBatches)
      .innerJoin(
        hrTimeClockDevices,
        eq(hrTimeClockSyncBatches.deviceId, hrTimeClockDevices.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrTimeClockSyncBatches.id,
        deviceId: hrTimeClockSyncBatches.deviceId,
        deviceName: hrTimeClockDevices.name,
        externalDeviceId: hrTimeClockDevices.externalDeviceId,
        locationCode: hrTimeClockDevices.locationCode,
        batchKey: hrTimeClockSyncBatches.batchKey,
        status: hrTimeClockSyncBatches.status,
        startedAt: hrTimeClockSyncBatches.startedAt,
        completedAt: hrTimeClockSyncBatches.completedAt,
        recordCount: hrTimeClockSyncBatches.recordCount,
        errorMessage: hrTimeClockSyncBatches.errorMessage,
      })
      .from(hrTimeClockSyncBatches)
      .innerJoin(
        hrTimeClockDevices,
        eq(hrTimeClockSyncBatches.deviceId, hrTimeClockDevices.id),
      )
      .where(whereClause)
      .orderBy(desc(hrTimeClockSyncBatches.startedAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows,
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}

/** HRM-TCI-026 — failed sync batches as administrator alerts. */
export async function listHrTimeClockFailedSyncAlerts(input: {
  organizationId: string;
  limit?: number;
}): Promise<readonly HrTimeClockSyncAlertRow[]> {
  const pageSize = clampPageSize(input.limit ?? 25);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: hrTimeClockSyncBatches.id,
        deviceId: hrTimeClockSyncBatches.deviceId,
        deviceName: hrTimeClockDevices.name,
        locationCode: hrTimeClockDevices.locationCode,
        batchKey: hrTimeClockSyncBatches.batchKey,
        startedAt: hrTimeClockSyncBatches.startedAt,
        errorMessage: hrTimeClockSyncBatches.errorMessage,
      })
      .from(hrTimeClockSyncBatches)
      .innerJoin(
        hrTimeClockDevices,
        eq(hrTimeClockSyncBatches.deviceId, hrTimeClockDevices.id),
      )
      .where(
        and(
          eq(hrTimeClockSyncBatches.organizationId, input.organizationId),
          eq(hrTimeClockSyncBatches.status, "failed"),
        ),
      )
      .orderBy(desc(hrTimeClockSyncBatches.startedAt))
      .limit(pageSize);

    return rows;
  });
}
