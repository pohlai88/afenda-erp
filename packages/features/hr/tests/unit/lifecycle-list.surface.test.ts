import { describe, expect, it } from "vitest";
import {
  buildHrLifecycleListSurface,
  hrLifecycleSurfaceKey,
} from "../../src/workforce/lifecycle/surface/hr-lifecycle-list.surface";

describe("hr workforce lifecycle list surface", () => {
  it("builds governed list configuration with stable surface key", () => {
    const configuration = buildHrLifecycleListSurface({
      window: {
        rows: [
          {
            id: "emp_1",
            employeeNumber: "E-200",
            displayName: "Jordan Probation",
            employmentStatus: "probation",
            stage: "probation",
            probationEndDate: new Date("2026-06-01T00:00:00.000Z"),
            confirmationDate: null,
            pendingTransitionCount: 1,
            nextEffectiveDate: new Date("2026-06-15T00:00:00.000Z"),
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      searchValue: "jordan",
    });

    expect(hrLifecycleSurfaceKey).toBe("hr.workforce.lifecycle.list");
    expect(configuration.rows).toHaveLength(1);
    expect(configuration.rows[0]?.cells.employee).toBe("Jordan Probation");
    expect(configuration.rows[0]?.rowHref).toBe("/hr/employees/emp_1");
    expect(configuration.pagination?.totalCount).toBe(1);
    expect(configuration.presentation?.toolbar?.search?.value).toBe("jordan");
    expect(configuration.surface?.empty?.title).toBe("No lifecycle rows");
  });
});
