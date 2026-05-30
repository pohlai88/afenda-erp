import "@afenda/kernel/server";

import { and, eq, gte, inArray, isNull, lte } from "drizzle-orm";
import {
  hrAttendanceDays,
  hrDepartments,
  hrEmployees,
  hrLeaveRequests,
  runWithOrganizationContext,
} from "@afenda/db";

import {
  aggregateAatAbsenceMetrics,
  type HrAatApprovedLeaveSlice,
  type HrAatAttendanceDaySlice,
  type HrAatEmployeeDimensionContext,
} from "./hr.time.aat-analytics-core.shared";
import {
  hrAatAnalyticsQuerySchema,
  hrAatAnalyticsSnapshotSchema,
  type HrAatAnalyticsQuery,
  type HrAatAnalyticsSnapshot,
} from "../schemas/hr.time.aat-analytics.schema";

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function endOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

function displayName(input: {
  preferredName: string | null;
  legalName: string;
}): string {
  return input.preferredName?.trim() || input.legalName;
}

export class HrAatAnalyticsQueryError extends Error {
  readonly code: "aat_invalid_query" | "aat_empty_scope";

  constructor(code: HrAatAnalyticsQueryError["code"], message: string) {
    super(message);
    this.name = "HrAatAnalyticsQueryError";
    this.code = code;
  }
}

function parseAnalyticsQuery(input: unknown): HrAatAnalyticsQuery {
  const parsed = hrAatAnalyticsQuerySchema.safeParse(input);
  if (!parsed.success) {
    throw new HrAatAnalyticsQueryError(
      "aat_invalid_query",
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }
  return parsed.data;
}

async function loadAatDataset(input: {
  organizationId: string;
  query: HrAatAnalyticsQuery;
}): Promise<{
  employeeContexts: readonly HrAatEmployeeDimensionContext[];
  attendanceDays: readonly HrAatAttendanceDaySlice[];
  approvedLeaves: readonly HrAatApprovedLeaveSlice[];
}> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const employeeConditions = [
      eq(hrEmployees.organizationId, input.organizationId),
      isNull(hrEmployees.archivedAt),
    ];

    if (input.query.employeeId) {
      employeeConditions.push(eq(hrEmployees.id, input.query.employeeId));
    }
    if (input.query.departmentId) {
      employeeConditions.push(
        eq(hrEmployees.currentDepartmentId, input.query.departmentId),
      );
    }
    if (input.query.teamId) {
      employeeConditions.push(eq(hrEmployees.currentDepartmentId, input.query.teamId));
    }
    if (input.query.managerEmployeeId) {
      employeeConditions.push(
        eq(hrEmployees.managerEmployeeId, input.query.managerEmployeeId),
      );
    }
    if (input.query.workLocationCode) {
      employeeConditions.push(
        eq(hrEmployees.workLocationCode, input.query.workLocationCode),
      );
    }
    if (input.query.legalEntityCode) {
      employeeConditions.push(
        eq(hrEmployees.legalEntityCode, input.query.legalEntityCode),
      );
    }

    const employeeRows = await db
      .select({
        employeeId: hrEmployees.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        departmentId: hrEmployees.currentDepartmentId,
        departmentName: hrDepartments.name,
        departmentUnitType: hrDepartments.unitType,
        managerEmployeeId: hrEmployees.managerEmployeeId,
        legalEntityCode: hrEmployees.legalEntityCode,
        workLocationCode: hrEmployees.workLocationCode,
      })
      .from(hrEmployees)
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .where(and(...employeeConditions));

    if (employeeRows.length === 0) {
      return {
        employeeContexts: [],
        attendanceDays: [],
        approvedLeaves: [],
      };
    }

    const employeeIds = employeeRows.map((row) => row.employeeId);

    const attendanceRows = await db
      .select({
        employeeId: hrAttendanceDays.employeeId,
        workDate: hrAttendanceDays.workDate,
        status: hrAttendanceDays.status,
      })
      .from(hrAttendanceDays)
      .where(
        and(
          eq(hrAttendanceDays.organizationId, input.organizationId),
          inArray(hrAttendanceDays.employeeId, employeeIds),
          gte(hrAttendanceDays.workDate, startOfUtcDay(input.query.periodStart)),
          lte(hrAttendanceDays.workDate, endOfUtcDay(input.query.periodEnd)),
        ),
      );

    const leaveRows = await db
      .select({
        employeeId: hrLeaveRequests.employeeId,
        leaveRequestId: hrLeaveRequests.id,
        leaveType: hrLeaveRequests.leaveType,
        durationDays: hrLeaveRequests.durationDays,
        startAt: hrLeaveRequests.startAt,
        endAt: hrLeaveRequests.endAt,
      })
      .from(hrLeaveRequests)
      .where(
        and(
          eq(hrLeaveRequests.organizationId, input.organizationId),
          eq(hrLeaveRequests.status, "approved"),
          inArray(hrLeaveRequests.employeeId, employeeIds),
          lte(hrLeaveRequests.startAt, endOfUtcDay(input.query.periodEnd)),
          gte(hrLeaveRequests.endAt, startOfUtcDay(input.query.periodStart)),
        ),
      );

    const employeeContexts: HrAatEmployeeDimensionContext[] = employeeRows.map(
      (row) => ({
        employeeId: row.employeeId,
        employeeNumber: row.employeeNumber,
        displayName: displayName(row),
        departmentId: row.departmentId,
        departmentName: row.departmentName,
        departmentUnitType: row.departmentUnitType,
        managerEmployeeId: row.managerEmployeeId,
        legalEntityCode: row.legalEntityCode,
        workLocationCode: row.workLocationCode,
      }),
    );

    const attendanceDays: HrAatAttendanceDaySlice[] = attendanceRows.map(
      (row) => ({
        employeeId: row.employeeId,
        workDate: row.workDate,
        status: row.status,
      }),
    );

    const approvedLeaves: HrAatApprovedLeaveSlice[] = leaveRows.map((row) => ({
      employeeId: row.employeeId,
      leaveRequestId: row.leaveRequestId,
      leaveType: row.leaveType,
      durationDays: Number(row.durationDays),
      startAt: row.startAt,
      endAt: row.endAt,
    }));

    return {
      employeeContexts,
      attendanceDays,
      approvedLeaves,
    };
  });
}

/** HRM-AAT-001 … HRM-AAT-005 — tenant-scoped absence analytics query. */
export async function queryHrAatAbsenceAnalytics(input: {
  organizationId: string;
  query: unknown;
}): Promise<HrAatAnalyticsSnapshot> {
  const query = parseAnalyticsQuery(input.query);

  const dataset = await loadAatDataset({
    organizationId: input.organizationId,
    query,
  });

  const aggregated = aggregateAatAbsenceMetrics({
    dimension: query.dimension,
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    employeeContexts: dataset.employeeContexts,
    attendanceDays: dataset.attendanceDays,
    approvedLeaves: dataset.approvedLeaves,
  });

  const parsedSnapshot = hrAatAnalyticsSnapshotSchema.safeParse(aggregated);
  if (!parsedSnapshot.success) {
    throw new HrAatAnalyticsQueryError(
      "aat_invalid_query",
      parsedSnapshot.error.issues.map((issue) => issue.message).join("; "),
    );
  }

  return parsedSnapshot.data;
}

/** HRM-AAT-002 — absence rate only (parallel-friendly slice). */
export async function queryHrAatAbsenceRates(input: {
  organizationId: string;
  query: unknown;
}) {
  const snapshot = await queryHrAatAbsenceAnalytics(input);
  return {
    dimension: snapshot.dimension,
    periodStart: snapshot.periodStart,
    periodEnd: snapshot.periodEnd,
    rows: snapshot.absenceRates,
    totals: {
      absenceRatePercent: snapshot.totals.absenceRatePercent,
      lostWorkdays: snapshot.totals.totalLostWorkdays,
      scheduledWorkdays: snapshot.totals.scheduledWorkdays,
    },
  };
}

/** HRM-AAT-003 — absence frequency only (parallel-friendly slice). */
export async function queryHrAatAbsenceFrequency(input: {
  organizationId: string;
  query: unknown;
}) {
  const snapshot = await queryHrAatAbsenceAnalytics(input);
  return {
    dimension: snapshot.dimension,
    periodStart: snapshot.periodStart,
    periodEnd: snapshot.periodEnd,
    rows: snapshot.absenceFrequencies,
    totals: {
      absenceEpisodeCount: snapshot.totals.absenceEpisodeCount,
      employeeCount: snapshot.totals.employeeCount,
    },
  };
}

/** HRM-AAT-004 — lost workdays only (parallel-friendly slice). */
export async function queryHrAatLostWorkdays(input: {
  organizationId: string;
  query: unknown;
}) {
  const snapshot = await queryHrAatAbsenceAnalytics(input);
  return {
    dimension: snapshot.dimension,
    periodStart: snapshot.periodStart,
    periodEnd: snapshot.periodEnd,
    rows: snapshot.lostWorkdays,
    totals: {
      totalLostWorkdays: snapshot.totals.totalLostWorkdays,
    },
  };
}

/** HRM-AAT-005 — duration by leave type only (parallel-friendly slice). */
export async function queryHrAatDurationByLeaveType(input: {
  organizationId: string;
  query: unknown;
}) {
  const snapshot = await queryHrAatAbsenceAnalytics(input);
  return {
    periodStart: snapshot.periodStart,
    periodEnd: snapshot.periodEnd,
    rows: snapshot.durationByLeaveType,
    totals: {
      totalLostWorkdays: snapshot.totals.totalLostWorkdays,
    },
  };
}
