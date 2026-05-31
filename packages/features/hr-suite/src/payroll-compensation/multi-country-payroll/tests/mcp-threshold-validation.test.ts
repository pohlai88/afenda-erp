import { describe, expect, it } from "vitest";

import {
  assertPayrollThresholdsValid,
  evaluatePayrollThresholdViolations,
  resolveDefaultThresholdRules,
  validatePayrollThresholds,
} from "../data/hr.payroll.mcp-threshold-validation.shared";
import { HrMcpValidationError } from "../data/hr.payroll.mcp-statutory-readiness.shared";
import type { HrMcpThresholdValidationInput } from "../schemas/hr.payroll.mcp-validation.schema";

const baseInput: HrMcpThresholdValidationInput = {
  employeeId: "hr_emp_001",
  countryCode: "MY",
  currencyCode: "MYR",
  grossPay: 5000,
  contributablePay: 5000,
  taxablePay: 5000,
  rules: {
    minimumWage: 1500,
    statutoryCeiling: 6000,
    contributionThreshold: 6000,
    taxThreshold: null,
  },
};

describe("HRM-MCP-016 threshold validation", () => {
  it("passes when all pay amounts are within configured limits", () => {
    const result = validatePayrollThresholds(baseInput);

    expect(result.valid).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it("flags gross pay below minimum wage", () => {
    const result = validatePayrollThresholds({
      ...baseInput,
      grossPay: 1200,
    });

    expect(result.valid).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain("below_minimum_wage");
  });

  it("flags contributable pay above statutory ceiling", () => {
    const result = validatePayrollThresholds({
      ...baseInput,
      contributablePay: 7000,
    });

    expect(result.valid).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain("above_statutory_ceiling");
  });

  it("flags contributable pay above contribution threshold", () => {
    const result = validatePayrollThresholds({
      ...baseInput,
      contributablePay: 6500,
      rules: {
        ...baseInput.rules,
        statutoryCeiling: null,
      },
    });

    expect(result.valid).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain(
      "contribution_threshold_exceeded",
    );
  });

  it("flags taxable pay above tax threshold", () => {
    const result = validatePayrollThresholds({
      ...baseInput,
      countryCode: "SG",
      currencyCode: "SGD",
      taxablePay: 25000,
      rules: {
        minimumWage: null,
        statutoryCeiling: 8000,
        contributionThreshold: 8000,
        taxThreshold: 22000,
      },
    });

    expect(result.valid).toBe(false);
    expect(result.violations.map((v) => v.code)).toContain("tax_threshold_exceeded");
  });

  it("can return multiple violations in one evaluation", () => {
    const violations = evaluatePayrollThresholdViolations({
      grossPay: 1000,
      contributablePay: 7000,
      taxablePay: 30000,
      rules: {
        minimumWage: 1500,
        statutoryCeiling: 6000,
        contributionThreshold: 6000,
        taxThreshold: 22000,
      },
    });

    expect(violations.length).toBeGreaterThanOrEqual(3);
  });

  it("assertPayrollThresholdsValid throws on violations", () => {
    expect(() =>
      assertPayrollThresholdsValid({
        ...baseInput,
        grossPay: 1000,
      }),
    ).toThrow(HrMcpValidationError);
  });

  it("throws on invalid input", () => {
    expect(() =>
      validatePayrollThresholds({
        ...baseInput,
        grossPay: Number.NaN,
      }),
    ).toThrow(HrMcpValidationError);
  });

  it("resolveDefaultThresholdRules returns country stubs", () => {
    expect(resolveDefaultThresholdRules("MY").minimumWage).toBe(1500);
    expect(resolveDefaultThresholdRules("SG").taxThreshold).toBe(22000);
    expect(resolveDefaultThresholdRules("GB").minimumWage).toBe(2300);
  });
});
