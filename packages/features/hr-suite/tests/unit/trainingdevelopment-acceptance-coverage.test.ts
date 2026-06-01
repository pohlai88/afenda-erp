import { describe, expect, it } from "vitest";

import {
  HR_TALENT_TRAINING_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_TALENT_TRAINING_REQUIREMENT_COVERAGE,
  assertHrTrainingEnterpriseCoverage,
} from "../../src/talent-management/training-development/data/hr.talent.training-coverage.shared";

describe("HRM-TRN-001..030 coverage registry", () => {
  it("registers all thirty requirements as shipped", () => {
    assertHrTrainingEnterpriseCoverage();

    expect(HR_TALENT_TRAINING_REQUIREMENT_COVERAGE).toHaveLength(30);
    expect(HR_TALENT_TRAINING_REQUIREMENT_COVERAGE.map((entry) => entry.code))
      .toEqual(
        Array.from({ length: 30 }, (_, index) =>
          `HRM-TRN-${String(index + 1).padStart(3, "0")}`,
        ),
      );
    expect(
      HR_TALENT_TRAINING_REQUIREMENT_COVERAGE.every(
        (entry) => entry.status === "shipped",
      ),
    ).toBe(true);
  });

  it("maps all twenty-five enterprise acceptance criteria", () => {
    expect(HR_TALENT_TRAINING_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(25);
    expect(
      HR_TALENT_TRAINING_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });
});
