/** Must match `vector(N)` in `knowledge_chunk.embedding` schema. */
export const KNOWLEDGE_EMBEDDING_DIMENSIONS = 1536 as const;

/** Default embedding model routed through the Vercel AI Gateway. */
export const DEFAULT_EMBEDDING_MODEL =
  "openai/text-embedding-3-small" as const;

/** Target tokens per chunk (word-window approximation). */
export const KNOWLEDGE_CHUNK_TARGET_TOKENS = 512 as const;

/** Overlap tokens between consecutive chunks. */
export const KNOWLEDGE_CHUNK_OVERLAP_TOKENS = 64 as const;

/** Default top-K for similarity search. */
export const KNOWLEDGE_DEFAULT_TOP_K = 8 as const;

export const KNOWLEDGE_AUDIT_ACTIONS = {
  DOCUMENT_EMBEDDED: "erp.knowledge.document.embedded",
  SOURCE_SYNC_COMPLETE: "erp.knowledge.source.sync.complete",
  SOURCE_SYNC_FAIL: "erp.knowledge.source.sync.fail",
  RETRIEVAL_DEGRADED: "erp.knowledge.retrieval.degraded",
  RERANK_SKIPPED: "erp.knowledge.rerank.skipped",
  RERANK_UNAVAILABLE: "erp.knowledge.rerank.unavailable",
  RERANK_FAILED: "erp.knowledge.rerank.failed",
  EVAL_RUN: "erp.knowledge.eval.run",
  EVAL_RUN_FAIL: "erp.knowledge.eval.run.fail",
} as const;

export const KNOWLEDGE_SOURCE_KINDS = ["manual", "github_repo"] as const;
export type KnowledgeSourceKind = (typeof KNOWLEDGE_SOURCE_KINDS)[number];
