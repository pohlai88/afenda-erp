import { describe, expect, it } from "vitest";

import { analyzeAttendanceExceptionTrends } from "../data/hr.time.aat-exceptions.server";
import {
  analyzeUnplannedLeaveTrends,
  buildEmployeeAbsenceMetrics,
  buildGroupAbsenceMetrics,
  detectCalendarAbsencePatterns,
  detectExcessiveAbsence,
  detectHighAbsenceRateGroups,
  detectRepeatedShortAbsencePatterns,
} from "../data/hr.time.aat-patterns.server";
import type { AatAbsenceEvent } from "../schemas/hr.time.aat-patterns.schema";

const employeeA = "emp-a";
const employeeB = "emp-b";

function leaveEvent(input: {
  employeeId: string;
  absenceDate: string;
  leaveType: string;
  durationDays?: number;
  submittedAt?: string;
  leaveStatus?: string;
}): AatAbsenceEvent {
  return {
    employeeId: input.employeeId,
    absenceDate: new Date(input.absenceDate),
    durationDays: input.durationDays ?? 1,
    source: "leave",
    leaveType: input.leaveType,
    leaveRequestId: `req-${input.absenceDate}`,
    submittedAt: input.submittedAt ? new Date(input.submittedAt) : undefined,
    leaveStatus: input.leaveStatus ?? "approved",
  };
}

function attendanceEvent(input: {
  employeeId: string;
  absenceDate: string;
  durationDays?: number;
}): AatAbsenceEvent {
  return {
    employeeId: input.employeeId,
    absenceDate: new Date(input.absenceDate),
    durationDays: input.durationDays ?? 1,
    source: "attendance",
  };
}

describe("HRM-AAT-006 analyzeUnplannedLeaveTrends", () => {
  it("counts emergency/sick/unpaid leave and last-minute submissions", () => {
    const events: AatAbsenceEvent[] = [
      leaveEvent({
        employeeId: employeeA,
        absenceDate: "2026-01-10",
        leaveType: "emergency",
        submittedAt: "2026-01-09",
      }),
      leaveEvent({
        employeeId: employeeB,
        absenceDate: "2026-02-05",
        leaveType: "annual",
      }),
      leaveEvent({
        employeeId: employeeA,
        absenceDate: "2026-02-12",
        leaveType: "sick",
        submittedAt: "2026-02-12",
      }),
      attendanceEvent({ employeeId: employeeB, absenceDate: "2026-02-20" }),
    ];

    const result = analyzeUnplannedLeaveTrends({
      events,
      periodStart: new Date("2026-01-01"),
      periodEnd: new Date("2026-02-28"),
      config: { lastMinuteNoticeDays: 2 },
    });

    expect(result.totalUnplannedEvents).toBe(3);
    expect(result.buckets).toHaveLength(2);
    expect(result.flaggedEmployeeIds).toContain(employeeA);
    expect(result.buckets[0]?.periodKey).toBe("2026-01");
    expect(result.buckets[1]?.lastMinuteCount).toBe(1);
  });
});

describe("HRM-AAT-007 detectRepeatedShortAbsencePatterns", () => {
  it("flags employees with repeated short absences", () => {
    const events: AatAbsenceEvent[] = [
      attendanceEvent({ employeeId: employeeA, absenceDate: "2026-03-01" }),
      attendanceEvent({ employeeId: employeeA, absenceDate: "2026-03-08" }),
      attendanceEvent({ employeeId: employeeA, absenceDate: "2026-03-15" }),
      attendanceEvent({ employeeId: employeeB, absenceDate: "2026-03-02" }),
    ];

    const patterns = detectRepeatedShortAbsencePatterns({
      events,
      config: { minShortAbsenceOccurrences: 3, maxShortAbsenceDays: 1 },
    });

    expect(patterns).toHaveLength(1);
    expect(patterns[0]?.employeeId).toBe(employeeA);
    expect(patterns[0]?.occurrenceCount).toBe(3);
  });
});

describe("HRM-AAT-008 detectCalendarAbsencePatterns", () => {
  it("detects Monday and pre-holiday patterns", () => {
    const events: AatAbsenceEvent[] = [
      attendanceEvent({ employeeId: employeeA, absenceDate: "2026-04-06" }),
      attendanceEvent({ employeeId: employeeA, absenceDate: "2026-04-13" }),
      attendanceEvent({ employeeId: employeeA, absenceDate: "2026-04-20" }),
      attendanceEvent({ employeeId: employeeA, absenceDate: "2026-04-06" }),
    ];

    const mondayPatterns = detectCalendarAbsencePatterns({
      events,
      config: { minCalendarPatternOccurrences: 3 },
    });
    expect(mondayPatterns.some((p) => p.patternKind === "monday")).toBe(true);

    const preHolidayEvents: AatAbsenceEvent[] = [
      attendanceEvent({ employeeId: employeeB, absenceDate: "2026-04-07" }),
      attendanceEvent({ employeeId: employeeB, absenceDate: "2026-05-05" }),
      attendanceEvent({ employeeId: employeeB, absenceDate: "2026-06-02" }),
    ];
    const preHolidayPatterns = detectCalendarAbsencePatterns({
      events: preHolidayEvents,
      holidayDates: [
        new Date("2026-04-08T00:00:00.000Z"),
        new Date("2026-05-06T00:00:00.000Z"),
        new Date("2026-06-03T00:00:00.000Z"),
      ],
      config: { minCalendarPatternOccurrences: 3 },
    });
    expect(
      preHolidayPatterns.some((p) => p.patternKind === "pre_holiday"),
    ).toBe(true);
  });
});

describe("HRM-AAT-009 detectExcessiveAbsence", () => {
  it("flags employees breaching configured thresholds", () => {
    const metrics = buildEmployeeAbsenceMetrics({
      events: [
        attendanceEvent({ employeeId: employeeA, absenceDate: "2026-01-02" }),
        attendanceEvent({ employeeId: employeeA, absenceDate: "2026-01-03" }),
        attendanceEvent({ employeeId: employeeA, absenceDate: "2026-01-04" }),
        attendanceEvent({ employeeId: employeeB, absenceDate: "2026-01-05" }),
      ],
      scheduledWorkdaysByEmployee: new Map([
        [employeeA, 10],
        [employeeB, 20],
      ]),
    });

    const flags = detectExcessiveAbsence({
      metrics,
      config: {
        maxLostWorkdays: 2,
        maxAbsenceFrequency: 2,
        maxAbsenceRatePercent: 10,
      },
    });

    expect(flags).toHaveLength(1);
    expect(flags[0]?.employeeId).toBe(employeeA);
    expect(flags[0]?.breachedThresholds).toContain("lost_workdays");
    expect(flags[0]?.breachedThresholds).toContain("absence_frequency");
  });
});

describe("HRM-AAT-010 detectHighAbsenceRateGroups", () => {
  it("flags departments with high absence rates", () => {
    const groups = buildGroupAbsenceMetrics({
      events: [
        attendanceEvent({ employeeId: employeeA, absenceDate: "2026-01-02" }),
        attendanceEvent({ employeeId: employeeA, absenceDate: "2026-01-03" }),
        attendanceEvent({ employeeId: employeeB, absenceDate: "2026-01-04" }),
      ],
      employees: [
        {
          employeeId: employeeA,
          departmentId: "dept-1",
          departmentName: "Operations",
          unitType: "department",
        },
        {
          employeeId: employeeB,
          departmentId: "dept-2",
          departmentName: "Finance",
          unitType: "department",
        },
      ],
      scheduledWorkdaysByEmployee: new Map([
        [employeeA, 10],
        [employeeB, 20],
      ]),
    });

    const flags = detectHighAbsenceRateGroups({
      groups,
      config: { highGroupAbsenceRatePercent: 15 },
    });

    expect(flags).toHaveLength(1);
    expect(flags[0]?.groupKey).toBe("dept-1");
    expect(flags[0]?.absenceRatePercent).toBe(20);
  });
});

describe("HRM-AAT-011 analyzeAttendanceExceptionTrends", () => {
  it("aggregates late, early, absence, and missing punch trends", () => {
    const result = analyzeAttendanceExceptionTrends({
      days: [
        {
          workDate: new Date("2026-01-05"),
          lateArrivalCount: 2,
          earlyDepartureCount: 0,
          absenceCount: 1,
          missingPunchCount: 0,
        },
        {
          workDate: new Date("2026-02-10"),
          lateArrivalCount: 0,
          earlyDepartureCount: 1,
          absenceCount: 0,
          missingPunchCount: 3,
        },
      ],
    });

    expect(result.totals.lateArrivalCount).toBe(2);
    expect(result.totals.earlyDepartureCount).toBe(1);
    expect(result.totals.absenceCount).toBe(1);
    expect(result.totals.missingPunchCount).toBe(3);
    expect(result.totals.totalExceptions).toBe(7);
    expect(result.buckets).toHaveLength(2);
  });
});
