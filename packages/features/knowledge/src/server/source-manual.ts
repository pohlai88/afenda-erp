import { z } from "zod";

import type { KnowledgeSourceAdapter } from "./source-adapter";

const manualSourceConfigSchema = z.object({
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

export type ManualSourceConfig = z.infer<typeof manualSourceConfigSchema>;

/**
 * Manual ingest adapter — config stores the content directly.
 * Used for hand-entered policies, SOPs, and handbook text.
 */
export const manualSourceAdapter: KnowledgeSourceAdapter<ManualSourceConfig> =
  {
    id: "manual",
    configSchema: manualSourceConfigSchema,
    async *listDocuments(_ctx, config) {
      for (const chunk of config.chunks) {
        yield {
          externalId: chunk.externalId,
          title: chunk.title,
          body: chunk.body,
          mimeType: "text/plain",
        };
      }
    },
  };
