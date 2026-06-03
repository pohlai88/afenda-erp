import { z } from "zod";

export const HR_BONUS_PAYOUT_DECISIONS = [
  "approve",
  "reject",
  "return",
  "adjust",
] as const;

export const prepareBonusPayoutSchema = z.object({
  planId: z.string().min(1),
  cycleId: z.string().min(1),
  employeeId: z.string().min(1),
  payoutId: z.string().optional(),
  performanceRating: z.coerce.number().nullable().optional(),
  baseSalary: z.coerce.number().nullable().optional(),
  salesAmount: z.coerce.number().nullable().optional(),
  revenueAmount: z.coerce.number().nullable().optional(),
  marginAmount: z.coerce.number().nullable().optional(),
  kpiScore: z.coerce.number().nullable().optional(),
  achievementPercent: z.coerce.number().nullable().optional(),
});

export const submitBonusPayoutApprovalSchema = z.object({
  payoutId: z.string().min(1),
});

export const reviewBonusPayoutSchema = z
  .object({
    payoutId: z.string().min(1),
    decision: z.enum(HR_BONUS_PAYOUT_DECISIONS),
    reason: z.string().nullable().optional(),
    adjustedAmount: z.coerce.number().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "reject" && !value.reason?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Rejection reason is required.",
        path: ["reason"],
      });
    }
    if (value.decision === "return" && !value.reason?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Return reason is required.",
        path: ["reason"],
      });
    }
    if (value.decision === "adjust") {
      if (!value.reason?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Adjustment reason is required.",
          path: ["reason"],
        });
      }
      if (value.adjustedAmount == null || value.adjustedAmount < 0) {
        ctx.addIssue({
          code: "custom",
          message: "Adjusted amount is required for payout adjustment.",
          path: ["adjustedAmount"],
        });
      }
    }
  });

export type PrepareBonusPayoutInput = z.infer<typeof prepareBonusPayoutSchema>;
export type ReviewBonusPayoutInput = z.infer<typeof reviewBonusPayoutSchema>;
