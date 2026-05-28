/** A single retrieved chunk with similarity distance. */
export type SimilarChunkRow = {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  distance: number;
};

/** A chunk row enriched with both semantic and lexical ranking signals. */
export type HybridRetrievalRow = SimilarChunkRow & {
  lexicalScore: number;
  semanticRank: number;
  lexicalRank: number;
  fusedRank: number;
};

export type KnowledgeRetrievalMode = "semantic" | "hybrid";

export type KnowledgeRetrievalStatus = "ok" | "no_evidence" | "degraded";

export type KnowledgeRetrievalDiagnostics = {
  status: KnowledgeRetrievalStatus;
  mode: KnowledgeRetrievalMode;
  hybridEnabled: boolean;
  rerankAttempted: boolean;
  rerankApplied: boolean;
  degradedReason?: string;
};

export type KnowledgeRetrievalResult = {
  rows: HybridRetrievalRow[];
  diagnostics: KnowledgeRetrievalDiagnostics;
};

/** A raw document yielded by a source adapter before chunking/embedding. */
export type RawKnowledgeDocument = {
  externalId: string;
  title: string;
  body: string;
  mimeType?: string;
  metadata?: Record<string, unknown>;
};
