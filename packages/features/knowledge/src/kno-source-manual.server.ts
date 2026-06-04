import type { KnowledgeSourceAdapter } from "./kno-source-adapter.contract";
import {
  knowledgeManualSourceConfigSchema,
  type KnowledgeManualSourceConfig,
} from "./kno-source-manual.schema";

/**
 * Manual ingest adapter — config stores the content directly.
 * Used for hand-entered policies, SOPs, and handbook text.
 */
export const manualSourceAdapter: KnowledgeSourceAdapter<KnowledgeManualSourceConfig> =
  {
    id: "manual",
    configSchema: knowledgeManualSourceConfigSchema,
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
