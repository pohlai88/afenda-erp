import {
  hrEmployees,
  hrGeoCheckinOutcomes,
  hrGeoRawCheckins,
  runWithOrganizationContext,
} from "@afenda/db";
import { and, count, desc, eq, gte, ilike, or, sql } from "drizzle-orm";

const DEFAULT_PAGE_SIZE = 25;

function clampPageSize(limit: number | undefined): number {
  if (!limit || limit < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(limit, 100);
}

function startOfUtcDay(value: Date): Date {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

export type HrGeoIntegrationFindingRow = {
  id: string;
  employeeId: string;
  employeeNumber: string;
  employeeDisplayName: string;
  workDate: Date;
  exposureStatus: string;
  detail: string;
};

export type HrGeoIntegrationFindingWindow = {
  rows: HrGeoIntegrationFindingRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

type IntegrationWindowInput = {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
  visibleEmployeeIds?: readonly string[] | null;
};

function employeeSearchFilter(trimmedSearch: string) {
  const pattern = `%${trimmedSearch}%`;
  return or(
    ilike(hrEmployees.employeeNumber, pattern),
    ilike(hrEmployees.legalName, pattern),
    ilike(hrEmployees.preferredName, pattern),
  )!;
}

/** HRM-GEO-024 — verified remote check-ins exposed to LAM. */
export async function listHrGeoLamExposureWindow(
  input: IntegrationWindowInput,
): Promise<HrGeoIntegrationFindingWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const since = startOfUtcDay(new Date(Date.now() - 14 * 86_400_000));

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrGeoCheckinOutcomes.organizationId, input.organizationId),
      gte(hrGeoCheckinOutcomes.workDate, since),
    ];
    if (input.visibleEmployeeIds) {
      conditions.push(
        sql`${hrGeoCheckinOutcomes.employeeId} = ANY(${input.visibleEmployeeIds})`,
      );
    }
    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      conditions.push(employeeSearchFilter(trimmedSearch));
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrGeoCheckinOutcomes)
      .innerJoin(hrEmployees, eq(hrGeoCheckinOutcomes.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrGeoCheckinOutcomes.id,
        employeeId: hrGeoCheckinOutcomes.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        workDate: hrGeoCheckinOutcomes.workDate,
        status: hrGeoCheckinOutcomes.status,
        lamAttendanceRecordId: hrGeoCheckinOutcomes.lamAttendanceRecordId,
      })
      .from(hrGeoCheckinOutcomes)
      .innerJoin(hrEmployees, eq(hrGeoCheckinOutcomes.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrGeoCheckinOutcomes.workDate))
      .limit(pageSize)
      .offset(offset);

    const totalCount = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName ?? row.legalName,
        workDate: row.workDate,
        exposureStatus: row.lamAttendanceRecordId ? "lam_exposed" : "not_exposed",
        detail: row.lamAttendanceRecordId ?? "—",
      })),
      pageSize,
      totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

/** HRM-GEO-025 — remote work-hour references for Overtime Management. */
export async function listHrGeoOvertimeReferenceWindow(
  input: IntegrationWindowInput,
): Promise<HrGeoIntegrationFindingWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const since = startOfUtcDay(new Date(Date.now() - 14 * 86_400_000));

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrGeoCheckinOutcomes.organizationId, input.organizationId),
      gte(hrGeoCheckinOutcomes.workDate, since),
      sql`${hrGeoCheckinOutcomes.overtimeReference} IS NOT NULL`,
    ];
    if (input.visibleEmployeeIds) {
      conditions.push(
        sql`${hrGeoCheckinOutcomes.employeeId} = ANY(${input.visibleEmployeeIds})`,
      );
    }
    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      conditions.push(employeeSearchFilter(trimmedSearch));
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrGeoCheckinOutcomes)
      .innerJoin(hrEmployees, eq(hrGeoCheckinOutcomes.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrGeoCheckinOutcomes.id,
        employeeId: hrGeoCheckinOutcomes.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        workDate: hrGeoCheckinOutcomes.workDate,
        overtimeReference: hrGeoCheckinOutcomes.overtimeReference,
        status: hrGeoCheckinOutcomes.status,
      })
      .from(hrGeoCheckinOutcomes)
      .innerJoin(hrEmployees, eq(hrGeoCheckinOutcomes.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrGeoCheckinOutcomes.workDate))
      .limit(pageSize)
      .offset(offset);

    const totalCount = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName ?? row.legalName,
        workDate: row.workDate,
        exposureStatus: row.status,
        detail: row.overtimeReference ?? "—",
      })),
      pageSize,
      totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

/** HRM-GEO-026 — approved remote outcomes exposed to Payroll Processing. */
export async function listHrGeoPayrollReferenceWindow(
  input: IntegrationWindowInput,
): Promise<HrGeoIntegrationFindingWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const since = startOfUtcDay(new Date(Date.now() - 14 * 86_400_000));

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrGeoCheckinOutcomes.organizationId, input.organizationId),
      gte(hrGeoCheckinOutcomes.workDate, since),
      sql`${hrGeoCheckinOutcomes.payrollDayReference} IS NOT NULL`,
    ];
    if (input.visibleEmployeeIds) {
      conditions.push(
        sql`${hrGeoCheckinOutcomes.employeeId} = ANY(${input.visibleEmployeeIds})`,
      );
    }
    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      conditions.push(employeeSearchFilter(trimmedSearch));
    }

    const whereClause = and(...conditions);

    const [totalRow] = await db
      .select({ total: count() })
      .from(hrGeoCheckinOutcomes)
      .innerJoin(hrEmployees, eq(hrGeoCheckinOutcomes.employeeId, hrEmployees.id))
      .where(whereClause);

    const rows = await db
      .select({
        id: hrGeoCheckinOutcomes.id,
        employeeId: hrGeoCheckinOutcomes.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        workDate: hrGeoCheckinOutcomes.workDate,
        payrollDayReference: hrGeoCheckinOutcomes.payrollDayReference,
        status: hrGeoCheckinOutcomes.status,
      })
      .from(hrGeoCheckinOutcomes)
      .innerJoin(hrEmployees, eq(hrGeoCheckinOutcomes.employeeId, hrEmployees.id))
      .where(whereClause)
      .orderBy(desc(hrGeoCheckinOutcomes.workDate))
      .limit(pageSize)
      .offset(offset);

    const totalCount = Number(totalRow?.total ?? 0);

    return {
      rows: rows.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        employeeDisplayName: row.preferredName ?? row.legalName,
        workDate: row.workDate,
        exposureStatus:
          row.status === "verified" || row.status === "corrected"
            ? "payroll_ready"
            : row.status,
        detail: row.payrollDayReference ?? "—",
      })),
      pageSize,
      totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

/** HRM-GEO-023 — raw geolocation captures vs approved outcomes. */
export async function listHrGeoRawVsApprovedWindow(
  input: IntegrationWindowInput,
): Promise<HrGeoIntegrationFindingWindow> {
  const pageSize = clampPageSize(input.limit);
  const offset = Math.max(0, input.offset ?? 0);
  const since = startOfUtcDay(new Date(Date.now() - 14 * 86_400_000));

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(hrGeoRawCheckins.organizationId, input.organizationId),
      gte(hrGeoRawCheckins.capturedAt, since),
    ];
    if (input.visibleEmployeeIds) {
      conditions.push(
        sql`${hrGeoRawCheckins.employeeId} = ANY(${input.visibleEmployeeIds})`,
      );
    }
    const trimmedSearch = input.search?.trim();
    if (trimmedSearch) {
      conditions.push(employeeSearchFilter(trimmedSearch));
    }

    const whereClause = and(...conditions);

    const grouped = await db
      .select({
        employeeId: hrGeoRawCheckins.employeeId,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        workDate: sql<Date>`date_trunc('day', ${hrGeoRawCheckins.capturedAt})`.as(
          "work_date",
        ),
        rawCount: count(hrGeoRawCheckins.id),
        outcomeStatus: sql<string | null>`max(${hrGeoCheckinOutcomes.status})`.as(
          "outcome_status",
        ),
        lamRecordId: sql<string | null>`max(${hrGeoCheckinOutcomes.lamAttendanceRecordId})`.as(
          "lam_record_id",
        ),
      })
      .from(hrGeoRawCheckins)
      .innerJoin(hrEmployees, eq(hrGeoRawCheckins.employeeId, hrEmployees.id))
      .leftJoin(
        hrGeoCheckinOutcomes,
        eq(hrGeoCheckinOutcomes.rawCheckinId, hrGeoRawCheckins.id),
      )
      .where(whereClause)
      .groupBy(
        hrGeoRawCheckins.employeeId,
        hrEmployees.employeeNumber,
        hrEmployees.legalName,
        hrEmployees.preferredName,
        sql`date_trunc('day', ${hrGeoRawCheckins.capturedAt})`,
      )
      .orderBy(desc(sql`date_trunc('day', ${hrGeoRawCheckins.capturedAt})`));

    const totalCount = grouped.length;
    const page = grouped.slice(offset, offset + pageSize);

    return {
      rows: page.map((row) => {
        const relationship = resolveRawVsApprovedRelationship(
          row.outcomeStatus,
          row.lamRecordId,
        );
        return {
          id: `${row.employeeId}:${startOfUtcDay(row.workDate).toISOString()}`,
          employeeId: row.employeeId,
          employeeNumber: row.employeeNumber,
          employeeDisplayName: row.preferredName ?? row.legalName,
          workDate: startOfUtcDay(row.workDate),
          exposureStatus: relationship,
          detail: String(row.rawCount),
        };
      }),
      pageSize,
      totalCount,
      hasNextPage: offset + pageSize < totalCount,
    };
  });
}

function resolveRawVsApprovedRelationship(
  outcomeStatus: string | null,
  lamRecordId: string | null,
): string {
  if (!outcomeStatus) {
    return "raw_without_approved_day";
  }
  if (outcomeStatus === "pending_review") {
    return "approved_day_open";
  }
  if (lamRecordId) {
    return outcomeStatus === "verified" || outcomeStatus === "corrected"
      ? "approved_day_computed"
      : "approved_day_open";
  }
  if (outcomeStatus === "verified" || outcomeStatus === "corrected") {
    return "approved_day_computed";
  }
  return "approved_day_open";
}
