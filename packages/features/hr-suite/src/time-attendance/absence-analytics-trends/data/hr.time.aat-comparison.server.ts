import {
  listHrAttendanceDaysWindow,
  listHrLeaveRequestsWindow,
  summarizeHrAttendanceForPeriod,
  type HrAttendanceSummaryRow,
} from "@afenda/db";

import {
  buildPlannedVsUnplannedComparison,
  computeAbsenceRatePct,
  hrAatPlannedVsUnplannedQuerySchema,
  hrAatTrendComparisonQuerySchema,
  isPlannedLeave,
  rankDimensionTrendRows,
  type HrAatComparisonDimension,
  type HrAatLeaveType,
  type HrAatPlannedVsUnplannedComparison,
  type HrAatTrendComparisonResult,
} from "../schemas/hr.time.aat-comparison.schema";

const MAX_ROWS = 100;

/** HRM-AAT-012 — planned leave vs unplanned absence comparison. */
export async function loadHrAatPlannedVsUnplannedComparison(
  input: unknown,
): Promise<HrAatPlannedVsUnplannedComparison> {
  const query = hrAatPlannedVsUnplannedQuerySchema.parse(input);
  const facts = await loadHrAatAbsenceFacts({
    organizationId: query.organizationId,
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    departmentId: query.departmentId,
    managerEmployeeId: query.managerEmployeeId,
    workLocationCode: query.workLocationCode,
    policyGroupCode: query.policyGroupCode,
  });

  let plannedLostWorkdays = 0;
  let plannedAbsenceCount = 0;
  let unplannedLostWorkdays = 0;
  let unplannedAbsenceCount = 0;

  for (const fact of facts) {
    if (fact.isPlanned) {
      plannedLostWorkdays += fact.lostWorkdays;
      plannedAbsenceCount += 1;
    } else {
      unplannedLostWorkdays += fact.lostWorkdays;
      unplannedAbsenceCount += 1;
    }
  }

  return buildPlannedVsUnplannedComparison({
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    plannedLostWorkdays,
    plannedAbsenceCount,
    unplannedLostWorkdays,
    unplannedAbsenceCount,
  });
}

/** HRM-AAT-013 — compare absence trends across org dimensions. */
export async function loadHrAatTrendComparison(
  input: unknown,
): Promise<HrAatTrendComparisonResult> {
  const query = hrAatTrendComparisonQuerySchema.parse(input);
  const workingDays = countWorkingDays(query.periodStart, query.periodEnd);

  const rows =
    query.dimension === "employee_group"
      ? await loadEmployeeGroupTrendRows({
          organizationId: query.organizationId,
          periodStart: query.periodStart,
          periodEnd: query.periodEnd,
          workingDays,
          limit: query.limit ?? 25,
        })
      : await loadSummaryTrendRows({
          organizationId: query.organizationId,
          periodStart: query.periodStart,
          periodEnd: query.periodEnd,
          dimension: query.dimension,
          workingDays,
          limit: query.limit ?? 25,
        });

  return {
    requirementCode: "HRM-AAT-013",
    dimension: query.dimension,
    periodStart: query.periodStart.toISOString().slice(0, 10),
    periodEnd: query.periodEnd.toISOString().slice(0, 10),
    rows,
  };
}

export type HrAatAbsenceFact = {
  employeeId: string;
  lostWorkdays: number;
  isPlanned: boolean;
  leaveType: HrAatLeaveType | null;
  workDate: Date | null;
  departmentId: string | null;
  managerEmployeeId: string | null;
  workLocationCode: string | null;
  policyGroupCode: string;
  workerCategory: string | null;
};

export async function loadHrAatAbsenceFacts(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  departmentId?: string;
  managerEmployeeId?: string;
  workLocationCode?: string;
  policyGroupCode?: string;
}): Promise<HrAatAbsenceFact[]> {
  const [leaveWindow, absentWindow, employeeSummary] = await Promise.all([
    listHrLeaveRequestsWindow({
      organizationId: input.organizationId,
      status: "approved",
      limit: MAX_ROWS,
    }),
    listHrAttendanceDaysWindow({
      organizationId: input.organizationId,
      status: "absent",
      workDateFrom: input.periodStart,
      workDateTo: input.periodEnd,
      limit: MAX_ROWS,
    }),
    summarizeHrAttendanceForPeriod({
      organizationId: input.organizationId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      groupBy: "employee",
      departmentId: input.departmentId,
      managerEmployeeId: input.managerEmployeeId,
      workLocationCode: input.workLocationCode,
    }),
  ]);

  const employeeKeys = new Set(employeeSummary.map((row) => row.groupKey));
  const facts: HrAatAbsenceFact[] = [];

  for (const row of leaveWindow.rows) {
    if (!overlapsPeriod(row.startAt, row.endAt, input.periodStart, input.periodEnd)) {
      continue;
    }
    if (!employeeKeys.has(row.employeeId)) {
      continue;
    }

    facts.push({
      employeeId: row.employeeId,
      lostWorkdays: Number(row.durationDays),
      isPlanned: isPlannedLeave({
        leaveType: row.leaveType as HrAatLeaveType,
        submittedAt: row.submittedAt,
        startAt: row.startAt,
      }),
      leaveType: row.leaveType as HrAatLeaveType,
      workDate: row.startAt,
      departmentId: null,
      managerEmployeeId: null,
      workLocationCode: null,
      policyGroupCode: input.policyGroupCode ?? "default",
      workerCategory: null,
    });
  }

  for (const row of absentWindow.rows) {
    if (!employeeKeys.has(row.employeeId)) {
      continue;
    }

    facts.push({
      employeeId: row.employeeId,
      lostWorkdays: 1,
      isPlanned: false,
      leaveType: null,
      workDate: row.workDate,
      departmentId: null,
      managerEmployeeId: null,
      workLocationCode: null,
      policyGroupCode: "default",
      workerCategory: null,
    });
  }

  return facts;
}

export async function loadHrAatActiveHeadcount(input: {
  organizationId: string;
  departmentId?: string;
  managerEmployeeId?: string;
  workLocationCode?: string;
}): Promise<number> {
  const summary = await summarizeHrAttendanceForPeriod({
    organizationId: input.organizationId,
    periodStart: new Date(),
    periodEnd: new Date(),
    groupBy: "employee",
    departmentId: input.departmentId,
    managerEmployeeId: input.managerEmployeeId,
    workLocationCode: input.workLocationCode,
  });

  return summary.length;
}

export async function loadHrAatUnavailableCounts(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  departmentId?: string;
  managerEmployeeId?: string;
  workLocationCode?: string;
}): Promise<{ onLeaveCount: number; absentCount: number }> {
  const facts = await loadHrAatAbsenceFacts(input);
  const onLeaveEmployeeIds = new Set<string>();
  const absentEmployeeIds = new Set<string>();

  for (const fact of facts) {
    if (fact.leaveType) {
      onLeaveEmployeeIds.add(fact.employeeId);
    } else {
      absentEmployeeIds.add(fact.employeeId);
    }
  }

  return {
    onLeaveCount: onLeaveEmployeeIds.size,
    absentCount: absentEmployeeIds.size,
  };
}

export async function loadHrAatDimensionAbsenceRates(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  dimension: HrAatComparisonDimension;
}): Promise<Map<string, { label: string; ratePct: number }>> {
  const workingDays = countWorkingDays(input.periodStart, input.periodEnd);

  if (input.dimension === "employee_group") {
    const rows = await loadEmployeeGroupTrendRows({
      organizationId: input.organizationId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      workingDays,
    });
    return new Map(
      rows.map((row) => [
        row.dimensionKey,
        { label: row.dimensionLabel, ratePct: row.absenceRatePct },
      ]),
    );
  }

  const rows = await loadSummaryTrendRows({
    organizationId: input.organizationId,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    dimension: input.dimension,
    workingDays,
  });

  return new Map(
    rows.map((row) => [
      row.dimensionKey,
      { label: row.dimensionLabel, ratePct: row.absenceRatePct },
    ]),
  );
}

export type HrAatHeatmapSourceFact = {
  dateKey: string;
  teamKey: string;
  teamLabel: string;
  departmentKey: string;
  departmentLabel: string;
  locationKey: string;
  locationLabel: string;
  leaveTypeKey: string;
  leaveTypeLabel: string;
  lostWorkdays: number;
};

export async function loadHrAatHeatmapSourceFacts(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  departmentId?: string;
  managerEmployeeId?: string;
  workLocationCode?: string;
}): Promise<readonly HrAatHeatmapSourceFact[]> {
  const [
    facts,
    departmentSummary,
    managerSummary,
    locationSummary,
  ] = await Promise.all([
    loadHrAatAbsenceFacts(input),
    summarizeHrAttendanceForPeriod({
      organizationId: input.organizationId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      groupBy: "department",
      departmentId: input.departmentId,
      managerEmployeeId: input.managerEmployeeId,
      workLocationCode: input.workLocationCode,
    }),
    summarizeHrAttendanceForPeriod({
      organizationId: input.organizationId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      groupBy: "manager",
      departmentId: input.departmentId,
      managerEmployeeId: input.managerEmployeeId,
      workLocationCode: input.workLocationCode,
    }),
    summarizeHrAttendanceForPeriod({
      organizationId: input.organizationId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      groupBy: "work_location",
      departmentId: input.departmentId,
      managerEmployeeId: input.managerEmployeeId,
      workLocationCode: input.workLocationCode,
    }),
  ]);

  const departmentLabels = labelMap(departmentSummary);
  const managerLabels = labelMap(managerSummary);
  const locationLabels = labelMap(locationSummary);

  return facts.map((fact) => {
    const workDate = fact.workDate ?? input.periodStart;
    const dateKey = workDate.toISOString().slice(0, 10);
    const departmentKey = fact.departmentId ?? "unassigned";
    const teamKey = fact.managerEmployeeId ?? "no_manager";
    const locationKey = fact.workLocationCode ?? "default";

    return {
      dateKey,
      teamKey,
      teamLabel: managerLabels.get(teamKey) ?? "No manager",
      departmentKey,
      departmentLabel: departmentLabels.get(departmentKey) ?? "Unassigned department",
      locationKey,
      locationLabel: locationLabels.get(locationKey) ?? "Default location",
      leaveTypeKey: fact.leaveType ?? "unplanned_absence",
      leaveTypeLabel: fact.leaveType ?? "Unplanned absence",
      lostWorkdays: fact.lostWorkdays,
    };
  });
}

async function loadSummaryTrendRows(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  dimension: Exclude<HrAatComparisonDimension, "employee_group">;
  workingDays: number;
  limit?: number;
}) {
  const summary = await summarizeHrAttendanceForPeriod({
    organizationId: input.organizationId,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    groupBy: mapComparisonDimensionToSummaryGroup(input.dimension),
  });

  return rankDimensionTrendRows(
    summary.map((row) => summaryRowToTrend(row, input.workingDays)),
  ).slice(0, input.limit ?? 25);
}

async function loadEmployeeGroupTrendRows(input: {
  organizationId: string;
  periodStart: Date;
  periodEnd: Date;
  workingDays: number;
  limit?: number;
}) {
  const leaveWindow = await listHrLeaveRequestsWindow({
    organizationId: input.organizationId,
    status: "approved",
    limit: MAX_ROWS,
  });

  const buckets = new Map<
    string,
    {
      label: string;
      leaveDays: number;
      absentDays: number;
      absenceCount: number;
      employeeIds: Set<string>;
    }
  >();

  for (const row of leaveWindow.rows) {
    if (!overlapsPeriod(row.startAt, row.endAt, input.periodStart, input.periodEnd)) {
      continue;
    }

    const key = "default";
    const bucket = buckets.get(key) ?? {
      label: key,
      leaveDays: 0,
      absentDays: 0,
      absenceCount: 0,
      employeeIds: new Set<string>(),
    };
    bucket.leaveDays += Number(row.durationDays);
    bucket.absenceCount += 1;
    bucket.employeeIds.add(row.employeeId);
    buckets.set(key, bucket);
  }

  const absentWindow = await listHrAttendanceDaysWindow({
    organizationId: input.organizationId,
    status: "absent",
    workDateFrom: input.periodStart,
    workDateTo: input.periodEnd,
    limit: MAX_ROWS,
  });

  for (const row of absentWindow.rows) {
    const key = "default";
    const bucket = buckets.get(key) ?? {
      label: key,
      leaveDays: 0,
      absentDays: 0,
      absenceCount: 0,
      employeeIds: new Set<string>(),
    };
    bucket.absentDays += 1;
    bucket.absenceCount += 1;
    bucket.employeeIds.add(row.employeeId);
    buckets.set(key, bucket);
  }

  return rankDimensionTrendRows(
    [...buckets.entries()].map(([dimensionKey, bucket]) => ({
      dimensionKey,
      dimensionLabel: bucket.label,
      absenceRatePct: computeAbsenceRatePct({
        absentDays: bucket.absentDays,
        lostLeaveDays: bucket.leaveDays,
        headcount: Math.max(bucket.employeeIds.size, 1),
        workingDaysInPeriod: input.workingDays,
      }),
      lostWorkdays: roundDays(bucket.leaveDays + bucket.absentDays),
      absenceCount: bucket.absenceCount,
      headcount: bucket.employeeIds.size,
    })),
  ).slice(0, input.limit ?? 25);
}

function summaryRowToTrend(
  row: HrAttendanceSummaryRow,
  workingDays: number,
): {
  dimensionKey: string;
  dimensionLabel: string;
  absenceRatePct: number;
  lostWorkdays: number;
  absenceCount: number;
  headcount: number;
} {
  const lostWorkdays = row.leaveDays + row.absentDays;
  const headcount = Math.max(row.daysWorked + row.absentDays, 1);

  return {
    dimensionKey: row.groupKey,
    dimensionLabel: row.groupLabel,
    absenceRatePct: computeAbsenceRatePct({
      absentDays: row.absentDays,
      lostLeaveDays: row.leaveDays,
      headcount,
      workingDaysInPeriod: workingDays,
    }),
    lostWorkdays: roundDays(lostWorkdays),
    absenceCount: row.absentDays + (row.leaveDays > 0 ? 1 : 0),
    headcount,
  };
}

function mapComparisonDimensionToSummaryGroup(
  dimension: Exclude<HrAatComparisonDimension, "employee_group">,
): "department" | "manager" | "work_location" {
  switch (dimension) {
    case "department":
      return "department";
    case "location":
      return "work_location";
    case "manager":
      return "manager";
  }
}

function labelMap(rows: readonly HrAttendanceSummaryRow[]): Map<string, string> {
  return new Map(rows.map((row) => [row.groupKey, row.groupLabel]));
}

function overlapsPeriod(
  startAt: Date,
  endAt: Date,
  periodStart: Date,
  periodEnd: Date,
): boolean {
  return startAt <= periodEnd && endAt >= periodStart;
}

export function countWorkingDays(periodStart: Date, periodEnd: Date): number {
  let count = 0;
  const cursor = startOfUtcDay(periodStart);
  const end = startOfUtcDay(periodEnd);

  while (cursor <= end) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) {
      count += 1;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return Math.max(count, 1);
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function roundDays(value: number): number {
  return Math.round(value * 100) / 100;
}
