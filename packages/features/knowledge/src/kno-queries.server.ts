import { asc, cosineDistance, count, desc, eq } from "drizzle-orm";

import {
  getDb,
  knowledgeChunks,
  knowledgeDocuments,
  knowledgeOrgSettings,
  knowledgeSources,
} from "@afenda/db";

import type { SimilarChunkRow } from "./kno-retrieval.contract";

export type KnowledgeChunkListRow = {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
};

export type KnowledgeSourceRow = {
  id: string;
  name: string;
  kind: string;
  enabled: boolean;
  lastSyncedAt: Date | null;
  createdAt: Date;
};

export type KnowledgeOrgSettingRow = {
  retrievalHybridEnabled: boolean;
  retrievalRerankEnabled: boolean;
  enforceZdr: boolean;
};

/** Recent chunks for the org knowledge overview — requires org session. */
export async function listRecentKnowledgeChunks(
  organizationId: string,
  limit: number,
): Promise<KnowledgeChunkListRow[]> {
  const db = getDb();
  return db
    .select({
      id: knowledgeChunks.id,
      title: knowledgeChunks.title,
      body: knowledgeChunks.body,
      createdAt: knowledgeChunks.createdAt,
    })
    .from(knowledgeChunks)
    .where(eq(knowledgeChunks.organizationId, organizationId))
    .orderBy(desc(knowledgeChunks.createdAt))
    .limit(limit);
}

/** Tenant-scoped cosine similarity search — requires org session. */
export async function findSimilarKnowledgeChunks(
  organizationId: string,
  queryEmbedding: number[],
  limit: number,
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
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt,
    distance: Number(r.distance),
  }));
}

/** List knowledge sources for an org. */
export async function listKnowledgeSources(
  organizationId: string,
): Promise<KnowledgeSourceRow[]> {
  const db = getDb();
  return db
    .select({
      id: knowledgeSources.id,
      name: knowledgeSources.name,
      kind: knowledgeSources.kind,
      enabled: knowledgeSources.enabled,
      lastSyncedAt: knowledgeSources.lastSyncedAt,
      createdAt: knowledgeSources.createdAt,
    })
    .from(knowledgeSources)
    .where(eq(knowledgeSources.organizationId, organizationId))
    .orderBy(desc(knowledgeSources.createdAt));
}

/** Count chunks for an org. */
export async function countKnowledgeChunks(
  organizationId: string,
): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ value: count() })
    .from(knowledgeChunks)
    .where(eq(knowledgeChunks.organizationId, organizationId));
  return rows[0]?.value ?? 0;
}

/** Count documents for an org. */
export async function countKnowledgeDocuments(
  organizationId: string,
): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ value: count() })
    .from(knowledgeDocuments)
    .where(eq(knowledgeDocuments.organizationId, organizationId));
  return rows[0]?.value ?? 0;
}

/** Org retrieval settings — returns null if not configured. */
export async function getKnowledgeOrgSetting(
  organizationId: string,
): Promise<KnowledgeOrgSettingRow | null> {
  const db = getDb();
  const rows = await db
    .select({
      retrievalHybridEnabled: knowledgeOrgSettings.retrievalHybridEnabled,
      retrievalRerankEnabled: knowledgeOrgSettings.retrievalRerankEnabled,
      enforceZdr: knowledgeOrgSettings.enforceZdr,
    })
    .from(knowledgeOrgSettings)
    .where(eq(knowledgeOrgSettings.organizationId, organizationId))
    .limit(1);

  return rows[0] ?? null;
}
