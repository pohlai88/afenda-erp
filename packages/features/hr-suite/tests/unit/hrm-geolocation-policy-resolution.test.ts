import { describe, expect, it } from "vitest";

import {
  matchesGeoEligibilityRule,
  resolveGeoEligibilityFromRules,
  ruleSpecificityScore,
  type HrGeoEligibilityRuleRow,
} from "@afenda/db";

describe("HRM-GEO policy resolution", () => {
  const baseRule = (
    overrides: Partial<HrGeoEligibilityRuleRow>,
  ): HrGeoEligibilityRuleRow => ({
    id: overrides.id ?? "rule-1",
    policyGroupCode: "default",
    legalEntityCode: null,
    countryCode: null,
    workLocationCode: null,
    departmentId: null,
    roleCode: null,
    grade: null,
    employmentType: null,
    employeeCategory: null,
    eligible: true,
    requiresExceptionApproval: false,
    effectiveFrom: new Date("2024-01-01T00:00:00.000Z"),
    effectiveTo: null,
    ...overrides,
  });

  it("prefers the most specific matching eligibility rule", () => {
    const rules = [
      baseRule({ id: "broad", eligible: true }),
      baseRule({
        id: "department",
        departmentId: "dept-1",
        eligible: false,
        requiresExceptionApproval: true,
      }),
      baseRule({ id: "legal", legalEntityCode: "LE-1", eligible: true }),
    ];

    const result = resolveGeoEligibilityFromRules({
      rules,
      context: {
        legalEntityCode: "LE-1",
        countryCode: "SG",
        workLocationCode: "HQ",
        departmentId: "dept-1",
        roleCode: "ENG",
        grade: "G5",
        employmentType: "permanent",
        employeeCategory: "staff",
        asOf: new Date("2025-06-01T00:00:00.000Z"),
      },
    });

    expect(result.matchedRuleId).toBe("department");
    expect(result.eligible).toBe(false);
    expect(result.requiresExceptionApproval).toBe(true);
  });

  it("scores scoped dimensions for stable priority ordering", () => {
    const departmentRule = baseRule({ departmentId: "dept-1" });
    const roleRule = baseRule({ roleCode: "ENG" });
    expect(ruleSpecificityScore(departmentRule)).toBeGreaterThan(
      ruleSpecificityScore(roleRule),
    );
    expect(
      matchesGeoEligibilityRule(departmentRule, {
        legalEntityCode: null,
        countryCode: null,
        workLocationCode: null,
        departmentId: "dept-1",
        roleCode: null,
        grade: null,
        employmentType: null,
        employeeCategory: null,
        asOf: new Date("2025-06-01T00:00:00.000Z"),
      }),
    ).toBe(true);
  });
});
