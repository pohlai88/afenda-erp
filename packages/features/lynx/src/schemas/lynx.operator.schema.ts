import { solutionWorkflowIds } from "@afenda/kernel";
import { z } from "zod";

export const lynxOperatorRequestSchema = z
  .object({
    messages: z.array(z.unknown()).min(1).max(20),
    workflowId: z.enum(solutionWorkflowIds).optional(),
    workflowSessionId: z.string().trim().min(1).max(120).optional(),
  })
  .passthrough()
  .superRefine((value, ctx) => {
    if ("organizationId" in value) {
      ctx.addIssue({
        code: "custom",
        message: "organizationId is server-derived and cannot be supplied.",
        path: ["organizationId"],
      });
    }
  });

export type LynxOperatorRequest = z.infer<typeof lynxOperatorRequestSchema>;
