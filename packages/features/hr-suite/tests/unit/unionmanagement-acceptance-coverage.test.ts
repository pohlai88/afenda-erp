import { describe, expect, it } from "vitest";

import {
  HR_INDUSTRY_UCB_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_INDUSTRY_UCB_REQUIREMENT_COVERAGE,
  assertHrIndustryUcbEnterpriseCoverage,
} from "../../src/industry-specific/union-management/data/hr.industry.ucb-coverage.shared";
import { hrIndustryUcbAuditActions } from "../../src/industry-specific/union-management/events/hr.industry.ucb.event";

describe("HRM-UCB-001..030 coverage registry", () => {
  it("registers all thirty requirements as shipped", () => {
    assertHrIndustryUcbEnterpriseCoverage();

    expect(HR_INDUSTRY_UCB_REQUIREMENT_COVERAGE).toHaveLength(30);
    expect(HR_INDUSTRY_UCB_REQUIREMENT_COVERAGE.map((entry) => entry.code))
      .toEqual(
        Array.from({ length: 30 }, (_, index) =>
          `HRM-UCB-${String(index + 1).padStart(3, "0")}`,
        ),
      );
    expect(
      HR_INDUSTRY_UCB_REQUIREMENT_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });

  it("maps all twenty-five enterprise acceptance criteria", () => {
    expect(HR_INDUSTRY_UCB_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(25);
    expect(
      HR_INDUSTRY_UCB_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });

  it("declares audit actions for labor-relations workflows", () => {
    expect(Object.values(hrIndustryUcbAuditActions)).toEqual(
      expect.arrayContaining([
        "hr.industry.ucb.union.created",
        "hr.industry.ucb.membership.updated",
        "hr.industry.ucb.bargaining_unit.assigned",
        "hr.industry.ucb.cba.created",
        "hr.industry.ucb.cba.rule_changed",
        "hr.industry.ucb.grievance.created",
        "hr.industry.ucb.grievance.step_advanced",
        "hr.industry.ucb.dispute.escalated",
        "hr.industry.ucb.seniority.updated",
        "hr.industry.ucb.dues_reference.approved",
        "hr.industry.ucb.dues_reference.exposed",
        "hr.industry.ucb.cba.renewal_tracked",
        "hr.industry.ucb.report.exported",
        "hr.industry.ucb.restricted_access.recorded",
      ]),
    );
  });
});
