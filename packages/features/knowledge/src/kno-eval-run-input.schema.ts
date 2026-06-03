import { z } from "zod";

/** Runtime validation for eval cases passed to `runKnowledgeEval`. */
export const knowledgeEvalCaseInputSchema = z
  .object({
    id: z.string().min(1),
    query: z.string().min(1),
    expectedChunkIds: z.array(z.string()),
    observedAnswer: z.string().optional(),
    shouldAnswer: z.boolean().optional(),
    containsPromptInjection: z.boolean().optional(),
  })
  .strict();

export const knowledgeEvalRunInputSchema = z
  .object({
    organizationId: z.string().min(1),
    evalSetId: z.string().min(1),
    evalCases: z.array(knowledgeEvalCaseInputSchema).min(1),
    topK: z.number().int().positive().max(32).optional(),
    hybrid: z.boolean().optional(),
  })
  .strict();

export type KnowledgeEvalCaseInput = z.infer<typeof knowledgeEvalCaseInputSchema>;
export type KnowledgeEvalRunInput = z.infer<typeof knowledgeEvalRunInputSchema>;
