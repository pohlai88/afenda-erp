import { z } from "zod";

export const searchKnowledgeInputSchema = z.object({
  query: z.string().trim().min(1).max(500),
});

export const recentKnowledgeChunksInputSchema = z.object({
  limit: z.number().int().min(1).max(20).optional().default(5),
});
