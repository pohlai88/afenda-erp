import { describe, expect, it } from "vitest";

import {
  assertBudgetPoolScopeFields,
  assertHrCompensationCycleStatusTransition,
  deriveBudgetPoolScopeRef,
  evaluateAllCompensationEligibilityRules,
  evaluateCompensationEligibility,
} from "@afenda/db";

import { hrCpmBudgetPoolSchema } from "../../src/payroll-compensation/compensation-planning-modeling/schemas/hr.payroll.cpm-mutation.schema";

const baseEmployee = {
  employmentType: "full_time",
  employmentStatus: "active",
  tenureDays: 400,
  grade: "G5",
  level: "L3",
  departmentId: "dept_1",
  legalEntityCode: "US01",
  performanceRating: 4,
};

describe("HRM-CPM-003 budget pool scope", () => {
  it("requires legalEntityCode for legal_entity scope", () => {
    expect(() =>
      assertBudgetPoolScopeFields({ scope: "legal_entity" }),
    ).toThrow(/legalEntityCode/);
  });

  it("derives scopeRef from departmentId", () => {
    expect(
      deriveBudgetPoolScopeRef({
        scope: "department",
        departmentId: "dept_1",
      }),
    ).toBe("dept_1");
  });

  it("validates department scope in mutation schema", () => {
    const result = hrCpmBudgetPoolSchema.safeParse({
      cycleId: "cycle_1",
      code: "POOL-DEPT",
      name: "Engineering pool",
      scope: "department",
      allocatedAmount: 50_000,
    });

    expect(result.success).toBe(false);
  });

  it("accepts manager_group scope with managerEmployeeId", () => {
    const result = hrCpmBudgetPoolSchema.safeParse({
      cycleId: "cycle_1",
      code: "POOL-MGR",
      name: "Manager group pool",
      scope: "manager_group",
      managerEmployeeId: "emp_mgr_1",
      allocatedAmount: 25_000,
    });

    expect(result.success).toBe(true);
  });
});

describe("HRM-CPM-001 cycle status transitions", () => {
  it("allows draft to planning", () => {
    expect(() =>
      assertHrCompensationCycleStatusTransition("draft", "planning"),
    ).not.toThrow();
  });

  it("blocks transitions from closed cycles", () => {
    expect(() =>
      assertHrCompensationCycleStatusTransition("closed", "planning"),
    ).toThrow(/closed/);
  });
});

describe("HRM-CPM-005 eligibility (strict dimensions)", () => {
  it("flags missing grade when rule restricts grades", () => {
    const result = evaluateCompensationEligibility(
      { ...baseEmployee, grade: null },
      { grades: ["G5"] },
    );
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/grade not specified/);
  });

  it("flags missing employment type when rule restricts types", () => {
    const result = evaluateCompensationEligibility(
      { ...baseEmployee, employmentType: null },
      { employmentTypes: ["full_time"] },
    );
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/employment type not specified/);
  });

  it("flags performance rating below minimum", () => {
    const result = evaluateCompensationEligibility(
      { ...baseEmployee, performanceRating: 2 },
      { minPerformanceRating: 3 },
    );
    expect(result.eligible).toBe(false);
  });

  it("evaluates all active rules with AND semantics", () => {
    const result = evaluateAllCompensationEligibilityRules(baseEmployee, [
      { employmentStatuses: ["active"] },
      { grades: ["G5"] },
      { minPerformanceRating: 3 },
    ]);
    expect(result.eligible).toBe(true);
  });

  it("fails when any active rule fails", () => {
    const result = evaluateAllCompensationEligibilityRules(baseEmployee, [
      { employmentStatuses: ["active"] },
      { legalEntityCodes: ["UK01"] },
    ]);
    expect(result.eligible).toBe(false);
  });
});

describe("HRM-CPM-004/005 AC 3 and AC 4", () => {
  it("marks eligible employee when all rules pass", () => {
    const result = evaluateAllCompensationEligibilityRules(baseEmployee, [
      { employmentStatuses: ["active"], minTenureDays: 90 },
    ]);
    expect(result.eligible).toBe(true);
  });

  it("flags ineligible employee for exclusion", () => {
    const result = evaluateAllCompensationEligibilityRules(
      { ...baseEmployee, employmentStatus: "terminated" },
      [{ employmentStatuses: ["active"] }],
    );
    expect(result.eligible).toBe(false);
    expect(result.reason).toMatch(/not eligible/);
  });
});
