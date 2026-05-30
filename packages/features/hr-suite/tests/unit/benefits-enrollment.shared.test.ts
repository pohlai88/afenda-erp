import { describe, expect, it } from "vitest";

import {
  HR_BENEFIT_COVERAGE_LEVELS,
  assertBenefitCoverageDatesValid,
  assertCoverageLevelAllowedForPlan,
  isEmployeeEligibleForBenefitPlan,
  resolveEnrollmentContributionRows,
  validateEnrollmentDependents,
} from "@afenda/db";

describe("benefits enrollment guard (HRM-BEN-004 / acceptance #5)", () => {
  it("treats employees as eligible when no rules are configured", () => {
    expect(
      isEmployeeEligibleForBenefitPlan({
        rules: [],
        employee: {
          countryCode: "US",
          legalEntityCode: null,
          workLocationCode: null,
          employmentType: null,
          workerCategory: null,
          grade: null,
          level: null,
          tenureMonths: 12,
        },
      }),
    ).toBe(true);
  });

  it("blocks ineligible scope unless override is supplied at mutation boundary", () => {
    expect(
      isEmployeeEligibleForBenefitPlan({
        rules: [
          {
            countryCode: "SG",
            legalEntityCode: null,
            workLocationCode: null,
            employmentType: null,
            workerCategory: null,
            grade: null,
            level: null,
            minTenureMonths: null,
            maxTenureMonths: null,
          },
        ],
        employee: {
          countryCode: "US",
          legalEntityCode: null,
          workLocationCode: null,
          employmentType: null,
          workerCategory: null,
          grade: null,
          level: null,
          tenureMonths: 12,
        },
      }),
    ).toBe(false);
  });
});

describe("benefits coverage level enum (HRM-BEN-011)", () => {
  it("includes employee, spouse, children, and family tiers", () => {
    expect(HR_BENEFIT_COVERAGE_LEVELS).toEqual([
      "employee_only",
      "employee_spouse",
      "employee_children",
      "family",
    ]);
  });

  it("rejects dependent coverage when the plan disallows dependents", () => {
    expect(() =>
      assertCoverageLevelAllowedForPlan({
        allowsDependents: false,
        coverageLevel: "family",
      }),
    ).toThrow("coverage_level_not_allowed");
  });

  it("rejects dependents on employee-only coverage", () => {
    expect(() =>
      validateEnrollmentDependents({
        coverageLevel: "employee_only",
        dependents: [
          {
            dependentName: "Alex",
            relationship: "child",
            coverageStartDate: new Date("2026-01-01"),
          },
        ],
      }),
    ).toThrow("dependents_not_allowed");
  });
});

describe("benefits contribution storage (HRM-BEN-013 / HRM-BEN-014)", () => {
  it("stores employer and employee contribution rows from plan amounts", () => {
    const rows = resolveEnrollmentContributionRows({
      organizationId: "org_test",
      enrollmentId: "enr_test",
      currencyCode: "USD",
      employerContributionAmount: "250.00",
      employeeContributionAmount: "75.50",
      effectiveFrom: new Date("2026-01-01"),
    });

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ payer: "employer", amount: "250.00" });
    expect(rows[1]).toMatchObject({ payer: "employee", amount: "75.50" });
  });

  it("validates coverage end date ordering (HRM-BEN-012)", () => {
    expect(() =>
      assertBenefitCoverageDatesValid({
        coverageStartDate: new Date("2026-06-01"),
        coverageEndDate: new Date("2026-01-01"),
      }),
    ).toThrow("coverage_dates_invalid");
  });
});
