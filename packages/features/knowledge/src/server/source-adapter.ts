import type { ZodType } from "zod";

import type { KnowledgeSourceKind } from "../constants";
import type { RawKnowledgeDocument } from "../types";

export type KnowledgeSourceAdapterContext = {
  organizationId: string;
};

/**
 * Adapter contract — invariant A:
 * `listDocuments` must yield plain `RawKnowledgeDocument` items only.
 * Adapters must not: write DB rows, call embedding functions,
 * choose chunking strategy, or influence ranking.
 */
export type KnowledgeSourceAdapter<TConfig extends Record<string, unknown>> = {
  id: KnowledgeSourceKind;
  configSchema: ZodType<TConfig>;
  listDocuments: (
    ctx: KnowledgeSourceAdapterContext,
    config: TConfig,
  ) => AsyncIterable<RawKnowledgeDocument>;
};
