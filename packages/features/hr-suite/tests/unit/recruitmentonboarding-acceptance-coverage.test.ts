import { describe, expect, it } from "vitest";

import {
  assertRonCoverageComplete,
  RON_ACCEPTANCE_CRITERIA_COVERAGE,
  RON_REQUIREMENT_COVERAGE,
} from "../../src/talent-management/recruitment-onboarding/data/hr.talent.ron-coverage.shared";

describe("HRM-RON-001..041 coverage registry", () => {
  it("registers all forty-one requirements as shipped", () => {
    assertRonCoverageComplete();

    expect(RON_REQUIREMENT_COVERAGE).toHaveLength(41);
    expect(
      RON_REQUIREMENT_COVERAGE.map((entry) => entry.code),
    ).toEqual(
      Array.from({ length: 41 }, (_, index) =>
        `HRM-RON-${String(index + 1).padStart(3, "0")}`,
      ),
    );
    expect(RON_REQUIREMENT_COVERAGE.every((entry) => entry.status === "shipped"))
      .toBe(true);
  });

  it("maps all thirty-three enterprise acceptance criteria", () => {
    expect(RON_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(33);
    expect(
      RON_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.requirements.length > 0,
      ),
    ).toBe(true);
  });
});
