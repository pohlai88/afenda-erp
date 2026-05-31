import {
  detectDuplicateClaims as detectDuplicateClaimsFromDb,
  expenseMatchesEligibilityRule,
  expenseRuleSpecificityScore,
  resolveExpenseEligibilityFromRules,
  validateClaimPolicy as validateClaimPolicyFromDb,
  validateEligibility as validateEligibilityFromDb,
  type HrExpenseClaimCategory,
  type HrExpenseClaimPolicyInput,
  type HrExpenseDuplicateCandidateRow,
  type HrExpenseDuplicateDetectionResult,
  type HrExpenseEligibilityContext,
  type HrExpenseEligibilityResult,
  type HrExpenseEligibilityRuleRow,
  type HrExpensePolicyHeaderRow,
  type HrExpensePolicyValidationResult,
} from "@afenda/db";

/** HRM-EXP-006 — validate claim against configured expense policies. */
export function validateClaimPolicy(
  input: HrExpenseClaimPolicyInput,
): HrExpensePolicyValidationResult {
  return validateClaimPolicyFromDb(input);
}

/** HRM-EXP-007 — validate claim eligibility for employee profile dimensions. */
export function validateEligibility(input: {
  rules: readonly HrExpenseEligibilityRuleRow[];
  context: HrExpenseEligibilityContext;
  eligibilityExceptionReason?: string | null;
}): HrExpenseEligibilityResult {
  return validateEligibilityFromDb(input);
}

/** HRM-EXP-009 — detect duplicate claims for review. */
export function detectDuplicateClaims(input: {
  claimId: string;
  claimReference: string | null;
  expenseDate: Date;
  amountCents: number;
  merchantName: string | null;
  receiptFingerprints: readonly string[];
  candidates: readonly HrExpenseDuplicateCandidateRow[];
}): HrExpenseDuplicateDetectionResult {
  return detectDuplicateClaimsFromDb(input);
}

export {
  expenseMatchesEligibilityRule,
  expenseRuleSpecificityScore,
  resolveExpenseEligibilityFromRules,
};

export type {
  HrExpenseClaimCategory,
  HrExpenseClaimPolicyInput,
  HrExpenseDuplicateCandidateRow,
  HrExpenseDuplicateDetectionResult,
  HrExpenseEligibilityContext,
  HrExpenseEligibilityResult,
  HrExpenseEligibilityRuleRow,
  HrExpensePolicyHeaderRow,
  HrExpensePolicyValidationResult,
};
