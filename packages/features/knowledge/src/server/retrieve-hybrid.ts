import "server-only";

import { asc, cosineDistance, eq, sql } from "drizzle-orm";

import { getDb, knowledgeChunks } from "@afenda/db";

import { KNOWLEDGE_DEFAULT_TOP_K } from "../constants";
import type { HybridRetrievalRow, SimilarChunkRow } from "../types";
import { embedKnowledgeText } from "./embeddings";

export type RetrievalOptions = {
  topK?: number;
  hybrid?: boolean;
  rerank?: boolean;
  rerankTopK?: number;
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

  const tsQueryParam = sql.placeholder("query");

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

  // Suppress unused variable lint for placeholder
  void tsQueryParam;

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

/**
 * Hybrid retrieval: cosine + full-text search + RRF + optional rerank.
 * Falls back to semantic-only when hybrid is off (Invariant B: source-blind).
 */
export async function retrieveKnowledgeChunks(
  organizationId: string,
  queryText: string,
  options?: RetrievalOptions,
): Promise<HybridRetrievalRow[]> {
  const topK = options?.topK ?? KNOWLEDGE_DEFAULT_TOP_K;

  const queryEmbedding = await embedKnowledgeText(queryText);

  if (!options?.hybrid) {
    const semanticRows = await retrieveSemantic(
      organizationId,
      queryEmbedding,
      topK,
    );
    return semanticRows.map((r, i) => ({
      ...r,
      lexicalScore: 0,
      semanticRank: i,
      lexicalRank: 9999,
      fusedRank: 1 / (60 + i + 1),
    }));
  }

  const [semanticRows, lexicalRows] = await Promise.all([
    retrieveSemantic(organizationId, queryEmbedding, topK * 2),
    retrieveLexical(organizationId, queryText, topK * 2),
  ]);

  const merged = rrfMerge(semanticRows, lexicalRows, topK);

  if (!options?.rerank || !process.env.RERANK_MODEL?.trim()) {
    return merged;
  }

  // Optional rerank step — reorder by a dedicated reranking model
  try {
    const { rerank } = await import("ai");
    const { resolveRerankingModel } = await import("@afenda/ai");
    const rerankModelId = process.env.RERANK_MODEL!.trim();

    const rerankResult = await rerank({
      model: resolveRerankingModel(rerankModelId),
      query: queryText,
      documents: merged.map((r) => r.body),
      topN: topK,
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

    return reranked;
  } catch {
    // Graceful fallback if rerank model unavailable
    return merged;
  }
}
