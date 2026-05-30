import { describe, expect, it } from "vitest";

import {
  AAT_ANALYTICS_CORE_REQUIREMENT_COVERAGE,
  aggregateAatAbsenceMetrics,
  assertAatAnalyticsCoreCoverageComplete,
  buildAatAbsenceEpisodes,
  computeAatAbsenceFrequency,
  computeAatAbsenceRate,
  computeAatTotalLostWorkdays,
  HrAatAnalyticsInvariantError,
  resolveAatDimensionGroup,
} from "../data/hr.time.aat-analytics-core.shared";
import {
  hrAatAnalyticsQuerySchema,
  hrAatAnalyticsSnapshotSchema,
} from "../schemas/hr.time.aat-analytics.schema";

const periodStart = new Date("2026-05-01T00:00:00.000Z");
const periodEnd = new Date("2026-05-31T23:59:59.999Z");

const employeeContexts = [
  {
    employeeId: "emp-1",
    employeeNumber: "E001",
    displayName: "Alex Analyst",
    departmentId: "dept-sales",
    departmentName: "Sales",
    departmentUnitType: "department",
    managerEmployeeId: "mgr-1",
    legalEntityCode: "MY-01",
    workLocationCode: "KL-HQ",
  },
  {
    employeeId: "emp-2",
    employeeNumber: "E002",
    displayName: "Blake Builder",
    departmentId: "team-platform",
    departmentName: "Platform Team",
    departmentUnitType: "team",
    managerEmployeeId: "mgr-1",
    legalEntityCode: "MY-01",
    workLocationCode: "KL-HQ",
  },
] as const;

describe("HRM-AAT-001 … HRM-AAT-005 coverage matrix", () => {
  it("includes requirement codes HRM-AAT-001 through HRM-AAT-005", () => {
    const codes = AAT_ANALYTICS_CORE_REQUIREMENT_COVERAGE.map((row) => row.code);
    for (let i = 1; i <= 5; i += 1) {
      const padded = String(i).padStart(3, "0");
      expect(codes).toContain(`HRM-AAT-${padded}`);
    }
    expect(codes).toHaveLength(5);
    expect(() => assertAatAnalyticsCoreCoverageComplete()).not.toThrow();
  });
});

describe("resolveAatDimensionGroup (HRM-AAT-001)", () => {
  it("groups employees, teams, and departments separately", () => {
    expect(
      resolveAatDimensionGroup(employeeContexts[0], "employee")?.groupKey,
    ).toBe("emp-1");
    expect(
      resolveAatDimensionGroup(employeeContexts[1], "team")?.groupKey,
    ).toBe("team-platform");
    expect(
      resolveAatDimensionGroup(employeeContexts[0], "department")?.groupKey,
    ).toBe("dept-sales");
    expect(
      resolveAatDimensionGroup(employeeContexts[1], "department"),
    ).toBeNull();
  });
});

describe("computeAatAbsenceRate (HRM-AAT-002)", () => {
  it("returns percentage of scheduled workdays lost", () => {
    expect(
      computeAatAbsenceRate({ lostWorkdays: 2, scheduledWorkdays: 10 }),
    ).toBe(20);
    expect(
      computeAatAbsenceRate({ lostWorkdays: 0, scheduledWorkdays: 0 }),
    ).toBe(0);
  });

  it("rejects negative inputs", () => {
    expect(() =>
      computeAatAbsenceRate({ lostWorkdays: -1, scheduledWorkdays: 10 }),
    ).toThrow(HrAatAnalyticsInvariantError);
  });
});

describe("computeAatAbsenceFrequency (HRM-AAT-003)", () => {
  it("counts distinct absence episodes", () => {
    const episodes = buildAatAbsenceEpisodes({
      attendanceDays: [
        {
          employeeId: "emp-1",
          workDate: new Date("2026-05-05T00:00:00.000Z"),
          status: "absent",
        },
      ],
      approvedLeaves: [
        {
          employeeId: "emp-2",
          leaveRequestId: "leave-1",
          leaveType: "annual",
          durationDays: 2,
          startAt: new Date("2026-05-10T00:00:00.000Z"),
          endAt: new Date("2026-05-11T00:00:00.000Z"),
        },
      ],
    }).episodes;

    expect(computeAatAbsenceFrequency(episodes)).toBe(2);
  });
});

describe("computeAatTotalLostWorkdays (HRM-AAT-004)", () => {
  it("deduplicates overlapping attendance absent days and approved leave", () => {
    const totals = buildAatAbsenceEpisodes({
      attendanceDays: [
        {
          employeeId: "emp-1",
          workDate: new Date("2026-05-10T00:00:00.000Z"),
          status: "absent",
        },
      ],
      approvedLeaves: [
        {
          employeeId: "emp-1",
          leaveRequestId: "leave-1",
          leaveType: "sick",
          durationDays: 1,
          startAt: new Date("2026-05-10T00:00:00.000Z"),
          endAt: new Date("2026-05-10T00:00:00.000Z"),
        },
      ],
    });

    expect(totals.overlapDays).toBe(1);
    expect(
      computeAatTotalLostWorkdays({
        attendanceAbsentDays: totals.attendanceAbsentDays,
        approvedLeaveDays: totals.approvedLeaveDays,
        overlapDays: totals.overlapDays,
      }),
    ).toBe(1);
  });
});

describe("aggregateAatAbsenceMetrics (HRM-AAT-001 … HRM-AAT-005)", () => {
  it("produces serializable analytics snapshot by department", () => {
    const snapshot = aggregateAatAbsenceMetrics({
      dimension: "department",
      periodStart,
      periodEnd,
      employeeContexts: [...employeeContexts],
      attendanceDays: [
        {
          employeeId: "emp-1",
          workDate: new Date("2026-05-02T00:00:00.000Z"),
          status: "present",
        },
        {
          employeeId: "emp-1",
          workDate: new Date("2026-05-03T00:00:00.000Z"),
          status: "absent",
        },
        {
          employeeId: "emp-2",
          workDate: new Date("2026-05-04T00:00:00.000Z"),
          status: "present",
        },
      ],
      approvedLeaves: [
        {
          employeeId: "emp-1",
          leaveRequestId: "leave-annual",
          leaveType: "annual",
          durationDays: 2,
          startAt: new Date("2026-05-20T00:00:00.000Z"),
          endAt: new Date("2026-05-21T00:00:00.000Z"),
        },
      ],
    });

    expect(snapshot.requirementCodes).toEqual([
      "HRM-AAT-001",
      "HRM-AAT-002",
      "HRM-AAT-003",
      "HRM-AAT-004",
      "HRM-AAT-005",
    ]);
    expect(snapshot.analysisRows).toHaveLength(1);
    expect(snapshot.analysisRows[0]?.groupKey).toBe("dept-sales");
    expect(snapshot.totals.totalLostWorkdays).toBe(3);
    expect(snapshot.durationByLeaveType[0]?.leaveType).toBe("annual");
    expect(snapshot.durationByLeaveType[0]?.totalDurationDays).toBe(2);

    const parsed = hrAatAnalyticsSnapshotSchema.safeParse(snapshot);
    expect(parsed.success).toBe(true);
  });

  it("supports manager and location dimensions", () => {
    const byManager = aggregateAatAbsenceMetrics({
      dimension: "manager",
      periodStart,
      periodEnd,
      employeeContexts: [...employeeContexts],
      attendanceDays: [
        {
          employeeId: "emp-1",
          workDate: new Date("2026-05-06T00:00:00.000Z"),
          status: "absent",
        },
      ],
      approvedLeaves: [],
    });

    expect(byManager.analysisRows[0]?.groupKey).toBe("mgr-1");

    const byLocation = aggregateAatAbsenceMetrics({
      dimension: "location",
      periodStart,
      periodEnd,
      employeeContexts: [...employeeContexts],
      attendanceDays: [],
      approvedLeaves: [],
    });

    expect(byLocation.analysisRows[0]?.groupKey).toBe("KL-HQ");
  });
});

describe("hrAatAnalyticsQuerySchema", () => {
  it("rejects inverted periods", () => {
    const parsed = hrAatAnalyticsQuerySchema.safeParse({
      dimension: "employee",
      periodStart: "2026-06-01",
      periodEnd: "2026-05-01",
    });
    expect(parsed.success).toBe(false);
  });
});
