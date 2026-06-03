import {
  type AatAttendanceExceptionTrendResult,
  type AatPatternDetectionConfig,
  type AatPeriodQuery,
  type AatTrendDirection,
  DEFAULT_AAT_PATTERN_CONFIG,
  aatPatternDetectionConfigSchema,
  aatPeriodQuerySchema,
} from "./hr.time.aat-patterns.schema";

type AttendanceExceptionDay = {
  workDate: Date;
  lateArrivalCount: number;
  earlyDepartureCount: number;
  absenceCount: number;
  missingPunchCount: number;
};

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
  const delta = input.laterTotal - input.earlierTotal;
  const change = (delta / input.earlierTotal) * 100;
  if (change <= -input.thresholdPercent) {
    return "improving";
  }
  if (change >= input.thresholdPercent) {
    return "worsening";
  }
  return "stable";
}

function mapAttendanceStatusToExceptionCounts(status: string): {
  lateArrivalCount: number;
  earlyDepartureCount: number;
  absenceCount: number;
  missingPunchCount: number;
} {
  switch (status) {
    case "late":
      return {
        lateArrivalCount: 1,
        earlyDepartureCount: 0,
        absenceCount: 0,
        missingPunchCount: 0,
      };
    case "early_out":
      return {
        lateArrivalCount: 0,
        earlyDepartureCount: 1,
        absenceCount: 0,
        missingPunchCount: 0,
      };
    case "absent":
      return {
        lateArrivalCount: 0,
        earlyDepartureCount: 0,
        absenceCount: 1,
        missingPunchCount: 0,
      };
    case "missing_punch":
      return {
        lateArrivalCount: 0,
        earlyDepartureCount: 0,
        absenceCount: 0,
        missingPunchCount: 1,
      };
    default:
      return {
        lateArrivalCount: 0,
        earlyDepartureCount: 0,
        absenceCount: 0,
        missingPunchCount: 0,
      };
  }
}

/** HRM-AAT-011 — aggregate attendance exception trends from day-level exception counts. */
export function analyzeAttendanceExceptionTrends(input: {
  days: readonly AttendanceExceptionDay[];
  config?: Partial<AatPatternDetectionConfig>;
}): AatAttendanceExceptionTrendResult {
  const config = aatPatternDetectionConfigSchema.parse(
    input.config ?? DEFAULT_AAT_PATTERN_CONFIG,
  );

  const bucketMap = new Map<
    string,
    {
      lateArrivalCount: number;
      earlyDepartureCount: number;
      absenceCount: number;
      missingPunchCount: number;
    }
  >();

  const totals = {
    lateArrivalCount: 0,
    earlyDepartureCount: 0,
    absenceCount: 0,
    missingPunchCount: 0,
    totalExceptions: 0,
  };

  for (const day of input.days) {
    const periodKey = monthPeriodKey(day.workDate);
    const bucket = bucketMap.get(periodKey) ?? {
      lateArrivalCount: 0,
      earlyDepartureCount: 0,
      absenceCount: 0,
      missingPunchCount: 0,
    };
    bucket.lateArrivalCount += day.lateArrivalCount;
    bucket.earlyDepartureCount += day.earlyDepartureCount;
    bucket.absenceCount += day.absenceCount;
    bucket.missingPunchCount += day.missingPunchCount;
    bucketMap.set(periodKey, bucket);

    totals.lateArrivalCount += day.lateArrivalCount;
    totals.earlyDepartureCount += day.earlyDepartureCount;
    totals.absenceCount += day.absenceCount;
    totals.missingPunchCount += day.missingPunchCount;
    totals.totalExceptions +=
      day.lateArrivalCount +
      day.earlyDepartureCount +
      day.absenceCount +
      day.missingPunchCount;
  }

  const sortedKeys = [...bucketMap.keys()].sort();
  const buckets = sortedKeys.map((periodKey) => {
    const bucket = bucketMap.get(periodKey)!;
    const bounds = monthPeriodBounds(periodKey);
    const totalExceptions =
      bucket.lateArrivalCount +
      bucket.earlyDepartureCount +
      bucket.absenceCount +
      bucket.missingPunchCount;
    return {
      periodKey,
      periodStart: bounds.periodStart,
      periodEnd: bounds.periodEnd,
      ...bucket,
      totalExceptions,
    };
  });

  const midpoint = Math.ceil(sortedKeys.length / 2);
  const earlierTotal = sortedKeys
    .slice(0, midpoint)
    .reduce((sum, key) => {
      const bucket = bucketMap.get(key);
      if (!bucket) {
        return sum;
      }
      return (
        sum +
        bucket.lateArrivalCount +
        bucket.earlyDepartureCount +
        bucket.absenceCount +
        bucket.missingPunchCount
      );
    }, 0);
  const laterTotal = sortedKeys
    .slice(midpoint)
    .reduce((sum, key) => {
      const bucket = bucketMap.get(key);
      if (!bucket) {
        return sum;
      }
      return (
        sum +
        bucket.lateArrivalCount +
        bucket.earlyDepartureCount +
        bucket.absenceCount +
        bucket.missingPunchCount
      );
    }, 0);

  return {
    buckets,
    totals,
    trendDirection: resolveTrendDirection({
      earlierTotal,
      laterTotal,
      thresholdPercent: config.trendChangeThresholdPercent,
    }),
  };
}

export async function getAatAttendanceExceptionTrends(input: {
  query: AatPeriodQuery;
  config?: Partial<AatPatternDetectionConfig>;
}): Promise<AatAttendanceExceptionTrendResult> {
  const { and, eq, gte, inArray, isNull, lte } = await import("drizzle-orm");
  const {
    hrAttendanceDays,
    hrEmployees,
    runWithOrganizationContext,
  } = await import("@afenda/db");

  const parsed = aatPeriodQuerySchema.parse(input.query);

  const rows = await runWithOrganizationContext(
    parsed.organizationId,
    async (db) => {
      const employeeConditions = [
        eq(hrEmployees.organizationId, parsed.organizationId),
        isNull(hrEmployees.archivedAt),
      ];
      if (parsed.departmentId) {
        employeeConditions.push(
          eq(hrEmployees.currentDepartmentId, parsed.departmentId),
        );
      }
      if (parsed.managerEmployeeId) {
        employeeConditions.push(
          eq(hrEmployees.managerEmployeeId, parsed.managerEmployeeId),
        );
      }
      if (parsed.employeeId) {
        employeeConditions.push(eq(hrEmployees.id, parsed.employeeId));
      }

      const employeeRows = await db
        .select({ employeeId: hrEmployees.id })
        .from(hrEmployees)
        .where(and(...employeeConditions));

      const employeeIds = employeeRows.map((row) => row.employeeId);
      if (employeeIds.length === 0) {
        return [];
      }

      return db
        .select({
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
            inArray(hrAttendanceDays.status, [
              "late",
              "early_out",
              "absent",
              "missing_punch",
            ]),
          ),
        );
    },
  );

  const days: AttendanceExceptionDay[] = rows.map((row) => ({
    workDate: row.workDate,
    ...mapAttendanceStatusToExceptionCounts(row.status),
  }));

  return analyzeAttendanceExceptionTrends({
    days,
    config: input.config,
  });
}

export { mapAttendanceStatusToExceptionCounts };
