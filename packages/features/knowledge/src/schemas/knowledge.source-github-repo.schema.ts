import { z } from "zod";

export const knowledgeGitHubRepoSourceConfigSchema = z.object({
  owner: z.string().trim().min(1),
  repo: z.string().trim().min(1),
  ref: z.string().trim().min(1).optional(),
  includePaths: z.array(z.string().trim().min(1)).optional(),
  excludePaths: z.array(z.string().trim().min(1)).optional(),
});

export type KnowledgeGitHubRepoSourceConfig = z.infer<
  typeof knowledgeGitHubRepoSourceConfigSchema
>;
