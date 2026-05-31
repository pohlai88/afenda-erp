import { describe, expect, it } from "vitest";

import {
  applyCashAdvanceOffset,
  calculateMileageAmount,
  calculateReimbursementAmounts,
  calculateTravelLineAmount,
  convertForeignCurrencyAmount,
  createExchangeRateProvider,
  getExchangeRate,
  roundCurrencyAmount,
} from "../data/hr.payroll.expense-calculation.shared";
import {
  hrExpenseClaimCalculationInputSchema,
  hrExpenseForeignCurrencyLineItemSchema,
  hrExpenseMileageLineItemSchema,
  hrExpenseTravelLineItemSchema,
} from "../schemas/hr.payroll.expense-line-item.schema";

describe("HRM-EXP-012 mileage calculation (AC 10)", () => {
  it("calculates amount from distance and approved rate", () => {
    expect(
      calculateMileageAmount({
        distance: 120,
        ratePerUnit: 0.85,
      }),
    ).toBe(102);
  });

  it("prefers approved distance over submitted distance", () => {
    expect(
      calculateMileageAmount({
        distance: 120,
        approvedDistance: 100,
        ratePerUnit: 0.85,
      }),
    ).toBe(85);
  });

  it("returns zero for invalid distance or rate", () => {
    expect(
      calculateMileageAmount({
        distance: 0,
        ratePerUnit: 0.85,
      }),
    ).toBe(0);
  });

  it("validates mileage line schema", () => {
    const parsed = hrExpenseMileageLineItemSchema.safeParse({
      lineId: "line-mileage-1",
      description: "Client visit",
      expenseDate: "2026-05-20",
      decision: "approved",
      kind: "mileage",
      distance: 45.5,
      distanceUnit: "kilometer",
      ratePerUnit: 0.85,
      currencyCode: "MYR",
    });

    expect(parsed.success).toBe(true);
  });
});

describe("HRM-EXP-013 travel line calculation", () => {
  it("uses declared amount for non-per-diem travel components", () => {
    expect(
      calculateTravelLineAmount({
        lineId: "line-travel-1",
        description: "Flight to Singapore",
        expenseDate: "2026-05-18",
        decision: "approved",
        kind: "travel",
        component: "flight",
        currencyCode: "MYR",
        amount: 850,
      }),
    ).toBe(850);
  });

  it("calculates per diem from days and daily rate", () => {
    expect(
      calculateTravelLineAmount({
        lineId: "line-travel-2",
        description: "Regional trip per diem",
        expenseDate: "2026-05-19",
        decision: "approved",
        kind: "travel",
        component: "per_diem",
        currencyCode: "MYR",
        perDiemDays: 3,
        perDiemDailyRate: 120,
      }),
    ).toBe(360);
  });

  it("requires per diem fields in schema", () => {
    const invalid = hrExpenseTravelLineItemSchema.safeParse({
      lineId: "line-travel-3",
      description: "Missing per diem inputs",
      expenseDate: "2026-05-19",
      decision: "approved",
      kind: "travel",
      component: "per_diem",
      currencyCode: "MYR",
    });

    expect(invalid.success).toBe(false);
  });
});

describe("HRM-EXP-010/011 foreign currency conversion (AC 9)", () => {
  it("converts foreign currency using exchange rate reference", async () => {
    const reference = await getExchangeRate({
      fromCurrency: "USD",
      toCurrency: "MYR",
      rateDate: "2026-05-15",
    });

    expect(reference.rate).toBe(4.72);
    expect(convertForeignCurrencyAmount(100, reference)).toBe(472);
  });

  it("returns identity rate for matching currencies", async () => {
    const reference = await getExchangeRate({
      fromCurrency: "MYR",
      toCurrency: "MYR",
      rateDate: "2026-05-15",
    });

    expect(reference.rate).toBe(1);
    expect(convertForeignCurrencyAmount(250, reference)).toBe(250);
  });

  it("supports finance-configured provider injection", async () => {
    const provider = createExchangeRateProvider([
      {
        fromCurrency: "JPY",
        toCurrency: "MYR",
        rate: 0.03,
        effectiveFrom: "2026-01-01",
        source: "oracle_fusion",
      },
    ]);

    const reference = await getExchangeRate(
      {
        fromCurrency: "JPY",
        toCurrency: "MYR",
        rateDate: "2026-05-15",
      },
      provider,
    );

    expect(reference.source).toBe("oracle_fusion");
    expect(convertForeignCurrencyAmount(10_000, reference)).toBe(300);
  });

  it("validates foreign currency line schema", () => {
    const parsed = hrExpenseForeignCurrencyLineItemSchema.safeParse({
      lineId: "line-fx-1",
      description: "Hotel in Tokyo",
      expenseDate: "2026-05-12",
      decision: "approved",
      kind: "foreign_currency",
      foreignAmount: 120,
      foreignCurrencyCode: "USD",
      reimbursementCurrencyCode: "MYR",
    });

    expect(parsed.success).toBe(true);
  });
});

describe("HRM-EXP-014 cash advance offset (AC 11)", () => {
  it("offsets reimbursable amount up to outstanding advance balance", () => {
    expect(
      applyCashAdvanceOffset({
        reimbursableAmount: 500,
        cashAdvanceBalance: 300,
      }),
    ).toEqual({
      offsetAmount: 300,
      netPayableAmount: 200,
      remainingAdvanceBalance: 0,
      recoverableBalance: 0,
    });
  });

  it("caps offset at reimbursable amount when advance exceeds claim", () => {
    expect(
      applyCashAdvanceOffset({
        reimbursableAmount: 200,
        cashAdvanceBalance: 500,
      }),
    ).toEqual({
      offsetAmount: 200,
      netPayableAmount: 0,
      remainingAdvanceBalance: 300,
      recoverableBalance: 300,
    });
  });

  it("handles zero advance without offset", () => {
    expect(
      applyCashAdvanceOffset({
        reimbursableAmount: 150,
        cashAdvanceBalance: 0,
      }),
    ).toEqual({
      offsetAmount: 0,
      netPayableAmount: 150,
      remainingAdvanceBalance: 0,
      recoverableBalance: 0,
    });
  });
});

describe("HRM-EXP-015 reimbursement totals (AC 16)", () => {
  it("calculates approved, rejected, reimbursable, and offset amounts", async () => {
    const input = hrExpenseClaimCalculationInputSchema.parse({
      claimId: "claim-1",
      reimbursementCurrencyCode: "MYR",
      cashAdvanceBalance: 100,
      lineItems: [
        {
          lineId: "line-1",
          description: "Team lunch",
          expenseDate: "2026-05-10",
          decision: "approved",
          kind: "standard",
          amount: 80,
          currencyCode: "MYR",
        },
        {
          lineId: "line-2",
          description: "Rejected taxi",
          expenseDate: "2026-05-10",
          decision: "rejected",
          kind: "standard",
          amount: 40,
          currencyCode: "MYR",
        },
        {
          lineId: "line-3",
          description: "Pending hotel",
          expenseDate: "2026-05-11",
          decision: "pending",
          kind: "standard",
          amount: 200,
          currencyCode: "MYR",
        },
      ],
    });

    const result = await calculateReimbursementAmounts(input);

    expect(result.claimAmountTotal).toBe(320);
    expect(result.approvedAmount).toBe(80);
    expect(result.rejectedAmount).toBe(40);
    expect(result.pendingAmount).toBe(200);
    expect(result.reimbursableAmount).toBe(80);
    expect(result.offsetAmount).toBe(80);
    expect(result.netPayableAmount).toBe(0);
    expect(result.remainingAdvanceBalance).toBe(20);
  });

  it("combines mileage, travel, and foreign currency lines in one claim", async () => {
    const result = await calculateReimbursementAmounts(
      hrExpenseClaimCalculationInputSchema.parse({
        claimId: "claim-2",
        reimbursementCurrencyCode: "MYR",
        cashAdvanceBalance: 0,
        lineItems: [
          {
            lineId: "line-mileage",
            description: "Site visit mileage",
            expenseDate: "2026-05-14",
            decision: "approved",
            kind: "mileage",
            distance: 50,
            approvedDistance: 48,
            distanceUnit: "kilometer",
            ratePerUnit: 1,
            currencyCode: "MYR",
          },
          {
            lineId: "line-travel",
            description: "Per diem",
            expenseDate: "2026-05-14",
            decision: "approved",
            kind: "travel",
            component: "per_diem",
            currencyCode: "MYR",
            perDiemDays: 2,
            perDiemDailyRate: 100,
          },
          {
            lineId: "line-fx",
            description: "USD hotel converted to MYR",
            expenseDate: "2026-05-14",
            decision: "approved",
            kind: "foreign_currency",
            foreignAmount: 100,
            foreignCurrencyCode: "USD",
            reimbursementCurrencyCode: "MYR",
          },
        ],
      }),
    );

    expect(result.approvedAmount).toBe(48 + 200 + 472);
    expect(result.reimbursableAmount).toBe(720);
    expect(result.lineBreakdown).toHaveLength(3);
    expect(result.lineBreakdown[2]?.exchangeRateApplied).toBe(4.72);
  });

  it("rejects mixed-currency claims when line currency differs from claim currency", async () => {
    await expect(
      calculateReimbursementAmounts(
        hrExpenseClaimCalculationInputSchema.parse({
          claimId: "claim-3",
          reimbursementCurrencyCode: "MYR",
          lineItems: [
            {
              lineId: "line-usd",
              description: "USD expense on MYR claim",
              expenseDate: "2026-05-14",
              decision: "approved",
              kind: "standard",
              amount: 50,
              currencyCode: "USD",
            },
          ],
        }),
      ),
    ).rejects.toThrow(/does not match claim reimbursement currency/);
  });
});

describe("currency rounding edge cases", () => {
  it("rounds to two decimal places", () => {
    expect(roundCurrencyAmount(10.005)).toBe(10.01);
    expect(roundCurrencyAmount(Number.NaN)).toBe(0);
  });
});
