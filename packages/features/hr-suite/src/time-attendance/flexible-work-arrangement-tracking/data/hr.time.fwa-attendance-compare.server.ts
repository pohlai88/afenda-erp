import "@afenda/kernel/server";

import {
  getHrFwaArrangementById,
  getHrFwaSchedulePattern,
  listAttendanceDaysForEmployee,
} from "@afenda/db";

import {
  eachUtcDayInRange,
  hrFwaAttendanceCompareResultSchema,
  isHrFwaAttendedStatus,
  isHrFwaIncompleteAttendanceStatus,
  normalizeHrFwaSchedulePattern,
  resolveHrFwaDayExpectation,
  startOfUtcDay,
  type HrFwaAttendanceCompareResult,
  type HrFwaAttendanceCompareRow,
  type HrFwaSchedulePatternSnapshot,
} from "../schemas/hr.time.fwa-compliance.schema";

function attendanceByDateKey(
  rows: readonly {
    id: string;
    workDate: Date;
    status: string;
  }[],
): Map<string, { id: string; status: string }> {
  const map = new Map<string, { id: string; status: string }>();
  for (const row of rows) {
    map.set(startOfUtcDay(row.workDate).toISOString(), {
      id: row.id,
      status: row.status,
    });
  }
  return map;
}

function compareDay(
  pattern: HrFwaSchedulePatternSnapshot,
  workDate: Date,
  attendance: { id: string; status: string } | undefined,
): HrFwaAttendanceCompareRow {
  const dayOfWeek = workDate.getUTCDay();
  const expected = resolveHrFwaDayExpectation(pattern, dayOfWeek);
  const status = attendance?.status ?? null;

  if (expected === "rest" || expected === "off") {
    return {
      workDate,
      dayOfWeek,
      expected,
      attendanceStatus: status,
      attendanceDayId: attendance?.id ?? null,
      aligned: true,
      mismatchReason: null,
    };
  }

  const requiresAttendance = expected === "office" || expected === "remote" || expected === "work";
  if (!requiresAttendance) {
    return {
      workDate,
      dayOfWeek,
      expected,
      attendanceStatus: status,
      attendanceDayId: attendance?.id ?? null,
      aligned: true,
      mismatchReason: null,
    };
  }

  if (!attendance || isHrFwaIncompleteAttendanceStatus(status)) {
    return {
      workDate,
      dayOfWeek,
      expected,
      attendanceStatus: status,
      attendanceDayId: attendance?.id ?? null,
      aligned: false,
      mismatchReason: "incomplete_attendance",
    };
  }

  if (!isHrFwaAttendedStatus(status)) {
    return {
      workDate,
      dayOfWeek,
      expected,
      attendanceStatus: status,
      attendanceDayId: attendance?.id ?? null,
      aligned: false,
      mismatchReason: "expected_work_day_not_attended",
    };
  }

  return {
    workDate,
    dayOfWeek,
    expected,
    attendanceStatus: status,
    attendanceDayId: attendance?.id ?? null,
    aligned: true,
    mismatchReason: null,
  };
}

/** HRM-FWA-022 — compare approved flexible schedule with LAM attendance records. */
export async function compareHrFwaScheduleWithAttendance(input: {
  organizationId: string;
  arrangementId: string;
  periodStart: Date;
  periodEnd: Date;
}): Promise<HrFwaAttendanceCompareResult> {
  const arrangement = await getHrFwaArrangementById({
    organizationId: input.organizationId,
    arrangementId: input.arrangementId,
  });

  if (!arrangement.schedulePatternId) {
    const empty = hrFwaAttendanceCompareResultSchema.parse({
      requirementCode: "HRM-FWA-022",
      arrangementId: input.arrangementId,
      employeeId: arrangement.employeeId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      rows: [],
      misalignedDayCount: 0,
    });
    return empty;
  }

  const schedulePattern = await getHrFwaSchedulePattern({
    organizationId: input.organizationId,
    schedulePatternId: arrangement.schedulePatternId,
  });
  const pattern = normalizeHrFwaSchedulePattern(schedulePattern.patternDetails);

  const attendanceRows = await listAttendanceDaysForEmployee({
    organizationId: input.organizationId,
    employeeId: arrangement.employeeId,
    workDateFrom: input.periodStart,
    workDateTo: input.periodEnd,
  });
  const byDate = attendanceByDateKey(attendanceRows);

  const rows = eachUtcDayInRange(input.periodStart, input.periodEnd).map(
    (workDate) =>
      compareDay(pattern, workDate, byDate.get(startOfUtcDay(workDate).toISOString())),
  );

  const result = {
    requirementCode: "HRM-FWA-022" as const,
    arrangementId: input.arrangementId,
    employeeId: arrangement.employeeId,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    rows,
    misalignedDayCount: rows.filter((row) => !row.aligned).length,
  };

  return hrFwaAttendanceCompareResultSchema.parse(result);
}

export function countHrFwaObservedLocationDays(input: {
  compareRows: readonly HrFwaAttendanceCompareRow[];
}): { observedOfficeDays: number; observedRemoteDays: number } {
  let observedOfficeDays = 0;
  let observedRemoteDays = 0;

  for (const row of input.compareRows) {
    if (!isHrFwaAttendedStatus(row.attendanceStatus)) {
      continue;
    }
    if (row.expected === "office") {
      observedOfficeDays += 1;
    } else if (row.expected === "remote") {
      observedRemoteDays += 1;
    }
  }

  return { observedOfficeDays, observedRemoteDays };
}
