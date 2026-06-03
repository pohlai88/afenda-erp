import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import { buildPaginatedWindow, clampPageSize } from "./list-window.shared";
import { hrEmployees } from "./hr";
import {
  hrTimeClockAuditEvents,
  hrTimeClockDevices,
} from "./hr-time-clock";

export type HrTimeClockAuditEventRow = {
  id: string;
  action: (typeof hrTimeClockAuditEvents.$inferSelect)["action"];
  summary: string;
  occurredAt: Date;
  actorAuthUserId: string | null;
  deviceName: string | null;
  employeeNumber: string | null;
  employeeDisplayName: string | null;
};

export type HrTimeClockAuditEventWindow = {
  rows: readonly HrTimeClockAuditEventRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

/** HRM-TCI-030 — append-only audit trail window. */
export async function listHrTimeClockAuditEventsWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  action?: (typeof hrTimeClockAuditEvents.$inferSelect)["action"];
}): Promise<HrTimeClockAuditEventWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrTimeClockAuditEvents.organizationId, input.organizationId),
    ];

    if (input.action) {
      conditions.push(eq(hrTimeClockAuditEvents.action, input.action));
    }

    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      const pattern = `%${trimmedSearch}%`;
      conditions.push(
        or(
          ilike(hrTimeClockAuditEvents.summary, pattern),
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
      .from(hrTimeClockAuditEvents)
      .leftJoin(
        hrTimeClockDevices,
        eq(hrTimeClockAuditEvents.deviceId, hrTimeClockDevices.id),
      )
      .leftJoin(
        hrEmployees,
        eq(hrTimeClockAuditEvents.employeeId, hrEmployees.id),
      )
      .where(whereClause);

    const rows = await db
      .select({
        id: hrTimeClockAuditEvents.id,
        action: hrTimeClockAuditEvents.action,
        summary: hrTimeClockAuditEvents.summary,
        occurredAt: hrTimeClockAuditEvents.occurredAt,
        actorAuthUserId: hrTimeClockAuditEvents.actorAuthUserId,
        deviceName: hrTimeClockDevices.name,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
      })
      .from(hrTimeClockAuditEvents)
      .leftJoin(
        hrTimeClockDevices,
        eq(hrTimeClockAuditEvents.deviceId, hrTimeClockDevices.id),
      )
      .leftJoin(
        hrEmployees,
        eq(hrTimeClockAuditEvents.employeeId, hrEmployees.id),
      )
      .where(whereClause)
      .orderBy(desc(hrTimeClockAuditEvents.occurredAt))
      .limit(pageSize)
      .offset(offset);

    return buildPaginatedWindow({
      rows: rows.map((row) => ({
        id: row.id,
        action: row.action,
        summary: row.summary,
        occurredAt: row.occurredAt,
        actorAuthUserId: row.actorAuthUserId,
        deviceName: row.deviceName,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName ?? row.legalName,
      })),
      pageSize,
      offset,
      totalCount: Number(totalRow?.total ?? 0),
    });
  });
}
