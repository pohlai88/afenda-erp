import { z } from "zod";

import { HR_BONUS_PAYOUT_FORMULA_KINDS } from "./hr.payroll.bonus-constants.shared";

const numericString = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d+)?$/, "Must be a valid number");

const optionalNumericString = z
  .union([numericString, z.literal("")])
  .optional()
  .transform((value) => (value === "" ? undefined : value));

/** BON-007 — record actual achievement against a target. */
export const recordBonusTargetAchievementSchema = z.object({
  targetId: z.string().trim().min(1, "Target is required"),
  actualValue: numericString.refine(
    (value) => Number(value) >= 0,
    "Actual achievement must be non-negative",
  ),
  notes: z.string().trim().max(2000).optional(),
});

export type RecordBonusTargetAchievementInput = z.infer<
  typeof recordBonusTargetAchievementSchema
>;

/** BON-009 + BON-012 — payout formula with cap/floor. */
export const upsertBonusPayoutFormulaSchema = z
  .object({
    planId: z.string().trim().min(1, "Plan is required"),
    formulaKind: z.enum(HR_BONUS_PAYOUT_FORMULA_KINDS),
    fixedAmount: optionalNumericString,
    percentageRate: optionalNumericString,
    performanceRatingWeight: optionalNumericString,
    payoutFloor: optionalNumericString,
    payoutCap: optionalNumericString,
    currencyCode: z.string().trim().max(3).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.formulaKind === "fixed_amount" && !value.fixedAmount) {
      ctx.addIssue({
        code: "custom",
        message: "Fixed amount is required for fixed_amount formula",
        path: ["fixedAmount"],
      });
    }

    const percentKinds = [
      "salary_percentage",
      "sales_percentage",
      "revenue_percentage",
      "margin_percentage",
    ] as const;

    if (
      (percentKinds as readonly string[]).includes(value.formulaKind) &&
      !value.percentageRate
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Percentage rate is required for percentage-based formulas",
        path: ["percentageRate"],
      });
    }

    if (
      value.formulaKind === "performance_rating" &&
      !value.performanceRatingWeight
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Performance rating weight is required",
        path: ["performanceRatingWeight"],
      });
    }

    const floor = value.payoutFloor ? Number(value.payoutFloor) : null;
    const cap = value.payoutCap ? Number(value.payoutCap) : null;
    if (
      floor !== null &&
      cap !== null &&
      Number.isFinite(floor) &&
      Number.isFinite(cap) &&
      floor > cap
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Payout floor cannot exceed payout cap",
        path: ["payoutFloor"],
      });
    }
  });

export type UpsertBonusPayoutFormulaInput = z.infer<
  typeof upsertBonusPayoutFormulaSchema
>;

/** BON-010 — tiered commission rate row. */
export const bonusCommissionTierRowSchema = z.object({
  tierOrder: z.coerce.number().int().min(0),
  minThreshold: numericString,
  maxThreshold: optionalNumericString,
  ratePercent: numericString.refine(
    (value) => Number(value) >= 0,
    "Rate must be non-negative",
  ),
});

/** BON-010 — replace all tiers for a plan. */
export const replaceBonusCommissionTiersSchema = z.object({
  planId: z.string().trim().min(1, "Plan is required"),
  tiers: z.array(bonusCommissionTierRowSchema).max(20),
});

export type ReplaceBonusCommissionTiersInput = z.infer<
  typeof replaceBonusCommissionTiersSchema
>;

/** BON-011 — accelerator for overachievement. */
export const upsertBonusAcceleratorRuleSchema = z.object({
  planId: z.string().trim().min(1, "Plan is required"),
  thresholdPercent: optionalNumericString,
  acceleratorRate: numericString.refine(
    (value) => Number(value) >= 0,
    "Accelerator rate must be non-negative",
  ),
});

export type UpsertBonusAcceleratorRuleInput = z.infer<
  typeof upsertBonusAcceleratorRuleSchema
>;

/** BON-009..012 — calculate payout preview/run. */
export const calculateBonusPayoutSchema = z.object({
  planId: z.string().trim().min(1, "Plan is required"),
  baseSalary: optionalNumericString,
  salesAmount: optionalNumericString,
  revenueAmount: optionalNumericString,
  marginAmount: optionalNumericString,
  kpiScore: optionalNumericString,
  performanceRating: optionalNumericString,
  achievementPercent: optionalNumericString,
});

export type CalculateBonusPayoutInput = z.infer<
  typeof calculateBonusPayoutSchema
>;
