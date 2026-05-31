import {
  detectHrExpenseDuplicateClaims,
  listHrExpenseEligibilityRules,
  loadHrExpensePolicyHeader,
  validateHrExpenseClaimPolicy,
  validateHrExpenseEligibilityForClaim,
  type HrExpenseClaimCategory,
  type HrExpenseDuplicateDetectionResult,
  type HrExpenseEligibilityResult,
  type HrExpensePolicyValidationResult,
} from "@afenda/db";

export async function loadHrPayrollExpensePolicyHeader(input: {
  organizationId: string;
  policyGroupCode?: string;
}) {
  return loadHrExpensePolicyHeader(input);
}

export async function listHrPayrollExpenseEligibilityRules(input: {
  organizationId: string;
  policyGroupCode?: string;
}) {
  return listHrExpenseEligibilityRules(input);
}

/** HRM-EXP-006 — tenant-scoped policy validation for a claim. */
export async function validateHrPayrollExpenseClaimPolicy(input: {
  organizationId: string;
  employeeId: string;
  claimId: string;
  policyGroupCode?: string;
}): Promise<HrExpensePolicyValidationResult> {
  return validateHrExpenseClaimPolicy(input);
}

/** HRM-EXP-007 — tenant-scoped eligibility validation. */
export async function validateHrPayrollExpenseEligibility(input: {
  organizationId: string;
  employeeId: string;
  category: HrExpenseClaimCategory;
  policyGroupCode?: string;
  asOf?: Date;
  eligibilityExceptionReason?: string | null;
}): Promise<HrExpenseEligibilityResult> {
  return validateHrExpenseEligibilityForClaim(input);
}

/** HRM-EXP-009 — tenant-scoped duplicate detection. */
export async function detectHrPayrollExpenseDuplicateClaims(input: {
  organizationId: string;
  claimId: string;
}): Promise<HrExpenseDuplicateDetectionResult> {
  return detectHrExpenseDuplicateClaims(input);
}
