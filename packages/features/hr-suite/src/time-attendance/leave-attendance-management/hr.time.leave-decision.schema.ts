import { z } from "zod";

export const hrLeaveDecisionSchema = z.enum([
  "approve",
  "reject",
  "return",
  "request_clarification",
]);

export const decideHrLeaveApplicationFormSchema = z
  .object({
    requestId: z.string().min(1),
    decision: hrLeaveDecisionSchema,
    rejectionReason: z.string().optional(),
    decisionNote: z.string().optional(),
    returnedNote: z.string().optional(),
    clarificationNote: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "reject" && !value.rejectionReason?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Rejection reason is required.",
        path: ["rejectionReason"],
      });
    }
  });

export const adjustHrLeaveBalanceFormSchema = z.object({
  employeeId: z.string().min(1),
  leaveType: z.enum(["annual", "sick", "unpaid", "compassionate", "other"]),
  entitlementYear: z.coerce.number().int().min(2000).max(2100),
  adjustmentDays: z.coerce.number(),
  reason: z.string().trim().min(1, "Adjustment reason is required."),
});

export const carryForwardHrLeaveFormSchema = z.object({
  fromYear: z.coerce.number().int().min(2000).max(2100),
  toYear: z.coerce.number().int().min(2000).max(2100),
  policyGroupCode: z.string().optional(),
});
