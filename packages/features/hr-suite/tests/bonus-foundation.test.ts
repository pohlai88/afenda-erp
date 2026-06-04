import { describe, expect, it } from "vitest";

import {
  appliesBonusEligibilityRuleToEmployee,
  buildBonusTargetScopeKey,
  isEmployeeEligibleForBonusPlan,
} from "@afenda/db";

import {
  BONUS_FOUNDATION_REQUIREMENT_COVERAGE,
  BONUS_REQUIREMENT_COVERAGE,
} from "./hr.payroll.bonus-acceptance-coverage.shared";

const BON_001_006_CODES = [
  "HRM-BON-001",
  "HRM-BON-002",
  "HRM-BON-003",
  "HRM-BON-004",
  "HRM-BON-005",
  "HRM-BON-006",
] as const;

describe("BON-001..006 acceptance coverage matrix", () => {
  it("marks BON-001 through BON-006 as shipped", () => {
    const slice = BONUS_REQUIREMENT_COVERAGE.filter((entry) =>
      (BON_001_006_CODES as readonly string[]).includes(entry.code),
    );
    expect(slice.map((entry) => entry.code)).toEqual([...BON_001_006_CODES]);
    for (const entry of slice) {
      expect(entry.status).toBe("shipped");
      expect(entry.evidence.length).toBeGreaterThan(0);
    }
  });

  it("documents foundation coverage separately", () => {
    expect(BONUS_FOUNDATION_REQUIREMENT_COVERAGE).toHaveLength(6);
  });
});

describe("bonus eligibility scope matching", () => {
  it("matches employee when rule scope is empty", () => {
    expect(
      isEmployeeEligibleForBonusPlan({
        rules: [{ legalEntityCode: null, departmentId: null, grade: null, jobRole: null, employmentType: null, minTenureMonths: null, maxTenureMonths: null, performanceRating: null, salesTeamCode: null, employeeStatus: null }],
        employee: {
          legalEntityCode: "US01",
          departmentId: "dept-1",
          grade: "G5",
          jobRole: "AE",
          employmentType: "full_time",
          employmentStatus: "active",
          performanceRating: null,
          salesTeamCode: null,
          tenureMonths: 24,
        },
      }),
    ).toBe(true);
  });

  it("flags ineligible employee when grade does not match", () => {
    const rule = {
      legalEntityCode: null,
      departmentId: null,
      grade: "G7",
      jobRole: null,
      employmentType: null,
      minTenureMonths: null,
      maxTenureMonths: null,
      performanceRating: null,
      salesTeamCode: null,
      employeeStatus: null,
    };
    const employee = {
      legalEntityCode: "US01",
      departmentId: "dept-1",
      grade: "G5",
      jobRole: "AE",
      employmentType: "full_time",
      employmentStatus: "active",
      performanceRating: null,
      salesTeamCode: null,
      tenureMonths: 24,
    };
    expect(appliesBonusEligibilityRuleToEmployee(rule, employee)).toBe(false);
    expect(isEmployeeEligibleForBonusPlan({ rules: [rule], employee })).toBe(false);
  });
});

describe("bonus target scope keys", () => {
  it("builds individual and company scope keys", () => {
    expect(
      buildBonusTargetScopeKey({
        targetKind: "individual",
        employeeId: "emp-1",
      }),
    ).toBe("employee:emp-1");
    expect(
      buildBonusTargetScopeKey({
        targetKind: "company",
        label: "FY26",
      }),
    ).toBe("company:FY26");
  });
});
