import { describe, expect, it } from "vitest";
import {
  buildHrOvertimeListSurface,
  hrOvertimeSurfaceKey,
} from "../../src/time-attendance/overtime/surface/hr-overtime-list.surface";

describe("hr time-attendance overtime list surface", () => {
  it("builds governed list configuration with stable surface key", () => {
    const configuration = buildHrOvertimeListSurface({
      window: {
        rows: [
          {
            id: "ot_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            overtimeType: "weekend",
            status: "pending",
            workDate: new Date("2026-05-10T00:00:00.000Z"),
            hours: "4.00",
            reason: "Project deadline",
            decisionNote: null,
            submittedAt: new Date("2026-05-09T12:00:00.000Z"),
            decidedAt: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
    });

    expect(hrOvertimeSurfaceKey).toBe("hr.time-attendance.overtime.list");
    expect(configuration.rows[0]?.cells.overtimeType).toBe("weekend");
    expect(configuration.rows[0]?.rowHref).toBe("/hr/employees/emp_1");
  });
});
