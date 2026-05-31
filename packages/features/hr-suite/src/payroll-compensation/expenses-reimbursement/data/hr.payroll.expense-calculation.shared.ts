import type { HrExpenseLineDecision } from "../schemas/hr.payroll.expense-constants.shared";
import type {
  CalculateReimbursementAmountsInput,
  HrExpenseLineItem,
} from "../schemas/hr.payroll.expense-line-item.schema";
import {
  convertForeignCurrencyAmount,
  getExchangeRate,
  roundCurrencyAmount,
  stubExchangeRateProvider,
  type ExchangeRateProvider,
} from "./hr.payroll.expense-exchange-rate.shared";

export type ExpenseLineAmountBreakdown = {
  lineId: string;
  kind: HrExpenseLineItem["kind"];
  decision: HrExpenseLineDecision;
  claimedAmount: number;
  approvedLineAmount: number;
  rejectedLineAmount: number;
  currencyCode: string;
  exchangeRateApplied?: number;
};

export type CashAdvanceOffsetInput = {
  reimbursableAmount: number;
  cashAdvanceBalance: number;
};

export type CashAdvanceOffsetResult = {
  offsetAmount: number;
  netPayableAmount: number;
  remainingAdvanceBalance: number;
  recoverableBalance: number;
};

export type ReimbursementAmountsResult = {
  claimAmountTotal: number;
  approvedAmount: number;
  rejectedAmount: number;
  pendingAmount: number;
  reimbursableAmount: number;
  offsetAmount: number;
  netPayableAmount: number;
  remainingAdvanceBalance: number;
  recoverableBalance: number;
  lineBreakdown: readonly ExpenseLineAmountBreakdown[];
};

export type CalculateReimbursementAmountsOptions = {
  exchangeRateProvider?: ExchangeRateProvider;
};

/** HRM-EXP-012 — mileage amount from approved distance and rate. */
export function calculateMileageAmount(input: {
  distance: number;
  approvedDistance?: number | null;
  ratePerUnit: number;
}): number {
  const effectiveDistance = input.approvedDistance ?? input.distance;

  if (
    !Number.isFinite(effectiveDistance) ||
    !Number.isFinite(input.ratePerUnit) ||
    effectiveDistance <= 0 ||
    input.ratePerUnit <= 0
  ) {
    return 0;
  }

  return roundCurrencyAmount(effectiveDistance * input.ratePerUnit);
}

/** HRM-EXP-013 — travel line amount including per diem calculation. */
export function calculateTravelLineAmount(
  line: Extract<HrExpenseLineItem, { kind: "travel" }>,
): number {
  if (line.component === "per_diem") {
    const days = line.perDiemDays ?? 0;
    const dailyRate = line.perDiemDailyRate ?? 0;
    return roundCurrencyAmount(days * dailyRate);
  }

  return roundCurrencyAmount(line.amount ?? 0);
}

async function resolveLineClaimedAmount(
  line: HrExpenseLineItem,
  provider: ExchangeRateProvider,
): Promise<{ amount: number; currencyCode: string; exchangeRateApplied?: number }> {
  switch (line.kind) {
    case "standard":
      return {
        amount: roundCurrencyAmount(line.amount),
        currencyCode: line.currencyCode,
      };
    case "mileage":
      return {
        amount: calculateMileageAmount({
          distance: line.distance,
          approvedDistance: line.approvedDistance,
          ratePerUnit: line.ratePerUnit,
        }),
        currencyCode: line.currencyCode,
      };
    case "travel":
      return {
        amount: calculateTravelLineAmount(line),
        currencyCode: line.currencyCode,
      };
    case "foreign_currency": {
      if (line.exchangeRateOverride !== undefined) {
        const converted = convertForeignCurrencyAmount(line.foreignAmount, {
          fromCurrency: line.foreignCurrencyCode,
          toCurrency: line.reimbursementCurrencyCode,
          rate: line.exchangeRateOverride,
          rateDate: line.exchangeRateDate ?? line.expenseDate,
          source: "manual_override",
        });

        return {
          amount: converted,
          currencyCode: line.reimbursementCurrencyCode,
          exchangeRateApplied: line.exchangeRateOverride,
        };
      }

      const reference = await getExchangeRate(
        {
          fromCurrency: line.foreignCurrencyCode,
          toCurrency: line.reimbursementCurrencyCode,
          rateDate: line.exchangeRateDate ?? line.expenseDate,
        },
        provider,
      );

      return {
        amount: convertForeignCurrencyAmount(line.foreignAmount, reference),
        currencyCode: line.reimbursementCurrencyCode,
        exchangeRateApplied: reference.rate,
      };
    }
    default: {
      const exhaustive: never = line;
      return exhaustive;
    }
  }
}

function assertMatchingReimbursementCurrency(
  lineCurrencyCode: string,
  reimbursementCurrencyCode: string,
  lineId: string,
): void {
  if (lineCurrencyCode !== reimbursementCurrencyCode) {
    throw new Error(
      `Line ${lineId} currency ${lineCurrencyCode} does not match claim reimbursement currency ${reimbursementCurrencyCode}`,
    );
  }
}

/** HRM-EXP-014 — offset approved reimbursement against an outstanding cash advance. */
export function applyCashAdvanceOffset(
  input: CashAdvanceOffsetInput,
): CashAdvanceOffsetResult {
  const reimbursableAmount = Math.max(0, roundCurrencyAmount(input.reimbursableAmount));
  const cashAdvanceBalance = Math.max(0, roundCurrencyAmount(input.cashAdvanceBalance));

  const offsetAmount = roundCurrencyAmount(
    Math.min(reimbursableAmount, cashAdvanceBalance),
  );
  const netPayableAmount = roundCurrencyAmount(reimbursableAmount - offsetAmount);
  const remainingAdvanceBalance = roundCurrencyAmount(
    cashAdvanceBalance - offsetAmount,
  );
  const recoverableBalance =
    cashAdvanceBalance > reimbursableAmount
      ? roundCurrencyAmount(cashAdvanceBalance - reimbursableAmount)
      : 0;

  return {
    offsetAmount,
    netPayableAmount,
    remainingAdvanceBalance,
    recoverableBalance,
  };
}

/**
 * HRM-EXP-015 — calculate approved, rejected, reimbursable, and offset amounts.
 * Covers acceptance criteria 9, 10, 11, and 16.
 */
export async function calculateReimbursementAmounts(
  input: CalculateReimbursementAmountsInput,
  options: CalculateReimbursementAmountsOptions = {},
): Promise<ReimbursementAmountsResult> {
  const provider = options.exchangeRateProvider ?? stubExchangeRateProvider;
  const lineBreakdown: ExpenseLineAmountBreakdown[] = [];

  let claimAmountTotal = 0;
  let approvedAmount = 0;
  let rejectedAmount = 0;
  let pendingAmount = 0;

  for (const line of input.lineItems) {
    const resolved = await resolveLineClaimedAmount(line, provider);

    assertMatchingReimbursementCurrency(
      resolved.currencyCode,
      input.reimbursementCurrencyCode,
      line.lineId,
    );

    const claimedAmount = resolved.amount;
    claimAmountTotal += claimedAmount;

    let approvedLineAmount = 0;
    let rejectedLineAmount = 0;

    switch (line.decision) {
      case "approved":
        approvedLineAmount = claimedAmount;
        approvedAmount += claimedAmount;
        break;
      case "rejected":
        rejectedLineAmount = claimedAmount;
        rejectedAmount += claimedAmount;
        break;
      case "pending":
        pendingAmount += claimedAmount;
        break;
      default: {
        const exhaustive: never = line.decision;
        return exhaustive;
      }
    }

    lineBreakdown.push({
      lineId: line.lineId,
      kind: line.kind,
      decision: line.decision,
      claimedAmount,
      approvedLineAmount,
      rejectedLineAmount,
      currencyCode: resolved.currencyCode,
      exchangeRateApplied: resolved.exchangeRateApplied,
    });
  }

  const totals = {
    claimAmountTotal: roundCurrencyAmount(claimAmountTotal),
    approvedAmount: roundCurrencyAmount(approvedAmount),
    rejectedAmount: roundCurrencyAmount(rejectedAmount),
    pendingAmount: roundCurrencyAmount(pendingAmount),
    reimbursableAmount: roundCurrencyAmount(approvedAmount),
  };

  const offset = applyCashAdvanceOffset({
    reimbursableAmount: totals.reimbursableAmount,
    cashAdvanceBalance: input.cashAdvanceBalance ?? 0,
  });

  return {
    ...totals,
    offsetAmount: offset.offsetAmount,
    netPayableAmount: offset.netPayableAmount,
    remainingAdvanceBalance: offset.remainingAdvanceBalance,
    recoverableBalance: offset.recoverableBalance,
    lineBreakdown,
  };
}

export {
  convertForeignCurrencyAmount,
  getExchangeRate,
  roundCurrencyAmount,
  createExchangeRateProvider,
  stubExchangeRateProvider,
  type ExchangeRateLookupInput,
  type ExchangeRateProvider,
  type ExchangeRateReference,
  type ExchangeRateConfigEntry,
} from "./hr.payroll.expense-exchange-rate.shared";
