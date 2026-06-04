import { and, count, eq, gte, sql } from "drizzle-orm";

import { runWithOrganizationContext } from "./client";
import {
  hrTimeClockDevices,
  hrTimeClockPunchExceptions,
  hrTimeClockRawPunches,
  hrTimeClockSyncBatches,
} from "./dbx-hr-time-clock";

export type HrTimeClockOverviewSnapshot = {
  deviceCount: number;
  activeDeviceCount: number;
  openExceptionCount: number;
  failedSyncCount: number;
  validPunchCount24h: number;
  pendingValidationCount: number;
};

/** Pattern B overview stats for Time Clock Integration workbench. */
export async function loadHrTimeClockOverviewSnapshot(input: {
  organizationId: string;
}): Promise<HrTimeClockOverviewSnapshot> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const since24h = new Date(Date.now() - 86_400_000);

    const [deviceStats] = await db
      .select({
        deviceCount: count(),
        activeDeviceCount: sql<number>`count(*) filter (where ${hrTimeClockDevices.status} = 'active')`,
      })
      .from(hrTimeClockDevices)
      .where(eq(hrTimeClockDevices.organizationId, input.organizationId));

    const [exceptionStats] = await db
      .select({ openExceptionCount: count() })
      .from(hrTimeClockPunchExceptions)
      .where(eq(hrTimeClockPunchExceptions.organizationId, input.organizationId));

    const [failedSyncStats] = await db
      .select({ failedSyncCount: count() })
      .from(hrTimeClockSyncBatches)
      .where(
        and(
          eq(hrTimeClockSyncBatches.organizationId, input.organizationId),
          eq(hrTimeClockSyncBatches.status, "failed"),
        ),
      );

    const [punchStats] = await db
      .select({
        validPunchCount24h: sql<number>`count(*) filter (where ${hrTimeClockRawPunches.validationStatus} = 'valid')`,
        pendingValidationCount: sql<number>`count(*) filter (where ${hrTimeClockRawPunches.validationStatus} = 'pending')`,
      })
      .from(hrTimeClockRawPunches)
      .where(
        and(
          eq(hrTimeClockRawPunches.organizationId, input.organizationId),
          gte(hrTimeClockRawPunches.punchedAt, since24h),
        ),
      );

    return {
      deviceCount: Number(deviceStats?.deviceCount ?? 0),
      activeDeviceCount: Number(deviceStats?.activeDeviceCount ?? 0),
      openExceptionCount: Number(exceptionStats?.openExceptionCount ?? 0),
      failedSyncCount: Number(failedSyncStats?.failedSyncCount ?? 0),
      validPunchCount24h: Number(punchStats?.validPunchCount24h ?? 0),
      pendingValidationCount: Number(punchStats?.pendingValidationCount ?? 0),
    };
  });
}

export type HrTimeClockReportGroupBy =
  | "employee"
  | "device"
  | "location"
  | "department"
  | "date"
  | "exception"
  | "sync_status";

export type HrTimeClockReportRow = {
  groupKey: string;
  groupLabel: string;
  metricCount: number;
  metricHours: number | null;
};

/** HRM-TCI-028 — summarized time clock reports. */
export async function summarizeHrTimeClockReport(input: {
  organizationId: string;
  groupBy: HrTimeClockReportGroupBy;
  limit?: number;
}): Promise<readonly HrTimeClockReportRow[]> {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 500);

  return runWithOrganizationContext(input.organizationId, async (db) => {
    switch (input.groupBy) {
      case "device": {
        const rows = await db
          .select({
            groupKey: hrTimeClockDevices.id,
            groupLabel: hrTimeClockDevices.name,
            metricCount: count(hrTimeClockRawPunches.id),
          })
          .from(hrTimeClockDevices)
          .leftJoin(
            hrTimeClockRawPunches,
            eq(hrTimeClockRawPunches.deviceId, hrTimeClockDevices.id),
          )
          .where(eq(hrTimeClockDevices.organizationId, input.organizationId))
          .groupBy(hrTimeClockDevices.id, hrTimeClockDevices.name)
          .orderBy(sql`count(${hrTimeClockRawPunches.id}) desc`)
          .limit(limit);
        return rows.map((row) => ({
          groupKey: row.groupKey,
          groupLabel: row.groupLabel,
          metricCount: Number(row.metricCount),
          metricHours: null,
        }));
      }
      case "location": {
        const rows = await db
          .select({
            groupKey: sql<string>`coalesce(${hrTimeClockDevices.locationCode}, 'unassigned')`,
            groupLabel: sql<string>`coalesce(${hrTimeClockDevices.locationCode}, 'Unassigned')`,
            metricCount: count(hrTimeClockRawPunches.id),
          })
          .from(hrTimeClockDevices)
          .leftJoin(
            hrTimeClockRawPunches,
            eq(hrTimeClockRawPunches.deviceId, hrTimeClockDevices.id),
          )
          .where(eq(hrTimeClockDevices.organizationId, input.organizationId))
          .groupBy(
            sql`coalesce(${hrTimeClockDevices.locationCode}, 'unassigned')`,
            sql`coalesce(${hrTimeClockDevices.locationCode}, 'Unassigned')`,
          )
          .orderBy(sql`count(${hrTimeClockRawPunches.id}) desc`)
          .limit(limit);
        return rows.map((row) => ({
          groupKey: row.groupKey,
          groupLabel: row.groupLabel,
          metricCount: Number(row.metricCount),
          metricHours: null,
        }));
      }
      case "exception": {
        const rows = await db
          .select({
            groupKey: hrTimeClockPunchExceptions.exceptionCode,
            groupLabel: hrTimeClockPunchExceptions.exceptionCode,
            metricCount: count(),
          })
          .from(hrTimeClockPunchExceptions)
          .where(
            eq(hrTimeClockPunchExceptions.organizationId, input.organizationId),
          )
          .groupBy(hrTimeClockPunchExceptions.exceptionCode)
          .orderBy(sql`count(*) desc`)
          .limit(limit);
        return rows.map((row) => ({
          groupKey: row.groupKey,
          groupLabel: row.groupLabel.replace(/_/g, " "),
          metricCount: Number(row.metricCount),
          metricHours: null,
        }));
      }
      case "sync_status": {
        const rows = await db
          .select({
            groupKey: hrTimeClockSyncBatches.status,
            groupLabel: hrTimeClockSyncBatches.status,
            metricCount: count(),
          })
          .from(hrTimeClockSyncBatches)
          .where(
            eq(hrTimeClockSyncBatches.organizationId, input.organizationId),
          )
          .groupBy(hrTimeClockSyncBatches.status)
          .orderBy(sql`count(*) desc`)
          .limit(limit);
        return rows.map((row) => ({
          groupKey: row.groupKey,
          groupLabel: row.groupLabel.replace(/_/g, " "),
          metricCount: Number(row.metricCount),
          metricHours: null,
        }));
      }
      case "date": {
        const rows = await db
          .select({
            groupKey: sql<string>`to_char(date_trunc('day', ${hrTimeClockRawPunches.punchedAt}), 'YYYY-MM-DD')`,
            groupLabel: sql<string>`to_char(date_trunc('day', ${hrTimeClockRawPunches.punchedAt}), 'YYYY-MM-DD')`,
            metricCount: count(),
          })
          .from(hrTimeClockRawPunches)
          .where(
            eq(hrTimeClockRawPunches.organizationId, input.organizationId),
          )
          .groupBy(sql`date_trunc('day', ${hrTimeClockRawPunches.punchedAt})`)
          .orderBy(sql`date_trunc('day', ${hrTimeClockRawPunches.punchedAt}) desc`)
          .limit(limit);
        return rows.map((row) => ({
          groupKey: row.groupKey,
          groupLabel: row.groupLabel,
          metricCount: Number(row.metricCount),
          metricHours: null,
        }));
      }
      case "employee":
      default: {
        const rows = await db
          .select({
            groupKey: hrTimeClockRawPunches.employeeId,
            groupLabel: sql<string>`coalesce(${hrTimeClockRawPunches.employeeId}, 'unmapped')`,
            metricCount: count(),
          })
          .from(hrTimeClockRawPunches)
          .where(
            eq(hrTimeClockRawPunches.organizationId, input.organizationId),
          )
          .groupBy(
            hrTimeClockRawPunches.employeeId,
            sql`coalesce(${hrTimeClockRawPunches.employeeId}, 'unmapped')`,
          )
          .orderBy(sql`count(*) desc`)
          .limit(limit);
        return rows.map((row) => ({
          groupKey: row.groupKey ?? "unmapped",
          groupLabel: row.groupLabel,
          metricCount: Number(row.metricCount),
          metricHours: null,
        }));
      }
    }
  });
}

