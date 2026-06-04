import { describe, expect, it } from "vitest";

import {
  assertPerformanceAcceptanceCriteriaComplete,
  assertPerformanceCoverageComplete,
  PERFORMANCE_ACCEPTANCE_CRITERIA_COVERAGE,
  PERFORMANCE_REQUIREMENT_COVERAGE,
} from "../../src/talent-management/performance-appraisals/hr.talent.performance-coverage.shared";

describe("HRM-PER-001..031 coverage registry", () => {
  it("registers all thirty-one requirements as shipped", () => {
    expect(PERFORMANCE_REQUIREMENT_COVERAGE).toHaveLength(31);
    expect(
      PERFORMANCE_REQUIREMENT_COVERAGE.every((entry) => entry.status === "shipped"),
    ).toBe(true);
    expect(PERFORMANCE_REQUIREMENT_COVERAGE.map((entry) => entry.code)).toEqual(
      Array.from({ length: 31 }, (_, index) =>
        `HRM-PER-${String(index + 1).padStart(3, "0")}`,
      ),
    );
    expect(() => assertPerformanceCoverageComplete()).not.toThrow();
  });

  it("maps all twenty-four enterprise acceptance criteria", () => {
    expect(PERFORMANCE_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(24);
    expect(
      PERFORMANCE_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.requirements.length > 0,
      ),
    ).toBe(true);
    expect(() => assertPerformanceAcceptanceCriteriaComplete()).not.toThrow();
  });
});
