import { describe, expect, it } from "vitest";
import {
  buildHrShiftsListSurface,
  hrShiftsSurfaceKey,
} from "../../src/time-attendance/shifts/surface/hr-shifts-list.surface";

describe("hr time-attendance shifts list surface", () => {
  it("builds governed list configuration with stable surface key", () => {
    const configuration = buildHrShiftsListSurface({
      window: {
        rows: [
          {
            id: "sh_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            templateId: "tpl_1",
            templateCode: "DAY",
            templateName: "Day shift",
            status: "scheduled",
            shiftDate: new Date("2026-06-01T00:00:00.000Z"),
            shiftStart: new Date("2026-06-01T09:00:00.000Z"),
            shiftEnd: new Date("2026-06-01T17:00:00.000Z"),
            notes: null,
            publishedAt: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
    });

    expect(hrShiftsSurfaceKey).toBe("hr.time-attendance.shifts.list");
    expect(configuration.rows[0]?.cells.status).toBe("scheduled");
    expect(configuration.rows[0]?.rowHref).toBe("/hr/employees/emp_1");
  });
});
