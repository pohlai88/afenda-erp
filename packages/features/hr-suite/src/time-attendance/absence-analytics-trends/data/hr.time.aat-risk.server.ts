import "@afenda/kernel/server";

import { and, eq, gte, inArray, isNull, lte, sql } from "drizzle-orm";
import {
  hrAatAbsenceRiskThresholds,
  hrAatCorrectiveActionRefs,
  hrAttendanceDays,
  hrEmployees,
  hrLeaveRequests,
  runWithOrganizationContext,
} from "@afenda/db";

import {
  classifyHrAatAbsenceRisk,
  resolveHrAatAbsenceRiskThresholds,
} from "../policies/hr.time.aat-risk-threshold.policy.server";
import {
  buildAatAbsenceEpisodes,
  computeAatAbsenceRate,
  computeAatAbsenceFrequency,
  computeAatTotalLostWorkdays,
  HR_AAT_SCHEDULED_ATTENDANCE_STATUSES,
  type HrAatApprovedLeaveSlice,
  type HrAatAttendanceDaySlice,
} from "./hr.time.aat-analytics-core.shared";
import {
  formatHrAatAbsenceRiskLevelLabel,
  hrAatAbsenceRiskIndicatorsResultSchema,
  hrAatAbsenceRiskThresholdsSchema,
  hrAatRiskQuerySchema,
  type HrAatAbsenceRiskIndicator,
  type HrAatAbsenceRiskIndicatorsResult,
  type HrAatAbsenceRiskThresholds,
  type HrAatRiskQuery,
} from "../schemas/hr.time.aat-risk.schema";

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

function parseThresholdRow(row: {
  watchAbsenceRatePercent: string;
  atRiskAbsenceRatePercent: string;
  highRiskAbsenceRatePercent: string;
  criticalAbsenceRatePercent: string;
  watchAbsenceFrequency: number;
  atRiskAbsenceFrequency: number;
  highRiskAbsenceFrequency: number;
  criticalAbsenceFrequency: number;
}): HrAatAbsenceRiskThresholds {
  return hrAatAbsenceRiskThresholdsSchema.parse({
    watchAbsenceRatePercent: Number(row.watchAbsenceRatePercent),
    atRiskAbsenceRatePercent: Number(row.atRiskAbsenceRatePercent),
    highRiskAbsenceRatePercent: Number(row.highRiskAbsenceRatePercent),
    criticalAbsenceRatePercent: Number(row.criticalAbsenceRatePercent),
    watchAbsenceFrequency: row.watchAbsenceFrequency,
    atRiskAbsenceFrequency: row.atRiskAbsenceFrequency,
    highRiskAbsenceFrequency: row.highRiskAbsenceFrequency,
    criticalAbsenceFrequency: row.criticalAbsenceFrequency,
  });
}

export class HrAatRiskQueryError extends Error {
  readonly code: "aat_invalid_risk_query" | "aat_empty_risk_scope";

  constructor(code: HrAatRiskQueryError["code"], message: string) {
    super(message);
    this.name = "HrAatRiskQueryError";
    this.code = code;
  }
}

function parseRiskQuery(input: unknown): HrAatRiskQuery {
  const parsed = hrAatRiskQuerySchema.safeParse(input);
  if (!parsed.success) {
    throw new HrAatRiskQueryError(
      "aat_invalid_risk_query",
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }
  return parsed.data;
}

/** HRM-AAT-018 — load org absence risk thresholds (defaults when unset). */
export async function getHrAatAbsenceRiskThresholds(input: {
  organizationId: string;
}): Promise<HrAatAbsenceRiskThresholds> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const [row] = await db
      .select()
      .from(hrAatAbsenceRiskThresholds)
      .where(eq(hrAatAbsenceRiskThresholds.organizationId, input.organizationId))
      .limit(1);

    if (!row) {
      return resolveHrAatAbsenceRiskThresholds(null);
    }
    return parseThresholdRow(row);
  });
}

/** HRM-AAT-018 — persist org absence risk thresholds. */
export async function upsertHrAatAbsenceRiskThresholds(input: {
  organizationId: string;
  thresholds: unknown;
  updatedByAuthUserId: string;
}): Promise<HrAatAbsenceRiskThresholds> {
  const thresholds = resolveHrAatAbsenceRiskThresholds(
    hrAatAbsenceRiskThresholdsSchema.parse(input.thresholds),
  );

  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(hrAatAbsenceRiskThresholds)
      .values({
        organizationId: input.organizationId,
        watchAbsenceRatePercent: String(thresholds.watchAbsenceRatePercent),
        atRiskAbsenceRatePercent: String(thresholds.atRiskAbsenceRatePercent),
        highRiskAbsenceRatePercent: String(thresholds.highRiskAbsenceRatePercent),
        criticalAbsenceRatePercent: String(thresholds.criticalAbsenceRatePercent),
        watchAbsenceFrequency: thresholds.watchAbsenceFrequency,
        atRiskAbsenceFrequency: thresholds.atRiskAbsenceFrequency,
        highRiskAbsenceFrequency: thresholds.highRiskAbsenceFrequency,
        criticalAbsenceFrequency: thresholds.criticalAbsenceFrequency,
        updatedByAuthUserId: input.updatedByAuthUserId,
      })
      .onConflictDoUpdate({
        target: hrAatAbsenceRiskThresholds.organizationId,
        set: {
          watchAbsenceRatePercent: String(thresholds.watchAbsenceRatePercent),
          atRiskAbsenceRatePercent: String(thresholds.atRiskAbsenceRatePercent),
          highRiskAbsenceRatePercent: String(thresholds.highRiskAbsenceRatePercent),
          criticalAbsenceRatePercent: String(thresholds.criticalAbsenceRatePercent),
          watchAbsenceFrequency: thresholds.watchAbsenceFrequency,
          atRiskAbsenceFrequency: thresholds.atRiskAbsenceFrequency,
          highRiskAbsenceFrequency: thresholds.highRiskAbsenceFrequency,
          criticalAbsenceFrequency: thresholds.criticalAbsenceFrequency,
          updatedByAuthUserId: input.updatedByAuthUserId,
          updatedAt: sql`now()`,
        },
      });
  });

  return thresholds;
}

async function loadEmployeeRiskDataset(input: {
  organizationId: string;
  query: HrAatRiskQuery;
  visibleEmployeeIds: readonly string[] | null;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const employeeConditions = [
      eq(hrEmployees.organizationId, input.organizationId),
      isNull(hrEmployees.archivedAt),
    ];

    if (input.query.employeeId) {
      employeeConditions.push(eq(hrEmployees.id, input.query.employeeId));
    }
    if (input.query.managerEmployeeId) {
      employeeConditions.push(
        eq(hrEmployees.managerEmployeeId, input.query.managerEmployeeId),
      );
    }
    if (input.query.departmentId) {
      employeeConditions.push(
        eq(hrEmployees.currentDepartmentId, input.query.departmentId),
      );
    }
    if (input.visibleEmployeeIds) {
      if (input.visibleEmployeeIds.length === 0) {
        return { employees: [], attendanceDays: [], approvedLeaves: [] };
      }
      employeeConditions.push(
        inArray(hrEmployees.id, [...input.visibleEmployeeIds]),
      );
    }

    const employees = await db
      .select({
        employeeId: hrEmployees.id,
        employeeNumber: hrEmployees.employeeNumber,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
      })
      .from(hrEmployees)
      .where(and(...employeeConditions));

    if (employees.length === 0) {
      return { employees: [], attendanceDays: [], approvedLeaves: [] };
    }

    const employeeIds = employees.map((row) => row.employeeId);
    const periodStart = startOfUtcDay(input.query.periodStart);
    const periodEnd = endOfUtcDay(input.query.periodEnd);

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
          gte(hrAttendanceDays.workDate, periodStart),
          lte(hrAttendanceDays.workDate, periodEnd),
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
          lte(hrLeaveRequests.startAt, periodEnd),
          gte(hrLeaveRequests.endAt, periodStart),
        ),
      );

    return {
      employees,
      attendanceDays: attendanceRows as readonly HrAatAttendanceDaySlice[],
      approvedLeaves: leaveRows.map((row) => ({
        employeeId: row.employeeId,
        leaveRequestId: row.leaveRequestId,
        leaveType: row.leaveType,
        durationDays: Number(row.durationDays),
        startAt: row.startAt,
        endAt: row.endAt,
      })) satisfies readonly HrAatApprovedLeaveSlice[],
    };
  });
}

function buildEmployeeRiskIndicators(input: {
  periodStart: Date;
  periodEnd: Date;
  thresholds: HrAatAbsenceRiskThresholds;
  employees: readonly {
    employeeId: string;
    employeeNumber: string;
    legalName: string;
    preferredName: string | null;
  }[];
  attendanceDays: readonly HrAatAttendanceDaySlice[];
  approvedLeaves: readonly HrAatApprovedLeaveSlice[];
  correctiveRefCounts: ReadonlyMap<string, number>;
}): HrAatAbsenceRiskIndicator[] {
  const attendanceByEmployee = new Map<string, HrAatAttendanceDaySlice[]>();
  const leavesByEmployee = new Map<string, HrAatApprovedLeaveSlice[]>();

  for (const day of input.attendanceDays) {
    const bucket = attendanceByEmployee.get(day.employeeId) ?? [];
    bucket.push(day);
    attendanceByEmployee.set(day.employeeId, bucket);
  }
  for (const leave of input.approvedLeaves) {
    const bucket = leavesByEmployee.get(leave.employeeId) ?? [];
    bucket.push(leave);
    leavesByEmployee.set(leave.employeeId, bucket);
  }

  const indicators: HrAatAbsenceRiskIndicator[] = [];

  for (const employee of input.employees) {
    const employeeAttendance = attendanceByEmployee.get(employee.employeeId) ?? [];
    const employeeLeaves = leavesByEmployee.get(employee.employeeId) ?? [];
    const episodeBundle = buildAatAbsenceEpisodes({
      attendanceDays: employeeAttendance,
      approvedLeaves: employeeLeaves,
    });
    const lostWorkdays = computeAatTotalLostWorkdays({
      attendanceAbsentDays: episodeBundle.attendanceAbsentDays,
      approvedLeaveDays: episodeBundle.approvedLeaveDays,
      overlapDays: episodeBundle.overlapDays,
    });
    let scheduledWorkdays = 0;
    for (const day of employeeAttendance) {
      if (HR_AAT_SCHEDULED_ATTENDANCE_STATUSES.has(day.status)) {
        scheduledWorkdays += 1;
      }
    }
    const absenceFrequency = computeAatAbsenceFrequency(episodeBundle.episodes);
    const absenceRatePercent = computeAatAbsenceRate({
      lostWorkdays,
      scheduledWorkdays,
    });
    const classified = classifyHrAatAbsenceRisk({
      absenceRatePercent,
      absenceFrequency,
      thresholds: input.thresholds,
    });

    indicators.push({
      employeeId: employee.employeeId,
      employeeNumber: employee.employeeNumber,
      employeeDisplayName: displayName(employee),
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      lostWorkdays,
      absenceFrequency,
      absenceRatePercent,
      riskLevel: classified.riskLevel,
      riskLevelLabel: formatHrAatAbsenceRiskLevelLabel(classified.riskLevel),
      breachedSignals: classified.breachedSignals,
      correctiveActionRefCount:
        input.correctiveRefCounts.get(employee.employeeId) ?? 0,
    });
  }

  return indicators.sort((left, right) => {
    const levelOrder = [
      "critical",
      "high_risk",
      "at_risk",
      "watch",
      "normal",
    ];
    const leftIndex = levelOrder.indexOf(left.riskLevel);
    const rightIndex = levelOrder.indexOf(right.riskLevel);
    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }
    return right.absenceRatePercent - left.absenceRatePercent;
  });
}

/** HRM-AAT-019 … HRM-AAT-020 — classify and expose risk indicators for scope. */
export async function listHrAatAbsenceRiskIndicators(input: {
  organizationId: string;
  query: unknown;
  visibleEmployeeIds: readonly string[] | null;
}): Promise<HrAatAbsenceRiskIndicatorsResult> {
  const query = parseRiskQuery(input.query);
  const thresholds = await getHrAatAbsenceRiskThresholds({
    organizationId: input.organizationId,
  });

  const dataset = await loadEmployeeRiskDataset({
    organizationId: input.organizationId,
    query,
    visibleEmployeeIds: input.visibleEmployeeIds,
  });

  if (
    input.visibleEmployeeIds &&
    input.visibleEmployeeIds.length === 0
  ) {
    throw new HrAatRiskQueryError(
      "aat_empty_risk_scope",
      "No employees visible in resolved scope",
    );
  }

  const correctiveRefCounts = await runWithOrganizationContext(
    input.organizationId,
    async (db) => {
      const employeeIds = dataset.employees.map((row) => row.employeeId);
      if (employeeIds.length === 0) {
        return new Map<string, number>();
      }
      const rows = await db
        .select({
          employeeId: hrAatCorrectiveActionRefs.employeeId,
          count: sql<number>`count(*)::int`,
        })
        .from(hrAatCorrectiveActionRefs)
        .where(
          and(
            eq(hrAatCorrectiveActionRefs.organizationId, input.organizationId),
            inArray(hrAatCorrectiveActionRefs.employeeId, employeeIds),
            lte(hrAatCorrectiveActionRefs.periodStart, endOfUtcDay(query.periodEnd)),
            gte(hrAatCorrectiveActionRefs.periodEnd, startOfUtcDay(query.periodStart)),
          ),
        )
        .groupBy(hrAatCorrectiveActionRefs.employeeId);

      return new Map(rows.map((row) => [row.employeeId, row.count]));
    },
  );

  const indicators = buildEmployeeRiskIndicators({
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    thresholds,
    employees: dataset.employees,
    attendanceDays: dataset.attendanceDays,
    approvedLeaves: dataset.approvedLeaves,
    correctiveRefCounts,
  });

  const result = {
    requirementCodes: ["HRM-AAT-018", "HRM-AAT-019", "HRM-AAT-020"] as const,
    thresholds,
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    indicators,
  };

  const parsed = hrAatAbsenceRiskIndicatorsResultSchema.safeParse(result);
  if (!parsed.success) {
    throw new HrAatRiskQueryError(
      "aat_invalid_risk_query",
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }

  return parsed.data;
}
