import { describe, expect, it } from "vitest";

import {
  HR_INDUSTRY_RWS_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_INDUSTRY_RWS_REQUIREMENT_COVERAGE,
  assertHrIndustryRwsEnterpriseCoverage,
} from "../../src/industry-specific/retail-seasonal-hourly-workforce-scheduling/data/hr.industry.rws-coverage.shared";
import { hrIndustryRwsAuditActions } from "../../src/industry-specific/retail-seasonal-hourly-workforce-scheduling/events/hr.industry.rws.event";

describe("HRM-RWS-001..034 coverage registry", () => {
  it("registers all thirty-four requirements as shipped", () => {
    assertHrIndustryRwsEnterpriseCoverage();

    expect(HR_INDUSTRY_RWS_REQUIREMENT_COVERAGE).toHaveLength(34);
    expect(HR_INDUSTRY_RWS_REQUIREMENT_COVERAGE.map((entry) => entry.code))
      .toEqual(
        Array.from({ length: 34 }, (_, index) =>
          `HRM-RWS-${String(index + 1).padStart(3, "0")}`,
        ),
      );
    expect(
      HR_INDUSTRY_RWS_REQUIREMENT_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });

  it("maps all thirty-four enterprise acceptance criteria", () => {
    expect(HR_INDUSTRY_RWS_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(34);
    expect(
      HR_INDUSTRY_RWS_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });

  it("declares audit actions for controlled scheduling workflows", () => {
    expect(Object.values(hrIndustryRwsAuditActions)).toEqual(
      expect.arrayContaining([
        "hr.industry.rws.schedule.draft_created",
        "hr.industry.rws.schedule.published",
        "hr.industry.rws.assignment.changed",
        "hr.industry.rws.open_shift.created",
        "hr.industry.rws.open_shift.claimed",
        "hr.industry.rws.swap.requested",
        "hr.industry.rws.swap.rejected",
        "hr.industry.rws.swap.overridden",
        "hr.industry.rws.budget.warning_raised",
        "hr.industry.rws.overtime_risk.flagged",
        "hr.industry.rws.compliance.flagged",
        "hr.industry.rws.notification.generated",
        "hr.industry.rws.attendance.compared",
        "hr.industry.rws.payroll_reference.exposed",
        "hr.industry.rws.integration.exposed",
        "hr.industry.rws.report.generated",
      ]),
    );
  });
});
