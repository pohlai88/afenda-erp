import { describe, expect, it } from "vitest";
import {
  buildHrLeaveListSurface,
  hrLeaveSurfaceKey,
} from "../../src/time-attendance/leave/surface/hr-leave-list.surface";

describe("hr time-attendance leave list surface", () => {
  it("builds governed list configuration with stable surface key", () => {
    const configuration = buildHrLeaveListSurface({
      window: {
        rows: [
          {
            id: "lv_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            leaveType: "annual",
            status: "pending",
            startAt: new Date("2026-06-01T00:00:00.000Z"),
            endAt: new Date("2026-06-05T23:59:59.999Z"),
            durationDays: "5.00",
            reason: "vacation",
            decisionNote: null,
            submittedAt: new Date("2026-05-01T12:00:00.000Z"),
            decidedAt: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      searchValue: "alex",
    });

    expect(hrLeaveSurfaceKey).toBe("hr.time-attendance.leave.list");
    expect(configuration.rows).toHaveLength(1);
    expect(configuration.rows[0]?.cells.employee).toBe("Alex Operator");
    expect(configuration.rows[0]?.rowHref).toBe("/hr/employees/emp_1");
  });
});
