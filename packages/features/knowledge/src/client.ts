/**
 * Client-safe exports for @afenda/feature-knowledge.
 * Serializable DTOs, client-safe constants, and Zod schemas only.
 * No server-only, no next/headers, no @afenda/db, no @afenda/ai.
 */
export * from "./constants";
export type {
  RawKnowledgeDocument,
  SimilarChunkRow,
  HybridRetrievalRow,
} from "./types";
