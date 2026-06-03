import { z } from "zod";

export const hrSftSwapDecisionSchema = z.enum([
  "approve",
  "reject",
  "return",
  "override",
]);

export type HrSftSwapDecision = z.infer<typeof hrSftSwapDecisionSchema>;

export const hrSftSubmitSwapRequestSchema = z.object({
  requesterAssignmentId: z.string().trim().min(1),
  targetEmployeeId: z.string().trim().min(1).optional(),
  targetAssignmentId: z.string().trim().min(1).optional(),
  reason: z.string().trim().min(1, "Swap reason is required.").max(500),
});

export type HrSftSubmitSwapRequestInput = z.infer<
  typeof hrSftSubmitSwapRequestSchema
>;

/** HRM-SFT-022/023 — manager decision with required reason on reject/override. */
export const hrSftDecideSwapRequestSchema = z
  .object({
    swapRequestId: z.string().trim().min(1),
    decision: hrSftSwapDecisionSchema,
    rejectionReason: z.string().optional(),
    overrideReason: z.string().optional(),
    returnedNote: z.string().optional(),
    decisionNote: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.decision === "reject" && !value.rejectionReason?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Rejection reason is required.",
        path: ["rejectionReason"],
      });
    }
    if (value.decision === "override" && !value.overrideReason?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Override reason is required.",
        path: ["overrideReason"],
      });
    }
    if (value.decision === "return" && !value.returnedNote?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Return note is required.",
        path: ["returnedNote"],
      });
    }
  });

export type HrSftDecideSwapRequestInput = z.infer<
  typeof hrSftDecideSwapRequestSchema
>;
