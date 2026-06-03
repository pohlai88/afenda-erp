import { z } from "zod";

import { HR_EXPENSE_CLAIM_CATEGORIES } from "./hr.payroll.expense-constants.shared";

const categoryCodeSchema = z.enum(HR_EXPENSE_CLAIM_CATEGORIES);

const limitCentsSchema = z.coerce
  .number()
  .int()
  .nonnegative()
  .nullable()
  .optional();

/** HRM-EXP-006/008 — org policy header configuration. */
export const hrExpensePolicyHeaderSchema = z.object({
  policyGroupCode: z.string().trim().min(1).max(64).default("default"),
  name: z.string().trim().min(1).max(200).default("Default expense policy"),
  defaultCurrencyCode: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase())
    .default("USD"),
  maxClaimAmountCents: limitCentsSchema,
  active: z.coerce.boolean().default(true),
});

/** Per-category limits and mandatory receipt flag (HRM-EXP-004/008). */
export const hrExpensePolicyCategoryRuleSchema = z.object({
  policyGroupCode: z.string().trim().min(1).max(64).default("default"),
  category: categoryCodeSchema,
  mandatoryReceipt: z.coerce.boolean(),
  perClaimLimitCents: limitCentsSchema,
  dailyLimitCents: limitCentsSchema,
  monthlyLimitCents: limitCentsSchema,
});

export const upsertHrExpensePolicyCategoryRuleFormSchema =
  hrExpensePolicyCategoryRuleSchema;

export type HrExpensePolicyCategoryRuleInput = z.infer<
  typeof hrExpensePolicyCategoryRuleSchema
>;
