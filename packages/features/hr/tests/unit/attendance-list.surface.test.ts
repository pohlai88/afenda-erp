import { describe, expect, it } from "vitest";
import {
  buildHrAttendanceListSurface,
  hrAttendanceSurfaceKey,
} from "../../src/time-attendance/attendance/surface/hr-attendance-list.surface";

describe("hr time-attendance attendance list surface", () => {
  it("builds governed list configuration with stable surface key", () => {
    const configuration = buildHrAttendanceListSurface({
      window: {
        rows: [
          {
            id: "att_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            punchType: "clock_in",
            status: "active",
            source: "manual",
            punchedAt: new Date("2026-05-01T08:00:00.000Z"),
            notes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
    });

    expect(hrAttendanceSurfaceKey).toBe("hr.time-attendance.attendance.list");
    expect(configuration.rows[0]?.cells.punchType).toBe("Clock in");
    expect(configuration.rows[0]?.rowHref).toBe("/hr/employees/emp_1");
  });
});
