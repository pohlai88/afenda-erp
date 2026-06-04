import { asc, cosineDistance, eq, sql } from "drizzle-orm";

import { getDb, knowledgeChunks } from "@afenda/db";

import {
  KNOWLEDGE_AUDIT_ACTIONS,
  KNOWLEDGE_DEFAULT_TOP_K,
} from "./kno-core.contract";
import type {
  HybridRetrievalRow,
  KnowledgeRetrievalDiagnostics,
  KnowledgeRetrievalResult,
  SimilarChunkRow,
} from "./kno-retrieval.contract";
import { emitKnowledgeAuditEvent } from "./kno-audit.server";
import type { KnowledgeEmbeddingTelemetry } from "./kno-embeddings.server";
import { embedKnowledgeText } from "./kno-embeddings.server";

export type RetrievalOptions = {
  topK?: number;
  hybrid?: boolean;
  rerank?: boolean;
  rerankTopK?: number;
  telemetry?: KnowledgeEmbeddingTelemetry;
};

/**
 * Semantic similarity retrieval using cosine distance on vector embeddings.
 * Invariant B enforced: retrieval is source-blind — no joins on knowledge_source.
 */
async function retrieveSemantic(
  organizationId: string,
  queryEmbedding: number[],
  topK: number,
): Promise<SimilarChunkRow[]> {
  const db = getDb();
  const dist = cosineDistance(knowledgeChunks.embedding, queryEmbedding);

  const rows = await db
    .select({
      id: knowledgeChunks.id,
      title: knowledgeChunks.title,
      body: knowledgeChunks.body,
      createdAt: knowledgeChunks.createdAt,
      distance: dist,
    })
    .from(knowledgeChunks)
    .where(eq(knowledgeChunks.organizationId, organizationId))
    .orderBy(asc(dist))
    .limit(topK);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt,
    distance: Number(r.distance),
  }));
}

type LexicalRow = {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  lexicalScore: number;
};

/**
 * Lexical full-text search using Postgres `to_tsvector` / `websearch_to_tsquery`.
 */
async function retrieveLexical(
  organizationId: string,
  queryText: string,
  topK: number,
): Promise<LexicalRow[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: knowledgeChunks.id,
      title: knowledgeChunks.title,
      body: knowledgeChunks.body,
      createdAt: knowledgeChunks.createdAt,
      lexicalScore: sql<number>`ts_rank_cd(
        to_tsvector('english', ${knowledgeChunks.title} || ' ' || ${knowledgeChunks.body}),
        websearch_to_tsquery('english', ${queryText})
      )`,
    })
    .from(knowledgeChunks)
    .where(
      sql`
        ${knowledgeChunks.organizationId} = ${organizationId}
        AND to_tsvector('english', ${knowledgeChunks.title} || ' ' || ${knowledgeChunks.body})
          @@ websearch_to_tsquery('english', ${queryText})
      `,
    )
    .orderBy(
      sql`ts_rank_cd(
        to_tsvector('english', ${knowledgeChunks.title} || ' ' || ${knowledgeChunks.body}),
        websearch_to_tsquery('english', ${queryText})
      ) DESC`,
    )
    .limit(topK);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt,
    lexicalScore: Number(r.lexicalScore),
  }));
}

/**
 * Reciprocal Rank Fusion (RRF) — merges two ranked lists.
 * k=60 is standard; higher k reduces influence of top ranks.
 */
function rrfMerge(
  semanticRows: SimilarChunkRow[],
  lexicalRows: LexicalRow[],
  topK: number,
): HybridRetrievalRow[] {
  const K = 60;
  const semanticRankMap = new Map<string, number>(
    semanticRows.map((r, i) => [r.id, i]),
  );
  const lexicalRankMap = new Map<string, number>(
    lexicalRows.map((r, i) => [r.id, i]),
  );

  const allIds = new Set([
    ...semanticRows.map((r) => r.id),
    ...lexicalRows.map((r) => r.id),
  ]);

  const semanticById = new Map<string, SimilarChunkRow>(
    semanticRows.map((r) => [r.id, r]),
  );
  const lexicalById = new Map<string, LexicalRow>(
    lexicalRows.map((r) => [r.id, r]),
  );

  const merged: HybridRetrievalRow[] = [];

  for (const id of allIds) {
    const sRank = semanticRankMap.get(id) ?? Infinity;
    const lRank = lexicalRankMap.get(id) ?? Infinity;

    const semanticRrfScore = sRank === Infinity ? 0 : 1 / (K + sRank + 1);
    const lexicalRrfScore = lRank === Infinity ? 0 : 1 / (K + lRank + 1);
    const fusedScore = semanticRrfScore + lexicalRrfScore;

    const row = semanticById.get(id) ?? lexicalById.get(id)!;

    merged.push({
      id: row.id,
      title: row.title,
      body: row.body,
      createdAt: row.createdAt,
      distance: semanticById.get(id)?.distance ?? 1,
      lexicalScore: lexicalById.get(id)?.lexicalScore ?? 0,
      semanticRank: sRank === Infinity ? 9999 : sRank,
      lexicalRank: lRank === Infinity ? 9999 : lRank,
      fusedRank: fusedScore,
    });
  }

  merged.sort((a, b) => b.fusedRank - a.fusedRank);
  return merged.slice(0, topK);
}

function createRetrievalDiagnostics(input: {
  rows: readonly HybridRetrievalRow[];
  hybridEnabled: boolean;
  rerankAttempted: boolean;
  rerankApplied: boolean;
  degradedReason?: string;
}): KnowledgeRetrievalDiagnostics {
  return {
    status: input.degradedReason
      ? "degraded"
      : input.rows.length === 0
        ? "no_evidence"
        : "ok",
    mode: input.hybridEnabled ? "hybrid" : "semantic",
    hybridEnabled: input.hybridEnabled,
    rerankAttempted: input.rerankAttempted,
    rerankApplied: input.rerankApplied,
    ...(input.degradedReason
      ? { degradedReason: input.degradedReason }
      : {}),
  };
}

async function emitRetrievalDegraded(input: {
  organizationId: string;
  degradedReason: string;
  queryText: string;
  metadata?: Record<string, unknown>;
}) {
  await emitKnowledgeAuditEvent({
    action: KNOWLEDGE_AUDIT_ACTIONS.RETRIEVAL_DEGRADED,
    organizationId: input.organizationId,
    result: "failed",
    metadata: {
      queryLength: input.queryText.length,
      degradedReason: input.degradedReason,
      ...input.metadata,
    },
  });
}

async function emitRerankAuditEvent(input: {
  action:
    | typeof KNOWLEDGE_AUDIT_ACTIONS.RERANK_SKIPPED
    | typeof KNOWLEDGE_AUDIT_ACTIONS.RERANK_UNAVAILABLE
    | typeof KNOWLEDGE_AUDIT_ACTIONS.RERANK_FAILED;
  organizationId: string;
  queryText: string;
  result: "skipped" | "failed";
  reason: string;
  metadata?: Record<string, unknown>;
}) {
  await emitKnowledgeAuditEvent({
    action: input.action,
    organizationId: input.organizationId,
    result: input.result,
    metadata: {
      queryLength: input.queryText.length,
      reason: input.reason,
      ...input.metadata,
    },
  });
}

/**
 * Hybrid retrieval: cosine + full-text search + RRF + optional rerank.
 * Falls back to semantic-only when hybrid is off (Invariant B: source-blind).
 */
export async function retrieveKnowledgeChunksWithDiagnostics(
  organizationId: string,
  queryText: string,
  options?: RetrievalOptions,
): Promise<KnowledgeRetrievalResult> {
  const topK = options?.topK ?? KNOWLEDGE_DEFAULT_TOP_K;
  const rerankTopK = options?.rerankTopK ?? topK;
  const hybridEnabled = options?.hybrid ?? false;
  const rerankAttempted = options?.rerank ?? false;

  const queryEmbedding = await embedKnowledgeText(queryText, {
    telemetry: options?.telemetry,
  });

  if (!hybridEnabled) {
    const semanticRows = await retrieveSemantic(
      organizationId,
      queryEmbedding,
      topK,
    );
    const rows = semanticRows.map((r, i) => ({
      ...r,
      lexicalScore: 0,
      semanticRank: i,
      lexicalRank: 9999,
      fusedRank: 1 / (60 + i + 1),
    }));
    if (options?.rerank) {
      await emitRerankAuditEvent({
        action: KNOWLEDGE_AUDIT_ACTIONS.RERANK_SKIPPED,
        organizationId,
        queryText,
        result: "skipped",
        reason: "semantic-only-mode",
        metadata: { topK, rowCount: rows.length },
      });
    }
    return {
      rows,
      diagnostics: createRetrievalDiagnostics({
        rows,
        hybridEnabled,
        rerankAttempted,
        rerankApplied: false,
      }),
    };
  }

  const semanticRows = await retrieveSemantic(
    organizationId,
    queryEmbedding,
    topK * 2,
  );
  let lexicalRows: LexicalRow[] = [];
  let degradedReason: string | undefined;

  try {
    lexicalRows = await retrieveLexical(organizationId, queryText, topK * 2);
  } catch (error) {
    degradedReason = "lexical-retrieval-failed";
    await emitRetrievalDegraded({
      organizationId,
      degradedReason,
      queryText,
      metadata: {
        topK,
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  const merged = rrfMerge(semanticRows, lexicalRows, topK);

  if (options?.rerank && merged.length === 0) {
    await emitRerankAuditEvent({
      action: KNOWLEDGE_AUDIT_ACTIONS.RERANK_SKIPPED,
      organizationId,
      queryText,
      result: "skipped",
      reason: "no-candidate-rows",
      metadata: { topK },
    });

    return {
      rows: merged,
      diagnostics: createRetrievalDiagnostics({
        rows: merged,
        hybridEnabled,
        rerankAttempted,
        rerankApplied: false,
        degradedReason,
      }),
    };
  }

  if (!options?.rerank || !process.env.RERANK_MODEL?.trim()) {
    if (options?.rerank && !process.env.RERANK_MODEL?.trim()) {
      degradedReason = degradedReason ?? "rerank-model-unavailable";
      await emitRerankAuditEvent({
        action: KNOWLEDGE_AUDIT_ACTIONS.RERANK_UNAVAILABLE,
        organizationId,
        queryText,
        result: "failed",
        reason: "rerank-model-unavailable",
        metadata: { topK, mergedCount: merged.length },
      });
      await emitRetrievalDegraded({
        organizationId,
        degradedReason: "rerank-model-unavailable",
        queryText,
        metadata: { topK, mergedCount: merged.length },
      });
    }

    return {
      rows: merged,
      diagnostics: createRetrievalDiagnostics({
        rows: merged,
        hybridEnabled,
        rerankAttempted,
        rerankApplied: false,
        degradedReason,
      }),
    };
  }

  // Optional rerank step — reorder by a dedicated reranking model
  try {
    const { rerank } = await import("ai");
    const { resolveRerankingModel } = await import("@afenda/ai/server");
    const rerankModelId = process.env.RERANK_MODEL!.trim();

    const rerankResult = await rerank({
      model: resolveRerankingModel(rerankModelId),
      query: queryText,
      documents: merged.map((r) => r.body),
      topN: rerankTopK,
    });

    const reranked = rerankResult.ranking
      .map((ranking) => {
        const original = merged[ranking.originalIndex];
        if (!original) return null;
        return {
          ...original,
          fusedRank: ranking.score,
        };
      })
      .filter(Boolean) as HybridRetrievalRow[];

    const rows = reranked.slice(0, topK);
    return {
      rows,
      diagnostics: createRetrievalDiagnostics({
        rows,
        hybridEnabled,
        rerankAttempted,
        rerankApplied: true,
        degradedReason,
      }),
    };
  } catch (error) {
    degradedReason = degradedReason ?? "rerank-failed";
    await emitRerankAuditEvent({
      action: KNOWLEDGE_AUDIT_ACTIONS.RERANK_FAILED,
      organizationId,
      queryText,
      result: "failed",
      reason: "rerank-failed",
      metadata: {
        topK,
        mergedCount: merged.length,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    await emitRetrievalDegraded({
      organizationId,
      degradedReason: "rerank-failed",
      queryText,
      metadata: {
        topK,
        mergedCount: merged.length,
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return {
      rows: merged,
      diagnostics: createRetrievalDiagnostics({
        rows: merged,
        hybridEnabled,
        rerankAttempted,
        rerankApplied: false,
        degradedReason,
      }),
    };
  }
}

export async function retrieveKnowledgeChunks(
  organizationId: string,
  queryText: string,
  options?: RetrievalOptions,
): Promise<HybridRetrievalRow[]> {
  const result = await retrieveKnowledgeChunksWithDiagnostics(
    organizationId,
    queryText,
    options,
  );
  return result.rows;
}
