import { describe, expect, it } from "vitest";
import {
  buildHrOffboardingListSurface,
  hrOffboardingSurfaceKey,
} from "../../src/workforce/offboarding/surface/hr-offboarding-list.surface";

describe("hr workforce offboarding list surface", () => {
  it("builds governed list configuration with stable surface key", () => {
    const configuration = buildHrOffboardingListSurface({
      window: {
        rows: [
          {
            id: "off_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            status: "in_progress",
            priorEmploymentStatus: "active",
            reason: "resignation",
            lastWorkingDate: new Date("2026-06-30T00:00:00.000Z"),
            startedAt: new Date("2026-05-01T12:00:00.000Z"),
            completedAt: null,
            cancelledAt: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      searchValue: "alex",
    });

    expect(hrOffboardingSurfaceKey).toBe("hr.workforce.offboarding.list");
    expect(configuration.rows).toHaveLength(1);
    expect(configuration.rows[0]?.cells.employee).toBe("Alex Operator");
    expect(configuration.rows[0]?.rowHref).toBe("/hr/employees/emp_1");
    expect(configuration.surface?.empty?.title).toBe("No offboarding cases");
  });
});
