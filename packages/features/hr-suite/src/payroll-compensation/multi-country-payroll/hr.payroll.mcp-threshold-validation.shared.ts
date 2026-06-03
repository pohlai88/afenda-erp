import { formatNumeric } from "@afenda/db";

import { HrMcpValidationError } from "./hr.payroll.mcp-statutory-readiness.shared";
import {
  HR_MCP_THRESHOLD_VIOLATION_CODES,
  hrMcpThresholdValidationInputSchema,
  type HrMcpThresholdRuleSnapshot,
  type HrMcpThresholdValidationInput,
  type HrMcpThresholdValidationResult,
  type HrMcpThresholdViolation,
} from "./hr.payroll.mcp-validation.schema";

export { HR_MCP_THRESHOLD_VIOLATION_CODES };

function checkMinimumWage(
  grossPay: number,
  minimumWage: number | null,
): HrMcpThresholdViolation | null {
  if (minimumWage === null) {
    return null;
  }
  if (grossPay >= minimumWage) {
    return null;
  }
  return {
    code: "below_minimum_wage",
    message: `Gross pay ${formatNumeric(grossPay, 2)} is below minimum wage ${formatNumeric(minimumWage, 2)}.`,
    actualValue: grossPay,
    limitValue: minimumWage,
  };
}

function checkStatutoryCeiling(
  contributablePay: number,
  statutoryCeiling: number | null,
): HrMcpThresholdViolation | null {
  if (statutoryCeiling === null) {
    return null;
  }
  if (contributablePay <= statutoryCeiling) {
    return null;
  }
  return {
    code: "above_statutory_ceiling",
    message: `Contributable pay ${formatNumeric(contributablePay, 2)} exceeds statutory ceiling ${formatNumeric(statutoryCeiling, 2)}.`,
    actualValue: contributablePay,
    limitValue: statutoryCeiling,
  };
}

function checkContributionThreshold(
  contributablePay: number,
  contributionThreshold: number | null,
): HrMcpThresholdViolation | null {
  if (contributionThreshold === null) {
    return null;
  }
  if (contributablePay <= contributionThreshold) {
    return null;
  }
  return {
    code: "contribution_threshold_exceeded",
    message: `Contributable pay ${formatNumeric(contributablePay, 2)} exceeds contribution threshold ${formatNumeric(contributionThreshold, 2)}.`,
    actualValue: contributablePay,
    limitValue: contributionThreshold,
  };
}

function checkTaxThreshold(
  taxablePay: number,
  taxThreshold: number | null,
): HrMcpThresholdViolation | null {
  if (taxThreshold === null) {
    return null;
  }
  if (taxablePay <= taxThreshold) {
    return null;
  }
  return {
    code: "tax_threshold_exceeded",
    message: `Taxable pay ${formatNumeric(taxablePay, 2)} exceeds tax threshold ${formatNumeric(taxThreshold, 2)}.`,
    actualValue: taxablePay,
    limitValue: taxThreshold,
  };
}

/** MCP-016 — evaluate all applicable threshold rules for an employee pay slice. */
export function evaluatePayrollThresholdViolations(
  input: Pick<
    HrMcpThresholdValidationInput,
    "grossPay" | "contributablePay" | "taxablePay" | "rules"
  >,
): readonly HrMcpThresholdViolation[] {
  const { grossPay, contributablePay, taxablePay, rules } = input;
  return [
    checkMinimumWage(grossPay, rules.minimumWage),
    checkStatutoryCeiling(contributablePay, rules.statutoryCeiling),
    checkContributionThreshold(contributablePay, rules.contributionThreshold),
    checkTaxThreshold(taxablePay, rules.taxThreshold),
  ].filter((violation): violation is HrMcpThresholdViolation => violation !== null);
}

/** MCP-016 — validate minimum wage, ceilings, and contribution/tax thresholds. */
export function validatePayrollThresholds(
  rawInput: HrMcpThresholdValidationInput,
): HrMcpThresholdValidationResult {
  const parsed = hrMcpThresholdValidationInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new HrMcpValidationError(
      "invalid_threshold_input",
      parsed.error.issues.map((issue) => issue.message).join("; "),
    );
  }

  const input = parsed.data;
  const violations = evaluatePayrollThresholdViolations(input);

  return {
    employeeId: input.employeeId,
    countryCode: input.countryCode,
    valid: violations.length === 0,
    violations: [...violations],
  };
}

/** MCP-016 — assert thresholds; throws when any violation is present. */
export function assertPayrollThresholdsValid(
  input: HrMcpThresholdValidationInput,
): HrMcpThresholdValidationResult {
  const result = validatePayrollThresholds(input);
  if (!result.valid) {
    throw new HrMcpValidationError(
      "threshold_validation_failed",
      `Threshold validation failed for ${result.employeeId}: ${result.violations.map((v) => v.code).join(", ")}`,
    );
  }
  return result;
}

/** Country default threshold stubs (overridden by published rule config at runtime). */
export const HR_MCP_DEFAULT_THRESHOLD_RULES: Readonly<
  Record<string, HrMcpThresholdRuleSnapshot>
> = {
  MY: {
    minimumWage: 1500,
    statutoryCeiling: 6000,
    contributionThreshold: 6000,
    taxThreshold: null,
  },
  SG: {
    minimumWage: null,
    statutoryCeiling: 8000,
    contributionThreshold: 8000,
    taxThreshold: 22000,
  },
  GB: {
    minimumWage: 2300,
    statutoryCeiling: null,
    contributionThreshold: null,
    taxThreshold: 12570,
  },
};

export function resolveDefaultThresholdRules(
  countryCode: string,
): HrMcpThresholdRuleSnapshot {
  return (
    HR_MCP_DEFAULT_THRESHOLD_RULES[countryCode.toUpperCase()] ?? {
      minimumWage: null,
      statutoryCeiling: null,
      contributionThreshold: null,
      taxThreshold: null,
    }
  );
}

export { formatNumeric };
