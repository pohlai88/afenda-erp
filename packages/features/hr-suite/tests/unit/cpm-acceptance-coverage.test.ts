import { describe, expect, it } from "vitest";

import {
  CPM_ACCEPTANCE_CRITERIA_COVERAGE,
  CPM_REQUIREMENT_COVERAGE,
} from "../../src/payroll-compensation/compensation-planning-modeling/hr.payroll.cpm-acceptance-coverage.shared";

describe("HRM-CPM-001..030 coverage registry", () => {
  it("registers all thirty functional requirements as shipped", () => {
    expect(CPM_REQUIREMENT_COVERAGE).toHaveLength(30);
    expect(
      CPM_REQUIREMENT_COVERAGE.every((entry) => entry.status === "shipped"),
    ).toBe(true);
  });

  it("maps all twenty-two enterprise acceptance criteria", () => {
    expect(CPM_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(22);
    expect(
      CPM_ACCEPTANCE_CRITERIA_COVERAGE.every((entry) => entry.status === "shipped"),
    ).toBe(true);
  });
});
