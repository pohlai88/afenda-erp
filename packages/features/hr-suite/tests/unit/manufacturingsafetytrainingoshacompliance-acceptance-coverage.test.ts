import { describe, expect, it } from "vitest";

import {
  HR_INDUSTRY_MSC_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_INDUSTRY_MSC_REQUIREMENT_COVERAGE,
  assertHrIndustryMscEnterpriseCoverage,
} from "../../src/industry-specific/manufacturing-safety-training-osha-compliance/data/hr.industry.msc-coverage.shared";
import { hrIndustryMscAuditActions } from "../../src/industry-specific/manufacturing-safety-training-osha-compliance/events/hr.industry.msc.event";

describe("HRM-MSC-001..031 coverage registry", () => {
  it("registers all thirty-one requirements as shipped", () => {
    assertHrIndustryMscEnterpriseCoverage();

    expect(HR_INDUSTRY_MSC_REQUIREMENT_COVERAGE).toHaveLength(31);
    expect(HR_INDUSTRY_MSC_REQUIREMENT_COVERAGE.map((entry) => entry.code))
      .toEqual(
        Array.from({ length: 31 }, (_, index) =>
          `HRM-MSC-${String(index + 1).padStart(3, "0")}`,
        ),
      );
    expect(
      HR_INDUSTRY_MSC_REQUIREMENT_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });

  it("maps all twenty-eight enterprise acceptance criteria", () => {
    expect(HR_INDUSTRY_MSC_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(28);
    expect(
      HR_INDUSTRY_MSC_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });

  it("declares audit actions for all controlled safety actions", () => {
    expect(Object.values(hrIndustryMscAuditActions)).toEqual(
      expect.arrayContaining([
        "hr.msc.requirement.configured",
        "hr.msc.training.assigned",
        "hr.msc.training.completed",
        "hr.msc.ppe.acknowledged",
        "hr.msc.certificate.renewed",
        "hr.msc.incident.reported",
        "hr.msc.osha-recordkeeping.referenced",
        "hr.msc.corrective-action.assigned",
        "hr.msc.work-restriction.applied",
        "hr.msc.integration.exposed",
      ]),
    );
  });
});
