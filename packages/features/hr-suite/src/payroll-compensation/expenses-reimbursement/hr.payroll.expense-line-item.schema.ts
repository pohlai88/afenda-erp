import { z } from "zod";

import {
  HR_EXPENSE_DISTANCE_UNITS,
  HR_EXPENSE_LINE_DECISIONS,
  HR_EXPENSE_LINE_ITEM_KINDS,
  HR_EXPENSE_TRAVEL_COMPONENTS,
} from "./hr.payroll.expense-constants.shared";

const currencyCodeSchema = z
  .string()
  .trim()
  .length(3)
  .transform((value) => value.toUpperCase());

const positiveAmountSchema = z.coerce.number().finite().nonnegative();

const expenseLineDecisionSchema = z.enum(HR_EXPENSE_LINE_DECISIONS);

const expenseLineBaseSchema = z.object({
  lineId: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(2000),
  expenseDate: z.string().trim().date(),
  decision: expenseLineDecisionSchema.default("pending"),
  rejectionReason: z.string().trim().max(2000).optional(),
});

/** HRM-EXP-005 — standard category expense line. */
export const hrExpenseStandardLineItemSchema = expenseLineBaseSchema.extend({
  kind: z.literal("standard"),
  amount: positiveAmountSchema,
  currencyCode: currencyCodeSchema,
});

/** HRM-EXP-010/011 — foreign currency expense line. */
export const hrExpenseForeignCurrencyLineItemSchema = expenseLineBaseSchema.extend({
  kind: z.literal("foreign_currency"),
  foreignAmount: positiveAmountSchema,
  foreignCurrencyCode: currencyCodeSchema,
  reimbursementCurrencyCode: currencyCodeSchema,
  exchangeRateDate: z.string().trim().date().optional(),
  exchangeRateOverride: positiveAmountSchema.optional(),
});

/** HRM-EXP-012 — mileage reimbursement line. */
export const hrExpenseMileageLineItemSchema = expenseLineBaseSchema.extend({
  kind: z.literal("mileage"),
  distance: positiveAmountSchema,
  approvedDistance: positiveAmountSchema.optional(),
  distanceUnit: z.enum(HR_EXPENSE_DISTANCE_UNITS),
  ratePerUnit: positiveAmountSchema,
  currencyCode: currencyCodeSchema,
});

/** HRM-EXP-013 — travel expense line (flight, hotel, meals, transport, per diem). */
export const hrExpenseTravelLineItemSchema = expenseLineBaseSchema
  .extend({
    kind: z.literal("travel"),
    component: z.enum(HR_EXPENSE_TRAVEL_COMPONENTS),
    currencyCode: currencyCodeSchema,
    amount: positiveAmountSchema.optional(),
    perDiemDays: positiveAmountSchema.optional(),
    perDiemDailyRate: positiveAmountSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.component === "per_diem") {
      if (value.perDiemDays === undefined || value.perDiemDailyRate === undefined) {
        ctx.addIssue({
          code: "custom",
          message:
            "Per diem travel lines require perDiemDays and perDiemDailyRate.",
          path: ["perDiemDays"],
        });
      }
      return;
    }

    if (value.amount === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Travel lines require amount unless component is per_diem.",
        path: ["amount"],
      });
    }
  });

export const hrExpenseLineItemSchema = z.discriminatedUnion("kind", [
  hrExpenseStandardLineItemSchema,
  hrExpenseForeignCurrencyLineItemSchema,
  hrExpenseMileageLineItemSchema,
  hrExpenseTravelLineItemSchema,
]);

export type HrExpenseStandardLineItem = z.infer<
  typeof hrExpenseStandardLineItemSchema
>;
export type HrExpenseForeignCurrencyLineItem = z.infer<
  typeof hrExpenseForeignCurrencyLineItemSchema
>;
export type HrExpenseMileageLineItem = z.infer<
  typeof hrExpenseMileageLineItemSchema
>;
export type HrExpenseTravelLineItem = z.infer<typeof hrExpenseTravelLineItemSchema>;
export type HrExpenseLineItem = z.infer<typeof hrExpenseLineItemSchema>;

export const hrExpenseClaimCalculationInputSchema = z.object({
  claimId: z.string().trim().min(1).max(100).optional(),
  reimbursementCurrencyCode: currencyCodeSchema,
  lineItems: z.array(hrExpenseLineItemSchema).min(1),
  cashAdvanceBalance: positiveAmountSchema.default(0),
});

export type HrExpenseClaimCalculationInput = z.infer<
  typeof hrExpenseClaimCalculationInputSchema
>;

/** Runtime input for reimbursement totals (claimId optional for action adapters). */
export type CalculateReimbursementAmountsInput = {
  claimId?: string;
  reimbursementCurrencyCode: string;
  lineItems: readonly HrExpenseLineItem[];
  cashAdvanceBalance?: number;
};

export const HR_EXPENSE_LINE_ITEM_KIND_VALUES = [...HR_EXPENSE_LINE_ITEM_KINDS];
