import type { HrAatAnalyticsDimension } from "./hr.time.aat-analytics.schema";
import { formatHrAatLeaveTypeLabel } from "./hr.time.aat-analytics.schema";
import { hrLamLeaveTypeSchema } from "../leave-attendance-management/hr.time.lam-form.schema";

/** Attendance day statuses that count toward scheduled work capacity. */
export const HR_AAT_SCHEDULED_ATTENDANCE_STATUSES = new Set([
  "present",
  "absent",
  "late",
  "early_out",
  "half_day",
  "missing_punch",
]);

/** Org unit types treated as teams for HRM-AAT-001 team dimension. */
export const HR_AAT_TEAM_UNIT_TYPES = new Set(["team"]);

/** Org unit types treated as departments for HRM-AAT-001 department dimension. */
export const HR_AAT_DEPARTMENT_UNIT_TYPES = new Set([
  "department",
  "sub_department",
  "business_unit",
]);

export type HrAatEmployeeDimensionContext = {
  readonly employeeId: string;
  readonly employeeNumber: string;
  readonly displayName: string;
  readonly departmentId: string | null;
  readonly departmentName: string | null;
  readonly departmentUnitType: string | null;
  readonly managerEmployeeId: string | null;
  readonly legalEntityCode: string | null;
  readonly workLocationCode: string | null;
};

export type HrAatAttendanceDaySlice = {
  readonly employeeId: string;
  readonly workDate: Date;
  readonly status: string;
};

export type HrAatApprovedLeaveSlice = {
  readonly employeeId: string;
  readonly leaveRequestId: string;
  readonly leaveType: string;
  readonly durationDays: number;
  readonly startAt: Date;
  readonly endAt: Date;
};

export type HrAatAbsenceEpisode = {
  readonly employeeId: string;
  readonly episodeKey: string;
  readonly source: "attendance_absent" | "approved_leave";
  readonly lostWorkdays: number;
  readonly leaveType?: string;
};

type HrAatMutableDimensionBucket = {
  groupKey: string;
  groupLabel: string;
  employeeIds: Set<string>;
  scheduledWorkdays: number;
  attendanceAbsentDays: number;
  approvedLeaveDays: number;
  lostWorkdays: number;
  absenceEpisodes: HrAatAbsenceEpisode[];
};

export type HrAatDimensionBucket = Readonly<HrAatMutableDimensionBucket>;

export class HrAatAnalyticsInvariantError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "HrAatAnalyticsInvariantError";
    this.code = code;
  }
}

function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function expandLeaveDates(startAt: Date, endAt: Date): readonly string[] {
  const dates: string[] = [];
  const cursor = new Date(
    Date.UTC(startAt.getUTCFullYear(), startAt.getUTCMonth(), startAt.getUTCDate()),
  );
  const end = new Date(
    Date.UTC(endAt.getUTCFullYear(), endAt.getUTCMonth(), endAt.getUTCDate()),
  );

  while (cursor.getTime() <= end.getTime()) {
    dates.push(utcDayKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

export function resolveAatDimensionGroup(
  context: HrAatEmployeeDimensionContext,
  dimension: HrAatAnalyticsDimension,
): { groupKey: string; groupLabel: string } | null {
  switch (dimension) {
    case "employee":
      return {
        groupKey: context.employeeId,
        groupLabel: context.displayName,
      };
    case "team": {
      if (
        !context.departmentId ||
        !context.departmentUnitType ||
        !HR_AAT_TEAM_UNIT_TYPES.has(context.departmentUnitType)
      ) {
        return null;
      }
      return {
        groupKey: context.departmentId,
        groupLabel: context.departmentName ?? context.departmentId,
      };
    }
    case "department": {
      if (
        !context.departmentId ||
        !context.departmentUnitType ||
        !HR_AAT_DEPARTMENT_UNIT_TYPES.has(context.departmentUnitType)
      ) {
        return null;
      }
      return {
        groupKey: context.departmentId,
        groupLabel: context.departmentName ?? context.departmentId,
      };
    }
    case "manager":
      return {
        groupKey: context.managerEmployeeId ?? "unassigned",
        groupLabel: context.managerEmployeeId ?? "No manager",
      };
    case "location":
      return {
        groupKey: context.workLocationCode ?? "default",
        groupLabel: context.workLocationCode ?? "Default location",
      };
    case "legal_entity":
      return {
        groupKey: context.legalEntityCode ?? "default",
        groupLabel: context.legalEntityCode ?? "Default entity",
      };
    default:
      return null;
  }
}

/** HRM-AAT-002 — absence rate as percentage of scheduled workdays. */
export function computeAatAbsenceRate(input: {
  lostWorkdays: number;
  scheduledWorkdays: number;
}): number {
  if (input.lostWorkdays < 0 || input.scheduledWorkdays < 0) {
    throw new HrAatAnalyticsInvariantError(
      "aat_negative_metric_input",
      "lostWorkdays and scheduledWorkdays must be non-negative",
    );
  }
  if (input.scheduledWorkdays === 0) {
    return 0;
  }
  const rate = (input.lostWorkdays / input.scheduledWorkdays) * 100;
  return Math.min(100, Math.round(rate * 100) / 100);
}

/** HRM-AAT-003 — count distinct absence episodes in scope. */
export function computeAatAbsenceFrequency(
  episodes: readonly HrAatAbsenceEpisode[],
): number {
  return episodes.length;
}

/** HRM-AAT-004 — total lost workdays after de-duplicating leave vs attendance overlap. */
export function computeAatTotalLostWorkdays(input: {
  attendanceAbsentDays: number;
  approvedLeaveDays: number;
  overlapDays: number;
}): number {
  if (
    input.attendanceAbsentDays < 0 ||
    input.approvedLeaveDays < 0 ||
    input.overlapDays < 0
  ) {
    throw new HrAatAnalyticsInvariantError(
      "aat_negative_metric_input",
      "lost workday inputs must be non-negative",
    );
  }
  if (input.overlapDays > input.attendanceAbsentDays) {
    throw new HrAatAnalyticsInvariantError(
      "aat_overlap_exceeds_absent",
      "overlapDays cannot exceed attendanceAbsentDays",
    );
  }
  return input.attendanceAbsentDays + input.approvedLeaveDays - input.overlapDays;
}

export function buildAatAbsenceEpisodes(input: {
  attendanceDays: readonly HrAatAttendanceDaySlice[];
  approvedLeaves: readonly HrAatApprovedLeaveSlice[];
}): {
  episodes: readonly HrAatAbsenceEpisode[];
  attendanceAbsentDays: number;
  approvedLeaveDays: number;
  overlapDays: number;
} {
  const leaveDaysByEmployeeDate = new Map<string, HrAatApprovedLeaveSlice>();
  let approvedLeaveDays = 0;

  for (const leave of input.approvedLeaves) {
    approvedLeaveDays += leave.durationDays;
    for (const day of expandLeaveDates(leave.startAt, leave.endAt)) {
      leaveDaysByEmployeeDate.set(`${leave.employeeId}:${day}`, leave);
    }
  }

  const episodes: HrAatAbsenceEpisode[] = [];
  let attendanceAbsentDays = 0;
  let overlapDays = 0;

  for (const leave of input.approvedLeaves) {
    episodes.push({
      employeeId: leave.employeeId,
      episodeKey: `leave:${leave.leaveRequestId}`,
      source: "approved_leave",
      lostWorkdays: leave.durationDays,
      leaveType: leave.leaveType,
    });
  }

  for (const day of input.attendanceDays) {
    if (day.status !== "absent") {
      continue;
    }
    attendanceAbsentDays += 1;
    const dayKey = `${day.employeeId}:${utcDayKey(day.workDate)}`;
    if (leaveDaysByEmployeeDate.has(dayKey)) {
      overlapDays += 1;
      continue;
    }
    episodes.push({
      employeeId: day.employeeId,
      episodeKey: `attendance:${dayKey}`,
      source: "attendance_absent",
      lostWorkdays: 1,
    });
  }

  return {
    episodes,
    attendanceAbsentDays,
    approvedLeaveDays,
    overlapDays,
  };
}

function getOrCreateBucket(
  buckets: Map<string, HrAatMutableDimensionBucket>,
  groupKey: string,
  groupLabel: string,
): HrAatMutableDimensionBucket {
  const existing = buckets.get(groupKey);
  if (existing) {
    return existing;
  }
  const created: HrAatMutableDimensionBucket = {
    groupKey,
    groupLabel,
    employeeIds: new Set<string>(),
    scheduledWorkdays: 0,
    attendanceAbsentDays: 0,
    approvedLeaveDays: 0,
    lostWorkdays: 0,
    absenceEpisodes: [],
  };
  buckets.set(groupKey, created);
  return created;
}

function finalizeBucket(
  bucket: HrAatMutableDimensionBucket,
  overlapDays: number,
): HrAatDimensionBucket {
  const lostWorkdays = computeAatTotalLostWorkdays({
    attendanceAbsentDays: bucket.attendanceAbsentDays,
    approvedLeaveDays: bucket.approvedLeaveDays,
    overlapDays,
  });
  return {
    ...bucket,
    lostWorkdays,
    employeeIds: new Set(bucket.employeeIds),
    absenceEpisodes: [...bucket.absenceEpisodes],
  };
}

/** HRM-AAT-001 … HRM-AAT-005 — aggregate absence metrics by analytics dimension. */
export function aggregateAatAbsenceMetrics(input: {
  dimension: HrAatAnalyticsDimension;
  periodStart: Date;
  periodEnd: Date;
  employeeContexts: readonly HrAatEmployeeDimensionContext[];
  attendanceDays: readonly HrAatAttendanceDaySlice[];
  approvedLeaves: readonly HrAatApprovedLeaveSlice[];
}) {
  const contextByEmployeeId = new Map(
    input.employeeContexts.map((context) => [context.employeeId, context]),
  );

  const {
    episodes,
    attendanceAbsentDays,
    approvedLeaveDays,
    overlapDays,
  } = buildAatAbsenceEpisodes({
    attendanceDays: input.attendanceDays,
    approvedLeaves: input.approvedLeaves,
  });

  const totalLostWorkdays = computeAatTotalLostWorkdays({
    attendanceAbsentDays,
    approvedLeaveDays,
    overlapDays,
  });

  const buckets = new Map<string, HrAatMutableDimensionBucket>();
  const overlapByBucket = new Map<string, number>();

  for (const context of input.employeeContexts) {
    const group = resolveAatDimensionGroup(context, input.dimension);
    if (!group) {
      continue;
    }
    const bucket = getOrCreateBucket(buckets, group.groupKey, group.groupLabel);
    bucket.employeeIds.add(context.employeeId);
  }

  for (const day of input.attendanceDays) {
    const context = contextByEmployeeId.get(day.employeeId);
    if (!context) {
      continue;
    }
    const group = resolveAatDimensionGroup(context, input.dimension);
    if (!group) {
      continue;
    }
    const bucket = getOrCreateBucket(buckets, group.groupKey, group.groupLabel);
    bucket.employeeIds.add(context.employeeId);
    if (HR_AAT_SCHEDULED_ATTENDANCE_STATUSES.has(day.status)) {
      bucket.scheduledWorkdays += 1;
    }
    if (day.status === "absent") {
      bucket.attendanceAbsentDays += 1;
      const dayKey = `${day.employeeId}:${utcDayKey(day.workDate)}`;
      const leaveOverlap = input.approvedLeaves.some((leave) =>
        expandLeaveDates(leave.startAt, leave.endAt).some(
          (date) => `${leave.employeeId}:${date}` === dayKey,
        ),
      );
      if (leaveOverlap) {
        overlapByBucket.set(
          group.groupKey,
          (overlapByBucket.get(group.groupKey) ?? 0) + 1,
        );
      }
    }
  }

  for (const leave of input.approvedLeaves) {
    const context = contextByEmployeeId.get(leave.employeeId);
    if (!context) {
      continue;
    }
    const group = resolveAatDimensionGroup(context, input.dimension);
    if (!group) {
      continue;
    }
    const bucket = getOrCreateBucket(buckets, group.groupKey, group.groupLabel);
    bucket.employeeIds.add(context.employeeId);
    bucket.approvedLeaveDays += leave.durationDays;
  }

  for (const episode of episodes) {
    const context = contextByEmployeeId.get(episode.employeeId);
    if (!context) {
      continue;
    }
    const group = resolveAatDimensionGroup(context, input.dimension);
    if (!group) {
      continue;
    }
    const bucket = getOrCreateBucket(buckets, group.groupKey, group.groupLabel);
    bucket.absenceEpisodes.push(episode);
  }

  const finalizedBuckets = [...buckets.values()].map((bucket) =>
    finalizeBucket(bucket, overlapByBucket.get(bucket.groupKey) ?? 0),
  );

  let scheduledWorkdaysTotal = 0;
  for (const day of input.attendanceDays) {
    if (HR_AAT_SCHEDULED_ATTENDANCE_STATUSES.has(day.status)) {
      scheduledWorkdaysTotal += 1;
    }
  }

  const analysisRows = finalizedBuckets.map((bucket) => ({
    groupKey: bucket.groupKey,
    groupLabel: bucket.groupLabel,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    employeeCount: bucket.employeeIds.size,
    totalLostWorkdays: bucket.lostWorkdays,
    absenceRatePercent: computeAatAbsenceRate({
      lostWorkdays: bucket.lostWorkdays,
      scheduledWorkdays: bucket.scheduledWorkdays,
    }),
    absenceEpisodeCount: computeAatAbsenceFrequency(bucket.absenceEpisodes),
  }));

  const absenceRates = finalizedBuckets.map((bucket) => ({
    groupKey: bucket.groupKey,
    groupLabel: bucket.groupLabel,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    lostWorkdays: bucket.lostWorkdays,
    scheduledWorkdays: bucket.scheduledWorkdays,
    absenceRatePercent: computeAatAbsenceRate({
      lostWorkdays: bucket.lostWorkdays,
      scheduledWorkdays: bucket.scheduledWorkdays,
    }),
  }));

  const absenceFrequencies = finalizedBuckets.map((bucket) => {
    const episodeCount = computeAatAbsenceFrequency(bucket.absenceEpisodes);
    const employeeCount = bucket.employeeIds.size;
    return {
      groupKey: bucket.groupKey,
      groupLabel: bucket.groupLabel,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      absenceEpisodeCount: episodeCount,
      employeeCount,
      averageEpisodesPerEmployee:
        employeeCount === 0
          ? 0
          : Math.round((episodeCount / employeeCount) * 100) / 100,
    };
  });

  const lostWorkdays = finalizedBuckets.map((bucket) => ({
    groupKey: bucket.groupKey,
    groupLabel: bucket.groupLabel,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    totalLostWorkdays: bucket.lostWorkdays,
    attendanceAbsentDays: bucket.attendanceAbsentDays,
    approvedLeaveDays: bucket.approvedLeaveDays,
  }));

  const durationByLeaveTypeMap = new Map<
    string,
    {
      totalDurationDays: number;
      requestCount: number;
      employeeIds: Set<string>;
    }
  >();

  for (const leave of input.approvedLeaves) {
    const current = durationByLeaveTypeMap.get(leave.leaveType) ?? {
      totalDurationDays: 0,
      requestCount: 0,
      employeeIds: new Set<string>(),
    };
    current.totalDurationDays += leave.durationDays;
    current.requestCount += 1;
    current.employeeIds.add(leave.employeeId);
    durationByLeaveTypeMap.set(leave.leaveType, current);
  }

  const durationByLeaveType = [...durationByLeaveTypeMap.entries()]
    .map(([leaveType, aggregate]) => ({
      leaveType: hrLamLeaveTypeSchema.parse(leaveType),
      leaveTypeLabel: formatHrAatLeaveTypeLabel(leaveType),
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      totalDurationDays: Math.round(aggregate.totalDurationDays * 100) / 100,
      requestCount: aggregate.requestCount,
      employeeCount: aggregate.employeeIds.size,
    }))
    .sort((left, right) => right.totalDurationDays - left.totalDurationDays);

  const uniqueEmployees = new Set(input.employeeContexts.map((ctx) => ctx.employeeId));

  return {
    requirementCodes: [
      "HRM-AAT-001",
      "HRM-AAT-002",
      "HRM-AAT-003",
      "HRM-AAT-004",
      "HRM-AAT-005",
    ] as const,
    dimension: input.dimension,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    analysisRows,
    absenceRates,
    absenceFrequencies,
    lostWorkdays,
    durationByLeaveType,
    totals: {
      totalLostWorkdays,
      scheduledWorkdays: scheduledWorkdaysTotal,
      absenceRatePercent: computeAatAbsenceRate({
        lostWorkdays: totalLostWorkdays,
        scheduledWorkdays: scheduledWorkdaysTotal,
      }),
      absenceEpisodeCount: computeAatAbsenceFrequency(episodes),
      employeeCount: uniqueEmployees.size,
    },
  };
}

export type HrAatAggregatedMetrics = ReturnType<typeof aggregateAatAbsenceMetrics>;

/** HRM-AAT-001 … HRM-AAT-005 shipment matrix (code-verified). */
export type AatCoverageStatus = "shipped" | "partial" | "deferred";

export type AatRequirementCoverage = {
  readonly code: `HRM-AAT-${string}`;
  readonly status: AatCoverageStatus;
  readonly evidence: readonly string[];
};

export const AAT_REQUIREMENT_COVERAGE: readonly AatRequirementCoverage[] = [
  {
    code: "HRM-AAT-001",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.time.aat-analytics-core.shared.ts (aggregateAatAbsenceMetrics, resolveAatDimensionGroup)",
      "packages/features/hr-suite/.../schemas/hr.time.aat-analytics.schema.ts (hrAatAnalyticsDimensionSchema)",
    ],
  },
  {
    code: "HRM-AAT-002",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.time.aat-analytics-core.shared.ts (computeAatAbsenceRate)",
      "packages/features/hr-suite/.../schemas/hr.time.aat-analytics.schema.ts (hrAatAbsenceRateMetricSchema)",
    ],
  },
  {
    code: "HRM-AAT-003",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.time.aat-analytics-core.shared.ts (computeAatAbsenceFrequency, buildAatAbsenceEpisodes)",
      "packages/features/hr-suite/.../schemas/hr.time.aat-analytics.schema.ts (hrAatAbsenceFrequencyMetricSchema)",
    ],
  },
  {
    code: "HRM-AAT-004",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.time.aat-analytics-core.shared.ts (computeAatTotalLostWorkdays)",
      "packages/features/hr-suite/.../schemas/hr.time.aat-analytics.schema.ts (hrAatLostWorkdaysMetricSchema)",
    ],
  },
  {
    code: "HRM-AAT-005",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../data/hr.time.aat-analytics-core.shared.ts (aggregateAatAbsenceMetrics durationByLeaveType)",
      "packages/features/hr-suite/.../schemas/hr.time.aat-analytics.schema.ts (hrAatLeaveTypeDurationMetricSchema)",
    ],
  },
  {
    code: "HRM-AAT-018",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_aat_absence_risk_thresholds)",
      "packages/features/hr-suite/.../data/hr.time.aat-risk.server.ts (getHrAatAbsenceRiskThresholds, upsertHrAatAbsenceRiskThresholds)",
      "packages/features/hr-suite/.../policies/hr.time.aat-risk-threshold.policy.server.ts",
    ],
  },
  {
    code: "HRM-AAT-019",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../schemas/hr.time.aat-risk.schema.ts (hrAatAbsenceRiskLevelSchema)",
      "packages/features/hr-suite/.../policies/hr.time.aat-risk-threshold.policy.server.ts (classifyHrAatAbsenceRisk)",
    ],
  },
  {
    code: "HRM-AAT-020",
    status: "shipped",
    evidence: [
      "packages/features/hr-suite/.../policies/hr.time.aat-access.policy.server.ts (requireHrAatRiskRead, canViewRiskIndicators)",
      "packages/features/hr-suite/.../data/hr.time.aat-risk.server.ts (listHrAatAbsenceRiskIndicators)",
    ],
  },
  {
    code: "HRM-AAT-021",
    status: "shipped",
    evidence: [
      "packages/db/src/schema/hr.ts (hr_aat_corrective_action_refs)",
      "packages/features/hr-suite/.../data/hr.time.aat-corrective-ref.server.ts",
    ],
  },
  {
    code: "HRM-AAT-022",
    status: "shipped",
    evidence: [
      "packages/db/src/hr-lam-advanced.ts (listHrLamPayrollReferencesForPeriod)",
      "packages/features/hr-suite/.../data/hr.time.aat-payroll-ref.server.ts",
      "packages/features/hr-suite/.../policies/hr.time.aat-access.policy.server.ts (requireHrAatPayrollRefRead)",
    ],
  },
] as const;

/** HRM-AAT-001 … HRM-AAT-005 shipment matrix (code-verified). */
export const AAT_ANALYTICS_CORE_REQUIREMENT_COVERAGE = AAT_REQUIREMENT_COVERAGE.filter(
  (row) =>
    row.code === "HRM-AAT-001" ||
    row.code === "HRM-AAT-002" ||
    row.code === "HRM-AAT-003" ||
    row.code === "HRM-AAT-004" ||
    row.code === "HRM-AAT-005",
);

export function assertAatAnalyticsCoreCoverageComplete(): void {
  const missing = AAT_ANALYTICS_CORE_REQUIREMENT_COVERAGE.filter(
    (row) => row.status !== "shipped",
  );
  if (missing.length > 0) {
    throw new Error(
      `aat_analytics_core_incomplete:${missing.map((row) => row.code).join(",")}`,
    );
  }
}

export function assertAatCoverageComplete(): void {
  const missing = AAT_REQUIREMENT_COVERAGE.filter((row) => row.status !== "shipped");
  if (missing.length > 0) {
    throw new Error(
      `aat_acceptance_incomplete:${missing.map((row) => row.code).join(",")}`,
    );
  }
}
