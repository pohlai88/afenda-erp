import { describe, expect, it } from "vitest";

import {
  HR_INDUSTRY_GPG_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_INDUSTRY_GPG_REQUIREMENT_COVERAGE,
} from "../../src/industry-specific/government-classification-pay-grades/metadata";

describe("HRM-GPG-001..031 coverage registry", () => {
  it("registers all thirty-one requirements as shipped", () => {
    expect(HR_INDUSTRY_GPG_REQUIREMENT_COVERAGE).toHaveLength(31);
    expect(
      HR_INDUSTRY_GPG_REQUIREMENT_COVERAGE.map((entry) => entry.code),
    ).toEqual(
      Array.from(
        { length: 31 },
        (_, index) => `HRM-GPG-${String(index + 1).padStart(3, "0")}`,
      ),
    );
    expect(
      HR_INDUSTRY_GPG_REQUIREMENT_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });

  it("maps all twenty-six enterprise acceptance criteria", () => {
    expect(HR_INDUSTRY_GPG_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(26);
    expect(
      HR_INDUSTRY_GPG_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });
});
