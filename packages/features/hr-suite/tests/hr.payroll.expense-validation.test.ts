import { describe, expect, it } from "vitest";

import {
  detectDuplicateClaims,
  expenseMatchesEligibilityRule,
  expenseRuleSpecificityScore,
  resolveExpenseEligibilityFromRules,
  validateClaimPolicy,
  type HrExpenseEligibilityRuleRow,
  type HrExpensePolicyHeaderRow,
} from "./hr.payroll.expense-validation.shared";

const basePolicy = (
  overrides: Partial<HrExpensePolicyHeaderRow> = {},
): HrExpensePolicyHeaderRow => ({
  policyGroupCode: "default",
  maxClaimAmountCents: 50_000,
  categoryRules: [
    {
      category: "meals",
      mandatoryReceipt: true,
      perClaimLimitCents: 10_000,
      dailyLimitCents: 15_000,
      monthlyLimitCents: 40_000,
    },
  ],
  ...overrides,
});

const baseEligibilityRule = (
  overrides: Partial<HrExpenseEligibilityRuleRow> = {},
): HrExpenseEligibilityRuleRow => ({
  id: "rule-1",
  policyGroupCode: "default",
  category: "meals",
  legalEntityCode: null,
  workLocationCode: null,
  departmentId: null,
  grade: null,
  employmentType: null,
  employeeCategory: null,
  eligible: true,
  requiresExceptionApproval: false,
  effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  effectiveTo: null,
  ...overrides,
});

describe("HRM-EXP-004/006/008 validateClaimPolicy", () => {
  it("flags missing mandatory receipt for configured category", () => {
    const result = validateClaimPolicy({
      policy: basePolicy(),
      claim: {
        category: "meals",
        amountCents: 2_500,
        expenseDate: new Date("2026-05-20T00:00:00.000Z"),
        receiptCount: 0,
      },
      employeePeriodTotals: {
        dailyCategoryTotalCents: 0,
        monthlyCategoryTotalCents: 0,
      },
    });

    expect(result.valid).toBe(false);
    expect(result.violations.some((v) => v.code === "missing_mandatory_receipt")).toBe(
      true,
    );
  });

  it("enforces per-claim, daily, and monthly limits", () => {
    const result = validateClaimPolicy({
      policy: basePolicy(),
      claim: {
        category: "meals",
        amountCents: 12_000,
        expenseDate: new Date("2026-05-20T00:00:00.000Z"),
        receiptCount: 1,
      },
      employeePeriodTotals: {
        dailyCategoryTotalCents: 5_000,
        monthlyCategoryTotalCents: 35_000,
      },
    });

    expect(result.valid).toBe(false);
    expect(result.violations.map((v) => v.code)).toEqual(
      expect.arrayContaining([
        "per_claim_limit_exceeded",
        "daily_limit_exceeded",
        "monthly_limit_exceeded",
      ]),
    );
  });
});

describe("HRM-EXP-007 validateEligibility", () => {
  it("prefers department-scoped rules over generic rules", () => {
    const generic = baseEligibilityRule({ id: "generic", departmentId: null });
    const scoped = baseEligibilityRule({
      id: "scoped",
      departmentId: "dept-finance",
    });

    expect(expenseRuleSpecificityScore(scoped)).toBeGreaterThan(
      expenseRuleSpecificityScore(generic),
    );

    const result = resolveExpenseEligibilityFromRules({
      rules: [generic, scoped],
      context: {
        category: "meals",
        legalEntityCode: "MY-LE",
        workLocationCode: "KL-HQ",
        departmentId: "dept-finance",
        grade: "G5",
        employmentType: "permanent",
        employeeCategory: "staff",
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      },
    });

    expect(result.eligible).toBe(true);
    expect(result.matchedRuleId).toBe("scoped");
  });

  it("matches grade and employment type dimensions", () => {
    const rule = baseEligibilityRule({
      grade: "G5",
      employmentType: "permanent",
    });

    expect(
      expenseMatchesEligibilityRule(rule, {
        category: "meals",
        legalEntityCode: null,
        workLocationCode: null,
        departmentId: null,
        grade: "G5",
        employmentType: "permanent",
        employeeCategory: null,
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      }),
    ).toBe(true);

    expect(
      expenseMatchesEligibilityRule(rule, {
        category: "meals",
        legalEntityCode: null,
        workLocationCode: null,
        departmentId: null,
        grade: "G4",
        employmentType: "permanent",
        employeeCategory: null,
        asOf: new Date("2026-06-01T00:00:00.000Z"),
      }),
    ).toBe(false);
  });
});

describe("HRM-EXP-009 detectDuplicateClaims", () => {
  it("flags receipt fingerprint and amount/date/merchant duplicates", () => {
    const result = detectDuplicateClaims({
      claimId: "claim-new",
      claimReference: "EXP-1001",
      expenseDate: new Date("2026-05-18T00:00:00.000Z"),
      amountCents: 4_500,
      merchantName: "City Parking",
      receiptFingerprints: ["etag:abc123"],
      candidates: [
        {
          claimId: "claim-old-1",
          claimReference: "EXP-1000",
          status: "submitted",
          expenseDate: new Date("2026-05-18T00:00:00.000Z"),
          amountCents: 4_500,
          merchantName: "City Parking",
          receiptFingerprints: ["etag:abc123"],
        },
        {
          claimId: "claim-old-2",
          claimReference: "EXP-1001",
          status: "under_review",
          expenseDate: new Date("2026-05-10T00:00:00.000Z"),
          amountCents: 1_000,
          merchantName: "Other",
          receiptFingerprints: [],
        },
      ],
    });

    expect(result.isDuplicate).toBe(true);
    expect(result.matches.map((match) => match.kind)).toEqual(
      expect.arrayContaining([
        "receipt_fingerprint",
        "amount_date_merchant",
        "claim_reference",
      ]),
    );
  });
});
