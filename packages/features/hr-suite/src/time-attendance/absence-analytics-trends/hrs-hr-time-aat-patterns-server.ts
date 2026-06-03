import {
  HR_AAT_DEPARTMENT_UNIT_TYPES,
  HR_AAT_SCHEDULED_ATTENDANCE_STATUSES,
  HR_AAT_TEAM_UNIT_TYPES,
} from "./hr.time.aat-analytics-core.shared";
import {
  type AatAbsenceEvent,
  type AatCalendarAbsencePattern,
  type AatEmployeeAbsenceMetrics,
  type AatExcessiveAbsenceFlag,
  type AatGroupAbsenceMetrics,
  type AatHighAbsenceGroupFlag,
  type AatPatternDetectionConfig,
  type AatPeriodQuery,
  type AatShortAbsencePattern,
  type AatTrendDirection,
  type AatUnplannedLeaveTrendResult,
  AAT_UNPLANNED_LEAVE_TYPES,
  DEFAULT_AAT_PATTERN_CONFIG,
  aatPatternDetectionConfigSchema,
  aatPeriodQuerySchema,
} from "./hr.time.aat-patterns.schema";

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

function monthPeriodKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function monthPeriodBounds(key: string): { periodStart: Date; periodEnd: Date } {
  const [yearText, monthText] = key.split("-");
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const periodStart = new Date(Date.UTC(year, month, 1));
  const periodEnd = endOfUtcDay(new Date(Date.UTC(year, month + 1, 0)));
  return { periodStart, periodEnd };
}

function daysBetweenUtc(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(
    0,
    Math.floor(
      (startOfUtcDay(end).getTime() - startOfUtcDay(start).getTime()) / msPerDay,
    ),
  );
}

function resolveTrendDirection(input: {
  earlierTotal: number;
  laterTotal: number;
  thresholdPercent: number;
}): AatTrendDirection {
  if (input.earlierTotal === 0 && input.laterTotal === 0) {
    return "stable";
  }
  if (input.earlierTotal === 0) {
    return input.laterTotal > 0 ? "worsening" : "stable";
  }
  const changePercent =
    ((input.laterTotal - input.earlierTotal) / input.earlierTotal) * 100;
  if (changePercent <= -input.thresholdPercent) {
    return "improving";
  }
  if (changePercent >= input.thresholdPercent) {
    return "worsening";
  }
  return "stable";
}

function isUnplannedLeaveEvent(event: AatAbsenceEvent): boolean {
  if (event.source !== "leave") {
    return false;
  }
  if (!event.leaveType) {
    return false;
  }
  return (AAT_UNPLANNED_LEAVE_TYPES as readonly string[]).includes(
    event.leaveType,
  );
}

function isLastMinuteLeave(event: AatAbsenceEvent, noticeDays: number): boolean {
  if (!event.submittedAt) {
    return false;
  }
  return daysBetweenUtc(event.submittedAt, event.absenceDate) <= noticeDays;
}

/** HRM-AAT-006 — identify unplanned leave trends from normalized absence events. */
export function analyzeUnplannedLeaveTrends(input: {
  events: readonly AatAbsenceEvent[];
  periodStart: Date;
  periodEnd: Date;
  config?: Partial<AatPatternDetectionConfig>;
}): AatUnplannedLeaveTrendResult {
  const config = aatPatternDetectionConfigSchema.parse(
    input.config ?? DEFAULT_AAT_PATTERN_CONFIG,
  );

  const unplannedEvents = input.events.filter(
    (event) =>
      isUnplannedLeaveEvent(event) ||
      (event.source === "attendance" && event.leaveStatus !== "approved"),
  );

  const bucketMap = new Map<
    string,
    {
      unplannedLeaveCount: number;
      unplannedLostWorkdays: number;
      lastMinuteCount: number;
    }
  >();

  const flaggedEmployees = new Set<string>();

  for (const event of unplannedEvents) {
    const periodKey = monthPeriodKey(event.absenceDate);
    const bucket = bucketMap.get(periodKey) ?? {
      unplannedLeaveCount: 0,
      unplannedLostWorkdays: 0,
      lastMinuteCount: 0,
    };
    bucket.unplannedLeaveCount += 1;
    bucket.unplannedLostWorkdays += event.durationDays;
    if (isLastMinuteLeave(event, config.lastMinuteNoticeDays)) {
      bucket.lastMinuteCount += 1;
      flaggedEmployees.add(event.employeeId);
    }
    bucketMap.set(periodKey, bucket);
  }

  const sortedKeys = [...bucketMap.keys()].sort();
  const buckets = sortedKeys.map((periodKey) => {
    const bucket = bucketMap.get(periodKey)!;
    const bounds = monthPeriodBounds(periodKey);
    return {
      periodKey,
      periodStart: bounds.periodStart,
      periodEnd: bounds.periodEnd,
      ...bucket,
    };
  });

  const midpoint = Math.ceil(sortedKeys.length / 2);
  const earlierTotal = sortedKeys
    .slice(0, midpoint)
    .reduce((sum, key) => sum + (bucketMap.get(key)?.unplannedLeaveCount ?? 0), 0);
  const laterTotal = sortedKeys
    .slice(midpoint)
    .reduce((sum, key) => sum + (bucketMap.get(key)?.unplannedLeaveCount ?? 0), 0);

  return {
    buckets,
    flaggedEmployeeIds: [...flaggedEmployees],
    totalUnplannedEvents: unplannedEvents.length,
    trendDirection: resolveTrendDirection({
      earlierTotal,
      laterTotal,
      thresholdPercent: config.trendChangeThresholdPercent,
    }),
  };
}

/** HRM-AAT-007 — identify repeated short absence patterns. */
export function detectRepeatedShortAbsencePatterns(input: {
  events: readonly AatAbsenceEvent[];
  config?: Partial<AatPatternDetectionConfig>;
}): AatShortAbsencePattern[] {
  const config = aatPatternDetectionConfigSchema.parse(
    input.config ?? DEFAULT_AAT_PATTERN_CONFIG,
  );

  const byEmployee = new Map<string, AatAbsenceEvent[]>();
  for (const event of input.events) {
    if (event.durationDays > config.maxShortAbsenceDays) {
      continue;
    }
    const list = byEmployee.get(event.employeeId) ?? [];
    list.push(event);
    byEmployee.set(event.employeeId, list);
  }

  const patterns: AatShortAbsencePattern[] = [];
  for (const [employeeId, events] of byEmployee) {
    if (events.length < config.minShortAbsenceOccurrences) {
      continue;
    }
    patterns.push({
      employeeId,
      occurrenceCount: events.length,
      totalLostWorkdays: events.reduce((sum, e) => sum + e.durationDays, 0),
      absenceDates: events.map((e) => startOfUtcDay(e.absenceDate)),
    });
  }

  return patterns.sort((a, b) => b.occurrenceCount - a.occurrenceCount);
}

function normalizeHolidayDates(holidayDates: readonly Date[]): Set<string> {
  return new Set(holidayDates.map((date) => startOfUtcDay(date).toISOString()));
}

function classifyCalendarPattern(
  absenceDate: Date,
  holidaySet: ReadonlySet<string>,
): "monday" | "friday" | "pre_holiday" | "post_holiday" | null {
  const day = startOfUtcDay(absenceDate);
  const dayOfWeek = day.getUTCDay();
  if (dayOfWeek === 1) {
    return "monday";
  }
  if (dayOfWeek === 5) {
    return "friday";
  }

  const nextDay = new Date(day);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  if (holidaySet.has(nextDay.toISOString())) {
    return "pre_holiday";
  }

  const previousDay = new Date(day);
  previousDay.setUTCDate(previousDay.getUTCDate() - 1);
  if (holidaySet.has(previousDay.toISOString())) {
    return "post_holiday";
  }

  return null;
}

/** HRM-AAT-008 — identify Monday/Friday/pre-holiday/post-holiday absence patterns. */
export function detectCalendarAbsencePatterns(input: {
  events: readonly AatAbsenceEvent[];
  holidayDates?: readonly Date[];
  config?: Partial<AatPatternDetectionConfig>;
}): AatCalendarAbsencePattern[] {
  const config = aatPatternDetectionConfigSchema.parse(
    input.config ?? DEFAULT_AAT_PATTERN_CONFIG,
  );
  const holidaySet = normalizeHolidayDates(input.holidayDates ?? []);

  const grouped = new Map<string, Date[]>();
  for (const event of input.events) {
    const kind = classifyCalendarPattern(event.absenceDate, holidaySet);
    if (!kind) {
      continue;
    }
    const key = `${event.employeeId}\0${kind}`;
    const dates = grouped.get(key) ?? [];
    dates.push(startOfUtcDay(event.absenceDate));
    grouped.set(key, dates);
  }

  const patterns: AatCalendarAbsencePattern[] = [];
  for (const [key, absenceDates] of grouped) {
    if (absenceDates.length < config.minCalendarPatternOccurrences) {
      continue;
    }
    const separatorIndex = key.indexOf("\0");
    const employeeId = key.slice(0, separatorIndex);
    const patternKind = key.slice(separatorIndex + 1);
    if (!employeeId || !patternKind) {
      continue;
    }
    patterns.push({
      employeeId,
      patternKind: patternKind as AatCalendarAbsencePattern["patternKind"],
      occurrenceCount: absenceDates.length,
      absenceDates: absenceDates.sort((a, b) => a.getTime() - b.getTime()),
    });
  }

  return patterns.sort((a, b) => b.occurrenceCount - a.occurrenceCount);
}

/** HRM-AAT-009 — flag employees exceeding configured absence thresholds. */
export function detectExcessiveAbsence(input: {
  metrics: readonly AatEmployeeAbsenceMetrics[];
  config?: Partial<AatPatternDetectionConfig>;
}): AatExcessiveAbsenceFlag[] {
  const config = aatPatternDetectionConfigSchema.parse(
    input.config ?? DEFAULT_AAT_PATTERN_CONFIG,
  );

  const flags: AatExcessiveAbsenceFlag[] = [];
  for (const row of input.metrics) {
    const breachedThresholds: AatExcessiveAbsenceFlag["breachedThresholds"] = [];
    if (row.lostWorkdays > config.maxLostWorkdays) {
      breachedThresholds.push("lost_workdays");
    }
    if (row.absenceFrequency > config.maxAbsenceFrequency) {
      breachedThresholds.push("absence_frequency");
    }
    if (row.absenceRatePercent > config.maxAbsenceRatePercent) {
      breachedThresholds.push("absence_rate");
    }
    if (breachedThresholds.length === 0) {
      continue;
    }
    flags.push({
      employeeId: row.employeeId,
      employeeDisplayName: row.employeeDisplayName,
      lostWorkdays: row.lostWorkdays,
      absenceFrequency: row.absenceFrequency,
      absenceRatePercent: row.absenceRatePercent,
      breachedThresholds,
    });
  }

  return flags.sort((a, b) => b.absenceRatePercent - a.absenceRatePercent);
}

/** HRM-AAT-010 — flag departments or teams with high absence rates. */
export function detectHighAbsenceRateGroups(input: {
  groups: readonly AatGroupAbsenceMetrics[];
  config?: Partial<AatPatternDetectionConfig>;
}): AatHighAbsenceGroupFlag[] {
  const config = aatPatternDetectionConfigSchema.parse(
    input.config ?? DEFAULT_AAT_PATTERN_CONFIG,
  );

  return input.groups
    .filter(
      (group) =>
        group.absenceRatePercent >= config.highGroupAbsenceRatePercent &&
        group.headcount > 0,
    )
    .map((group) => ({
      groupKey: group.groupKey,
      groupLabel: group.groupLabel,
      groupScope: group.groupScope,
      headcount: group.headcount,
      absenceRatePercent: group.absenceRatePercent,
      lostWorkdays: group.lostWorkdays,
    }))
    .sort((a, b) => b.absenceRatePercent - a.absenceRatePercent);
}

export function buildEmployeeAbsenceMetrics(input: {
  events: readonly AatAbsenceEvent[];
  scheduledWorkdaysByEmployee: ReadonlyMap<string, number>;
  employeeDisplayNames?: ReadonlyMap<string, string>;
  departmentIds?: ReadonlyMap<string, string | null>;
}): AatEmployeeAbsenceMetrics[] {
  const byEmployee = new Map<
    string,
    { lostWorkdays: number; absenceFrequency: number }
  >();

  for (const event of input.events) {
    const bucket = byEmployee.get(event.employeeId) ?? {
      lostWorkdays: 0,
      absenceFrequency: 0,
    };
    bucket.lostWorkdays += event.durationDays;
    bucket.absenceFrequency += 1;
    byEmployee.set(event.employeeId, bucket);
  }

  const metrics: AatEmployeeAbsenceMetrics[] = [];
  for (const [employeeId, totals] of byEmployee) {
    const scheduledWorkdays = input.scheduledWorkdaysByEmployee.get(employeeId) ?? 0;
    const absenceRatePercent =
      scheduledWorkdays > 0
        ? Number(((totals.lostWorkdays / scheduledWorkdays) * 100).toFixed(2))
        : 0;
    metrics.push({
      employeeId,
      employeeDisplayName: input.employeeDisplayNames?.get(employeeId),
      departmentId: input.departmentIds?.get(employeeId) ?? null,
      lostWorkdays: totals.lostWorkdays,
      absenceFrequency: totals.absenceFrequency,
      scheduledWorkdays,
      absenceRatePercent,
    });
  }

  return metrics;
}

export function buildGroupAbsenceMetrics(input: {
  events: readonly AatAbsenceEvent[];
  employees: readonly {
    employeeId: string;
    departmentId: string | null;
    departmentName: string | null;
    unitType: string | null;
  }[];
  scheduledWorkdaysByEmployee: ReadonlyMap<string, number>;
  groupScope?: "department" | "team";
}): AatGroupAbsenceMetrics[] {
  const scope = input.groupScope ?? "department";
  const employeeById = new Map(
    input.employees.map((employee) => [employee.employeeId, employee]),
  );

  const buckets = new Map<
    string,
    {
      groupLabel: string;
      groupScope: "department" | "team";
      employeeIds: Set<string>;
      lostWorkdays: number;
      scheduledWorkdays: number;
    }
  >();

  for (const employee of input.employees) {
    const isTeamScope = scope === "team";
    const unitType = employee.unitType ?? "";
    if (
      isTeamScope
        ? !HR_AAT_TEAM_UNIT_TYPES.has(unitType)
        : !HR_AAT_DEPARTMENT_UNIT_TYPES.has(unitType)
    ) {
      continue;
    }
    const groupKey = employee.departmentId ?? "unassigned";
    const groupLabel = employee.departmentName ?? "Unassigned";
    const bucket = buckets.get(groupKey) ?? {
      groupLabel,
      groupScope: scope,
      employeeIds: new Set<string>(),
      lostWorkdays: 0,
      scheduledWorkdays: 0,
    };
    bucket.employeeIds.add(employee.employeeId);
    bucket.scheduledWorkdays +=
      input.scheduledWorkdaysByEmployee.get(employee.employeeId) ?? 0;
    buckets.set(groupKey, bucket);
  }

  for (const event of input.events) {
    const employee = employeeById.get(event.employeeId);
    if (!employee) {
      continue;
    }
    const isTeamScope = scope === "team";
    const unitType = employee.unitType ?? "";
    if (
      isTeamScope
        ? !HR_AAT_TEAM_UNIT_TYPES.has(unitType)
        : !HR_AAT_DEPARTMENT_UNIT_TYPES.has(unitType)
    ) {
      continue;
    }
    const groupKey = employee.departmentId ?? "unassigned";
    const bucket = buckets.get(groupKey);
    if (!bucket) {
      continue;
    }
    bucket.lostWorkdays += event.durationDays;
  }

  return [...buckets.entries()].map(([groupKey, bucket]) => ({
    groupKey,
    groupLabel: bucket.groupLabel,
    groupScope: bucket.groupScope,
    headcount: bucket.employeeIds.size,
    lostWorkdays: bucket.lostWorkdays,
    scheduledWorkdays: bucket.scheduledWorkdays,
    absenceRatePercent:
      bucket.scheduledWorkdays > 0
        ? Number(((bucket.lostWorkdays / bucket.scheduledWorkdays) * 100).toFixed(2))
        : 0,
  }));
}

type AatAbsenceLoadFilters = {
  departmentId?: string;
  managerEmployeeId?: string;
  employeeId?: string;
};

async function loadAatAbsenceContext(
  query: AatPeriodQuery,
): Promise<{
  events: AatAbsenceEvent[];
  holidayDates: Date[];
  employees: {
    employeeId: string;
    departmentId: string | null;
    departmentName: string | null;
    unitType: string | null;
    displayName: string;
  }[];
  scheduledWorkdaysByEmployee: Map<string, number>;
}> {
  const { and, eq, gte, inArray, isNull, lte } = await import("drizzle-orm");
  const {
    hrAttendanceDays,
    hrDepartments,
    hrEmployees,
    hrLeaveRequests,
    runWithOrganizationContext,
  } = await import("@afenda/db");

  const parsed = aatPeriodQuerySchema.parse(query);
  const filters: AatAbsenceLoadFilters = {
    departmentId: parsed.departmentId,
    managerEmployeeId: parsed.managerEmployeeId,
    employeeId: parsed.employeeId,
  };

  return runWithOrganizationContext(parsed.organizationId, async (db) => {
    const employeeConditions = [
      eq(hrEmployees.organizationId, parsed.organizationId),
      isNull(hrEmployees.archivedAt),
    ];
    if (filters.departmentId) {
      employeeConditions.push(
        eq(hrEmployees.currentDepartmentId, filters.departmentId),
      );
    }
    if (filters.managerEmployeeId) {
      employeeConditions.push(
        eq(hrEmployees.managerEmployeeId, filters.managerEmployeeId),
      );
    }
    if (filters.employeeId) {
      employeeConditions.push(eq(hrEmployees.id, filters.employeeId));
    }

    const employeeRows = await db
      .select({
        employeeId: hrEmployees.id,
        legalName: hrEmployees.legalName,
        preferredName: hrEmployees.preferredName,
        departmentId: hrEmployees.currentDepartmentId,
        departmentName: hrDepartments.name,
        unitType: hrDepartments.unitType,
      })
      .from(hrEmployees)
      .leftJoin(
        hrDepartments,
        eq(hrEmployees.currentDepartmentId, hrDepartments.id),
      )
      .where(and(...employeeConditions));

    const employeeIds = employeeRows.map((row) => row.employeeId);
    if (employeeIds.length === 0) {
      return {
        events: [],
        holidayDates: [],
        employees: [],
        scheduledWorkdaysByEmployee: new Map(),
      };
    }

    const attendanceRows = await db
      .select({
        employeeId: hrAttendanceDays.employeeId,
        workDate: hrAttendanceDays.workDate,
        status: hrAttendanceDays.status,
      })
      .from(hrAttendanceDays)
      .where(
        and(
          eq(hrAttendanceDays.organizationId, parsed.organizationId),
          inArray(hrAttendanceDays.employeeId, employeeIds),
          gte(hrAttendanceDays.workDate, startOfUtcDay(parsed.periodStart)),
          lte(hrAttendanceDays.workDate, endOfUtcDay(parsed.periodEnd)),
        ),
      );

    const leaveRows = await db
      .select({
        id: hrLeaveRequests.id,
        employeeId: hrLeaveRequests.employeeId,
        leaveType: hrLeaveRequests.leaveType,
        status: hrLeaveRequests.status,
        startAt: hrLeaveRequests.startAt,
        endAt: hrLeaveRequests.endAt,
        durationDays: hrLeaveRequests.durationDays,
        submittedAt: hrLeaveRequests.submittedAt,
      })
      .from(hrLeaveRequests)
      .where(
        and(
          eq(hrLeaveRequests.organizationId, parsed.organizationId),
          inArray(hrLeaveRequests.employeeId, employeeIds),
          lte(hrLeaveRequests.startAt, endOfUtcDay(parsed.periodEnd)),
          gte(hrLeaveRequests.endAt, startOfUtcDay(parsed.periodStart)),
          inArray(hrLeaveRequests.status, ["approved", "pending"]),
        ),
      );

    const scheduledWorkdaysByEmployee = new Map<string, number>();
    const holidayDates: Date[] = [];
    const events: AatAbsenceEvent[] = [];

    for (const row of attendanceRows) {
      if (HR_AAT_SCHEDULED_ATTENDANCE_STATUSES.has(row.status)) {
        const count = scheduledWorkdaysByEmployee.get(row.employeeId) ?? 0;
        scheduledWorkdaysByEmployee.set(row.employeeId, count + 1);
      }
      if (row.status === "public_holiday") {
        holidayDates.push(row.workDate);
      }
      if (
        row.status === "absent" ||
        row.status === "missing_punch" ||
        row.status === "half_day"
      ) {
        events.push({
          employeeId: row.employeeId,
          absenceDate: row.workDate,
          durationDays: row.status === "half_day" ? 0.5 : 1,
          source: "attendance",
          leaveStatus: undefined,
        });
      }
    }

    for (const row of leaveRows) {
      events.push({
        employeeId: row.employeeId,
        absenceDate: row.startAt,
        durationDays: Number(row.durationDays),
        source: "leave",
        leaveType: row.leaveType,
        leaveRequestId: row.id,
        submittedAt: row.submittedAt,
        leaveStatus: row.status,
      });
    }

    return {
      events,
      holidayDates,
      employees: employeeRows.map((row) => ({
        employeeId: row.employeeId,
        departmentId: row.departmentId,
        departmentName: row.departmentName,
        unitType: row.unitType,
        displayName: row.preferredName?.trim() || row.legalName,
      })),
      scheduledWorkdaysByEmployee,
    };
  });
}

export async function getAatUnplannedLeaveTrends(input: {
  query: AatPeriodQuery;
  config?: Partial<AatPatternDetectionConfig>;
}): Promise<AatUnplannedLeaveTrendResult> {
  const parsed = aatPeriodQuerySchema.parse(input.query);
  const context = await loadAatAbsenceContext(parsed);
  return analyzeUnplannedLeaveTrends({
    events: context.events,
    periodStart: parsed.periodStart,
    periodEnd: parsed.periodEnd,
    config: input.config,
  });
}

export async function getAatRepeatedShortAbsencePatterns(input: {
  query: AatPeriodQuery;
  config?: Partial<AatPatternDetectionConfig>;
}): Promise<AatShortAbsencePattern[]> {
  const parsed = aatPeriodQuerySchema.parse(input.query);
  const context = await loadAatAbsenceContext(parsed);
  return detectRepeatedShortAbsencePatterns({
    events: context.events,
    config: input.config,
  });
}

export async function getAatCalendarAbsencePatterns(input: {
  query: AatPeriodQuery;
  holidayDates?: Date[];
  config?: Partial<AatPatternDetectionConfig>;
}): Promise<AatCalendarAbsencePattern[]> {
  const parsed = aatPeriodQuerySchema.parse(input.query);
  const context = await loadAatAbsenceContext(parsed);
  return detectCalendarAbsencePatterns({
    events: context.events,
    holidayDates: input.holidayDates ?? context.holidayDates,
    config: input.config,
  });
}

export async function getAatExcessiveAbsenceFlags(input: {
  query: AatPeriodQuery;
  config?: Partial<AatPatternDetectionConfig>;
}): Promise<AatExcessiveAbsenceFlag[]> {
  const parsed = aatPeriodQuerySchema.parse(input.query);
  const context = await loadAatAbsenceContext(parsed);
  const displayNames = new Map(
    context.employees.map((employee) => [
      employee.employeeId,
      employee.displayName,
    ]),
  );
  const departmentIds = new Map(
    context.employees.map((employee) => [
      employee.employeeId,
      employee.departmentId,
    ]),
  );
  const metrics = buildEmployeeAbsenceMetrics({
    events: context.events,
    scheduledWorkdaysByEmployee: context.scheduledWorkdaysByEmployee,
    employeeDisplayNames: displayNames,
    departmentIds,
  });
  return detectExcessiveAbsence({ metrics, config: input.config });
}

export async function getAatHighAbsenceRateGroups(input: {
  query: AatPeriodQuery;
  groupScope?: "department" | "team";
  config?: Partial<AatPatternDetectionConfig>;
}): Promise<AatHighAbsenceGroupFlag[]> {
  const parsed = aatPeriodQuerySchema.parse(input.query);
  const context = await loadAatAbsenceContext(parsed);
  const groups = buildGroupAbsenceMetrics({
    events: context.events,
    employees: context.employees,
    scheduledWorkdaysByEmployee: context.scheduledWorkdaysByEmployee,
    groupScope: input.groupScope,
  });
  return detectHighAbsenceRateGroups({ groups, config: input.config });
}
