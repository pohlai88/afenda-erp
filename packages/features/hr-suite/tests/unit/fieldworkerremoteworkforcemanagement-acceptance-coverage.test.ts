import { describe, expect, it } from "vitest";

import {
  HR_INDUSTRY_FRM_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_INDUSTRY_FRM_REQUIREMENT_COVERAGE,
  assertHrIndustryFrmEnterpriseCoverage,
} from "../../src/industry-specific/field-worker-remote-workforce-management/hr.industry.frm-coverage.shared";

describe("HRM-FRM-001..031 coverage registry", () => {
  it("registers all thirty-one requirements as shipped", () => {
    assertHrIndustryFrmEnterpriseCoverage();

    expect(HR_INDUSTRY_FRM_REQUIREMENT_COVERAGE).toHaveLength(31);
    expect(HR_INDUSTRY_FRM_REQUIREMENT_COVERAGE.map((entry) => entry.code))
      .toEqual(
        Array.from({ length: 31 }, (_, index) =>
          `HRM-FRM-${String(index + 1).padStart(3, "0")}`,
        ),
      );
  });

  it("maps all thirty enterprise acceptance criteria", () => {
    expect(HR_INDUSTRY_FRM_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(30);
    expect(
      HR_INDUSTRY_FRM_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });
});
