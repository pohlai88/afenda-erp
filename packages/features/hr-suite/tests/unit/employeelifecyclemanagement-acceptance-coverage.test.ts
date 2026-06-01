import { describe, expect, it } from "vitest";

import {
  HR_LIFECYCLE_LIST_SURFACE_KEYS,
  HR_WORKFORCE_LIFECYCLE_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_WORKFORCE_LIFECYCLE_REQUIREMENT_COVERAGE,
  assertHrWorkforceLifecycleEnterpriseCoverage,
} from "../../src/employee-management/employee-lifecycle-management/metadata";

describe("Employee Lifecycle Management enterprise coverage", () => {
  it("ships HRM-LCY-001 through HRM-LCY-028 and all acceptance criteria", () => {
    expect(() => assertHrWorkforceLifecycleEnterpriseCoverage()).not.toThrow();
    expect(HR_WORKFORCE_LIFECYCLE_REQUIREMENT_COVERAGE).toHaveLength(28);
    expect(
      HR_WORKFORCE_LIFECYCLE_ACCEPTANCE_CRITERIA_COVERAGE,
    ).toHaveLength(20);
    expect(HR_LIFECYCLE_LIST_SURFACE_KEYS).toHaveLength(8);
    expect(
      HR_WORKFORCE_LIFECYCLE_REQUIREMENT_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
    expect(
      HR_WORKFORCE_LIFECYCLE_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });
});
