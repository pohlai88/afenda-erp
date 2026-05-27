import { solutionWorkflowIds } from "@afenda/domain";
import { z } from "zod";

export const chatRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(40),
});

export const solutionProviderRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(40),
  workflowId: z.enum(solutionWorkflowIds).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type SolutionProviderRequest = z.infer<
  typeof solutionProviderRequestSchema
>;
