/** HRM-EXP-002 — catalog for policy configuration and claim surfaces. */
export const HRM_EXP_CLAIM_CATEGORIES = [
  "travel",
  "meals",
  "accommodation",
  "transport",
  "fuel",
  "parking",
  "tolls",
  "office_supplies",
  "medical",
  "training",
] as const;

export type HrExpenseClaimCategory = (typeof HRM_EXP_CLAIM_CATEGORIES)[number];

export type HrExpensePolicyCategoryRuleRow = {
  category: HrExpenseClaimCategory;
  mandatoryReceipt: boolean;
  perClaimLimitCents: number | null;
  dailyLimitCents: number | null;
  monthlyLimitCents: number | null;
};

export type HrExpensePolicyHeaderRow = {
  policyGroupCode: string;
  maxClaimAmountCents: number | null;
  categoryRules: readonly HrExpensePolicyCategoryRuleRow[];
};

export type HrExpenseEligibilityRuleRow = {
  id: string;
  policyGroupCode: string;
  category: HrExpenseClaimCategory | null;
  legalEntityCode: string | null;
  workLocationCode: string | null;
  departmentId: string | null;
  grade: string | null;
  employmentType: string | null;
  employeeCategory: string | null;
  eligible: boolean;
  requiresExceptionApproval: boolean;
  effectiveFrom: Date;
  effectiveTo: Date | null;
};

export type HrExpenseEligibilityContext = {
  category: HrExpenseClaimCategory;
  legalEntityCode: string | null;
  workLocationCode: string | null;
  departmentId: string | null;
  grade: string | null;
  employmentType: string | null;
  employeeCategory: string | null;
  asOf: Date;
};

export type HrExpenseEligibilityResult = {
  eligible: boolean;
  requiresExceptionApproval: boolean;
  matchedRuleId: string | null;
  reason: string;
};

export type HrExpenseClaimPolicyInput = {
  policy: HrExpensePolicyHeaderRow | null;
  claim: {
    category: HrExpenseClaimCategory;
    amountCents: number;
    expenseDate: Date;
    receiptCount: number;
  };
  employeePeriodTotals: {
    dailyCategoryTotalCents: number;
    monthlyCategoryTotalCents: number;
  };
};

export type HrExpensePolicyViolationCode =
  | "policy_not_found"
  | "missing_mandatory_receipt"
  | "per_claim_limit_exceeded"
  | "daily_limit_exceeded"
  | "monthly_limit_exceeded"
  | "max_claim_amount_exceeded";

export type HrExpensePolicyValidationResult = {
  valid: boolean;
  violations: Array<{
    code: HrExpensePolicyViolationCode;
    message: string;
  }>;
};

export type HrExpenseDuplicateCandidateRow = {
  claimId: string;
  claimReference: string | null;
  status: string;
  expenseDate: Date;
  amountCents: number;
  merchantName: string | null;
  receiptFingerprints: readonly string[];
};

export type HrExpenseDuplicateMatchKind =
  | "receipt_fingerprint"
  | "amount_date_merchant"
  | "claim_reference";

export type HrExpenseDuplicateMatch = {
  kind: HrExpenseDuplicateMatchKind;
  matchedClaimId: string;
  message: string;
};

export type HrExpenseDuplicateDetectionResult = {
  isDuplicate: boolean;
  matches: readonly HrExpenseDuplicateMatch[];
};

export function expenseRuleSpecificityScore(
  rule: HrExpenseEligibilityRuleRow,
): number {
  let score = 0;
  if (rule.legalEntityCode) score += 128;
  if (rule.workLocationCode) score += 64;
  if (rule.departmentId) score += 32;
  if (rule.grade) score += 16;
  if (rule.employmentType) score += 8;
  if (rule.employeeCategory) score += 4;
  if (rule.category) score += 2;
  return score;
}

export function expenseMatchesEligibilityRule(
  rule: HrExpenseEligibilityRuleRow,
  context: HrExpenseEligibilityContext,
): boolean {
  if (rule.effectiveFrom.getTime() > context.asOf.getTime()) {
    return false;
  }
  if (rule.effectiveTo && rule.effectiveTo.getTime() < context.asOf.getTime()) {
    return false;
  }
  if (rule.category && rule.category !== context.category) {
    return false;
  }
  if (
    rule.legalEntityCode &&
    rule.legalEntityCode !== context.legalEntityCode
  ) {
    return false;
  }
  if (
    rule.workLocationCode &&
    rule.workLocationCode !== context.workLocationCode
  ) {
    return false;
  }
  if (rule.departmentId && rule.departmentId !== context.departmentId) {
    return false;
  }
  if (rule.grade && rule.grade !== context.grade) {
    return false;
  }
  if (rule.employmentType && rule.employmentType !== context.employmentType) {
    return false;
  }
  if (
    rule.employeeCategory &&
    rule.employeeCategory !== context.employeeCategory
  ) {
    return false;
  }
  return true;
}

/** HRM-EXP-007 — resolve best matching eligibility rule for a claim context. */
export function resolveExpenseEligibilityFromRules(input: {
  rules: readonly HrExpenseEligibilityRuleRow[];
  context: HrExpenseEligibilityContext;
}): HrExpenseEligibilityResult {
  const matching = input.rules
    .filter((rule) => expenseMatchesEligibilityRule(rule, input.context))
    .sort(
      (a, b) => expenseRuleSpecificityScore(b) - expenseRuleSpecificityScore(a),
    );

  const best = matching[0];
  if (!best) {
    return {
      eligible: false,
      requiresExceptionApproval: true,
      matchedRuleId: null,
      reason: "No matching expense eligibility rule",
    };
  }

  if (!best.eligible) {
    return {
      eligible: false,
      requiresExceptionApproval: best.requiresExceptionApproval,
      matchedRuleId: best.id,
      reason: "Employee matched an ineligible expense rule",
    };
  }

  return {
    eligible: true,
    requiresExceptionApproval: best.requiresExceptionApproval,
    matchedRuleId: best.id,
    reason: "Employee matched eligible expense rule",
  };
}

export function resolveExpenseEligibilityForSubmit(input: {
  result: HrExpenseEligibilityResult;
  eligibilityExceptionReason?: string | null;
}): HrExpenseEligibilityResult {
  if (input.result.eligible) {
    return input.result;
  }
  if (
    input.result.requiresExceptionApproval &&
    input.eligibilityExceptionReason?.trim()
  ) {
    return {
      ...input.result,
      eligible: true,
      reason: "Authorized expense eligibility override",
    };
  }
  return input.result;
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function isSameUtcDay(a: Date, b: Date): boolean {
  return startOfUtcDay(a).getTime() === startOfUtcDay(b).getTime();
}

function isSameUtcMonth(a: Date, b: Date): boolean {
  return startOfUtcMonth(a).getTime() === startOfUtcMonth(b).getTime();
}

function findCategoryRule(
  policy: HrExpensePolicyHeaderRow,
  category: HrExpenseClaimCategory,
): HrExpensePolicyCategoryRuleRow | null {
  return policy.categoryRules.find((rule) => rule.category === category) ?? null;
}

/** HRM-EXP-004/006/008 — validate claim against configured policy limits and receipt rules. */
export function validateClaimPolicy(
  input: HrExpenseClaimPolicyInput,
): HrExpensePolicyValidationResult {
  const violations: HrExpensePolicyValidationResult["violations"] = [];

  if (!input.policy) {
    violations.push({
      code: "policy_not_found",
      message: "No active expense policy configured for this policy group",
    });
    return { valid: false, violations };
  }

  const categoryRule = findCategoryRule(input.policy, input.claim.category);

  if (categoryRule?.mandatoryReceipt && input.claim.receiptCount < 1) {
    violations.push({
      code: "missing_mandatory_receipt",
      message: `Receipt is required for ${input.claim.category} expenses`,
    });
  }

  if (
    input.policy.maxClaimAmountCents !== null &&
    input.claim.amountCents > input.policy.maxClaimAmountCents
  ) {
    violations.push({
      code: "max_claim_amount_exceeded",
      message: "Claim amount exceeds policy maximum per claim",
    });
  }

  if (
    categoryRule &&
    categoryRule.perClaimLimitCents !== null &&
    categoryRule.perClaimLimitCents !== undefined &&
    input.claim.amountCents > categoryRule.perClaimLimitCents
  ) {
    violations.push({
      code: "per_claim_limit_exceeded",
      message: `Claim amount exceeds per-claim limit for ${input.claim.category}`,
    });
  }

  const projectedDailyTotal =
    input.employeePeriodTotals.dailyCategoryTotalCents +
    input.claim.amountCents;
  if (
    categoryRule &&
    categoryRule.dailyLimitCents !== null &&
    categoryRule.dailyLimitCents !== undefined &&
    projectedDailyTotal > categoryRule.dailyLimitCents
  ) {
    violations.push({
      code: "daily_limit_exceeded",
      message: `Daily limit exceeded for ${input.claim.category} on this expense date`,
    });
  }

  const projectedMonthlyTotal =
    input.employeePeriodTotals.monthlyCategoryTotalCents +
    input.claim.amountCents;
  if (
    categoryRule &&
    categoryRule.monthlyLimitCents !== null &&
    categoryRule.monthlyLimitCents !== undefined &&
    projectedMonthlyTotal > categoryRule.monthlyLimitCents
  ) {
    violations.push({
      code: "monthly_limit_exceeded",
      message: `Monthly limit exceeded for ${input.claim.category}`,
    });
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/** HRM-EXP-007 — alias for eligibility resolution used by feature services. */
export function validateEligibility(input: {
  rules: readonly HrExpenseEligibilityRuleRow[];
  context: HrExpenseEligibilityContext;
  eligibilityExceptionReason?: string | null;
}): HrExpenseEligibilityResult {
  const resolved = resolveExpenseEligibilityFromRules({
    rules: input.rules,
    context: input.context,
  });
  return resolveExpenseEligibilityForSubmit({
    result: resolved,
    eligibilityExceptionReason: input.eligibilityExceptionReason,
  });
}

export function buildExpenseReceiptFingerprint(input: {
  blobUrl: string;
  blobEtag?: string | null;
  pathname?: string | null;
}): string {
  const etag = input.blobEtag?.trim();
  if (etag) {
    return `etag:${etag}`;
  }
  const pathname = input.pathname?.trim();
  if (pathname) {
    return `path:${pathname}`;
  }
  return `url:${input.blobUrl.trim()}`;
}

function normalizeMerchant(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed.toLowerCase() : null;
}

/** HRM-EXP-009 — flag potential duplicate claims for review. */
export function detectDuplicateClaims(input: {
  claimId: string;
  claimReference: string | null;
  expenseDate: Date;
  amountCents: number;
  merchantName: string | null;
  receiptFingerprints: readonly string[];
  candidates: readonly HrExpenseDuplicateCandidateRow[];
  excludeStatuses?: readonly string[];
}): HrExpenseDuplicateDetectionResult {
  const excluded = new Set(input.excludeStatuses ?? ["cancelled", "rejected"]);
  const normalizedMerchant = normalizeMerchant(input.merchantName);
  const fingerprintSet = new Set(
    input.receiptFingerprints.map((value) => value.trim()).filter(Boolean),
  );
  const normalizedReference = input.claimReference?.trim().toLowerCase() ?? null;

  const matches: HrExpenseDuplicateMatch[] = [];

  for (const candidate of input.candidates) {
    if (candidate.claimId === input.claimId) {
      continue;
    }
    if (excluded.has(candidate.status)) {
      continue;
    }

    if (
      normalizedReference &&
      candidate.claimReference?.trim().toLowerCase() === normalizedReference
    ) {
      matches.push({
        kind: "claim_reference",
        matchedClaimId: candidate.claimId,
        message: "Another claim shares the same claim reference",
      });
      continue;
    }

    for (const fingerprint of candidate.receiptFingerprints) {
      if (fingerprintSet.has(fingerprint.trim())) {
        matches.push({
          kind: "receipt_fingerprint",
          matchedClaimId: candidate.claimId,
          message: "Receipt fingerprint matches another claim",
        });
        break;
      }
    }

    if (
      candidate.amountCents === input.amountCents &&
      isSameUtcDay(candidate.expenseDate, input.expenseDate) &&
      normalizeMerchant(candidate.merchantName) === normalizedMerchant &&
      normalizedMerchant
    ) {
      matches.push({
        kind: "amount_date_merchant",
        matchedClaimId: candidate.claimId,
        message:
          "Another claim has the same amount, expense date, and merchant",
      });
    }
  }

  return {
    isDuplicate: matches.length > 0,
    matches,
  };
}

export function sumExpenseClaimsForPeriod(input: {
  claims: readonly {
    claimId: string;
    category: HrExpenseClaimCategory;
    amountCents: number;
    expenseDate: Date;
    status: string;
  }[];
  category: HrExpenseClaimCategory;
  expenseDate: Date;
  excludeClaimId?: string;
  excludeStatuses?: readonly string[];
}): { dailyCategoryTotalCents: number; monthlyCategoryTotalCents: number } {
  const excluded = new Set(input.excludeStatuses ?? ["cancelled", "rejected"]);
  let dailyCategoryTotalCents = 0;
  let monthlyCategoryTotalCents = 0;

  for (const claim of input.claims) {
    if (input.excludeClaimId && claim.claimId === input.excludeClaimId) {
      continue;
    }
    if (claim.category !== input.category) {
      continue;
    }
    if (excluded.has(claim.status)) {
      continue;
    }
    if (isSameUtcDay(claim.expenseDate, input.expenseDate)) {
      dailyCategoryTotalCents += claim.amountCents;
    }
    if (isSameUtcMonth(claim.expenseDate, input.expenseDate)) {
      monthlyCategoryTotalCents += claim.amountCents;
    }
  }

  return { dailyCategoryTotalCents, monthlyCategoryTotalCents };
}
