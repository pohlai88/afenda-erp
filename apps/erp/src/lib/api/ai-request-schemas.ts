import { moduleIds } from "@afenda/config/module-ids";
import { solutionWorkflowIds } from "@afenda/domain";
import { z } from "zod";

export const chatRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(40),
  contextModuleId: z.enum(moduleIds).optional(),
});

export const solutionProviderRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(40),
  workflowId: z.enum(solutionWorkflowIds).optional(),
});

/** Lynx Operator request shape with a tighter message window. */
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

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type SolutionProviderRequest = z.infer<
  typeof solutionProviderRequestSchema
>;
export type LynxOperatorRequest = z.infer<typeof lynxOperatorRequestSchema>;
