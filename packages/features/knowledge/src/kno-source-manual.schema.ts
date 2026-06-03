import { z } from "zod";

export const knowledgeManualSourceConfigSchema = z.object({
  chunks: z
    .array(
      z.object({
        externalId: z.string().min(1),
        title: z.string().min(1),
        body: z.string().min(1),
      }),
    )
    .default([]),
});

export type KnowledgeManualSourceConfig = z.infer<
  typeof knowledgeManualSourceConfigSchema
>;
