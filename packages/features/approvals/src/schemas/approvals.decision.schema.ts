import { z } from "zod";

export const approvalWorkItemDecisionInputSchema = z
  .object({
    workItemId: z.string().trim().min(1),
    decision: z.enum(["approve", "reject"]),
    decisionNote: z.string().trim().max(500).optional(),
    rejectionReason: z.string().trim().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "reject" && !value.rejectionReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rejection reason is required.",
        path: ["rejectionReason"],
      });
    }
  });

export type ApprovalWorkItemDecisionInput = z.infer<
  typeof approvalWorkItemDecisionInputSchema
>;

export const approvalRequestExtensionSchema = z
  .object({
    approvalRoute: z.string().trim().min(1),
    escalation: z.boolean().optional(),
  })
  .passthrough();
