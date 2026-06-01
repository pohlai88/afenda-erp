import { describe, expect, it } from "vitest";

import {
  HR_TALENT_ENG_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_TALENT_ENG_REQUIREMENT_COVERAGE,
  assertHrTalentEngEnterpriseCoverage,
} from "../../src/talent-management/employee-engagement-surveys/data/hr.talent.eng-coverage.shared";

describe("Employee Engagement Surveys enterprise coverage", () => {
  it("ships HRM-ENG-001 through HRM-ENG-034 and all acceptance criteria", () => {
    expect(() => assertHrTalentEngEnterpriseCoverage()).not.toThrow();
    expect(HR_TALENT_ENG_REQUIREMENT_COVERAGE).toHaveLength(34);
    expect(HR_TALENT_ENG_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(27);
    expect(
      HR_TALENT_ENG_REQUIREMENT_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
    expect(
      HR_TALENT_ENG_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });
});
