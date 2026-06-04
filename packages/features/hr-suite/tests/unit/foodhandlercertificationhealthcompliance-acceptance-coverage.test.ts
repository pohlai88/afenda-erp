import { describe, expect, it } from "vitest";

import {
  HR_INDUSTRY_FHC_ACCEPTANCE_CRITERIA_COVERAGE,
  HR_INDUSTRY_FHC_REQUIREMENT_COVERAGE,
  assertHrIndustryFhcEnterpriseCoverage,
} from "../../src/industry-specific/food-handler-certification-health-compliance/hr.industry.fhc-coverage.shared";
import { hrIndustryFhcAuditActions } from "../../src/industry-specific/food-handler-certification-health-compliance/hr.industry.fhc.event";

describe("HRM-FHC-001..025 coverage registry", () => {
  it("registers all twenty-five requirements as shipped", () => {
    assertHrIndustryFhcEnterpriseCoverage();

    expect(HR_INDUSTRY_FHC_REQUIREMENT_COVERAGE).toHaveLength(25);
    expect(HR_INDUSTRY_FHC_REQUIREMENT_COVERAGE.map((entry) => entry.code))
      .toEqual(
        Array.from({ length: 25 }, (_, index) =>
          `HRM-FHC-${String(index + 1).padStart(3, "0")}`,
        ),
      );
  });

  it("maps all twenty-three enterprise acceptance criteria", () => {
    expect(HR_INDUSTRY_FHC_ACCEPTANCE_CRITERIA_COVERAGE).toHaveLength(23);
    expect(
      HR_INDUSTRY_FHC_ACCEPTANCE_CRITERIA_COVERAGE.every(
        (entry) => entry.status === "shipped" && entry.evidence.length > 0,
      ),
    ).toBe(true);
  });

  it("declares audit actions for all controlled compliance actions", () => {
    expect(Object.values(hrIndustryFhcAuditActions)).toEqual(
      expect.arrayContaining([
        "hr.fhc.requirement-rule.updated",
        "hr.fhc.permit.submitted",
        "hr.fhc.evidence.verified",
        "hr.fhc.evidence.rejected",
        "hr.fhc.permit.renewed",
        "hr.fhc.expiry-alert.generated",
        "hr.fhc.duty-restriction.applied",
        "hr.fhc.compliance.reviewed",
      ]),
    );
  });
});
