import "server-only";

import { and, eq, inArray } from "drizzle-orm";

import {
  getDb,
  knowledgeChunks,
  knowledgeDocuments,
  knowledgeOrgSettings,
  knowledgeSources,
  digestKnowledgeDocument,
} from "@afenda/db";

import { KNOWLEDGE_AUDIT_ACTIONS } from "../constants";
import type { RawKnowledgeDocument } from "../types";
import { embedKnowledgeBatch } from "./embeddings";
import type { KnowledgeChunk } from "./chunker";
import { chunkKnowledgeDocument } from "./chunker";

export type CommitDocumentResult = {
  documentId: string;
  chunksInserted: number;
  chunksDeleted: number;
  skipped: boolean;
};

export type CommitDocumentArgs = {
  organizationId: string;
  sourceId: string;
  document: RawKnowledgeDocument;
};

function auditLog(action: string, data: Record<string, unknown>): void {
  // Structured audit via console for serverless — swap for logServerEvent when audit service is available here.
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      audit: true,
      action,
      ...data,
    }),
  );
}

/**
 * Commit a single document to the knowledge store.
 *
 * Flow:
 * 1. Hash the incoming doc — skip if digest unchanged.
 * 2. Re-chunk.
 * 3. Batch-embed chunks.
 * 4. In a transaction: delete old chunks, upsert document, insert new chunks.
 *
 * Invariant C enforced: embedding runs inside this function, not in a Route Handler.
 */
export async function commitKnowledgeDocument(
  args: CommitDocumentArgs,
): Promise<CommitDocumentResult> {
  const { organizationId, sourceId, document } = args;
  const db = getDb();

  const newDigest = digestKnowledgeDocument({
    externalId: document.externalId,
    title: document.title,
    body: document.body,
  });

  // Check for existing document
  const existingRows = await db
    .select({
      id: knowledgeDocuments.id,
      inputDigest: knowledgeDocuments.inputDigest,
    })
    .from(knowledgeDocuments)
    .where(
      and(
        eq(knowledgeDocuments.sourceId, sourceId),
        eq(knowledgeDocuments.externalId, document.externalId),
        eq(knowledgeDocuments.organizationId, organizationId),
      ),
    )
    .limit(1);

  const existing = existingRows[0];

  if (existing?.inputDigest === newDigest) {
    return {
      documentId: existing.id,
      chunksInserted: 0,
      chunksDeleted: 0,
      skipped: true,
    };
  }

  // Get per-org ZDR setting
  const orgSettingRows = await db
    .select({ enforceZdr: knowledgeOrgSettings.enforceZdr })
    .from(knowledgeOrgSettings)
    .where(eq(knowledgeOrgSettings.organizationId, organizationId))
    .limit(1);
  const enforceZdr = orgSettingRows[0]?.enforceZdr ?? false;

  // Chunk and embed
  const rawChunks: KnowledgeChunk[] = chunkKnowledgeDocument({
    title: document.title,
    body: document.body,
  });

  const chunkTexts = rawChunks.map((c) => c.body);
  const { embeddingModelVersion, vectors } = await embedKnowledgeBatch(
    organizationId,
    chunkTexts,
    { enforceZdr },
  );

  const documentId = existing?.id ?? crypto.randomUUID();
  const now = new Date();

  // Transaction: delete old chunks, upsert document, insert new chunks
  await db.transaction(async (tx) => {
    // Delete old chunks if the document existed
    let chunksDeleted = 0;
    if (existing) {
      const oldChunks = await tx
        .select({ id: knowledgeChunks.id })
        .from(knowledgeChunks)
        .where(
          and(
            eq(knowledgeChunks.documentId, existing.id),
            eq(knowledgeChunks.organizationId, organizationId),
          ),
        );
      if (oldChunks.length > 0) {
        await tx.delete(knowledgeChunks).where(
          inArray(
            knowledgeChunks.id,
            oldChunks.map((r) => r.id),
          ),
        );
        chunksDeleted = oldChunks.length;
      }

      // Update existing document
      await tx
        .update(knowledgeDocuments)
        .set({
          title: document.title,
          body: document.body,
          inputDigest: newDigest,
          tokenCount: rawChunks.reduce((acc, c) => acc + c.tokenCount, 0),
          embeddingModelVersion,
          lastEmbeddedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(knowledgeDocuments.id, existing.id),
            eq(knowledgeDocuments.organizationId, organizationId),
          ),
        );
    } else {
      // Insert new document
      await tx.insert(knowledgeDocuments).values({
        id: documentId,
        organizationId,
        sourceId,
        externalId: document.externalId,
        title: document.title,
        body: document.body,
        inputDigest: newDigest,
        tokenCount: rawChunks.reduce((acc, c) => acc + c.tokenCount, 0),
        embeddingModelVersion,
        lastEmbeddedAt: now,
      });
    }

    // Insert new chunks with embeddings
    const chunkRows = rawChunks.map((chunk, i) => ({
      id: crypto.randomUUID(),
      organizationId,
      documentId,
      chunkIndex: chunk.index,
      tokenCount: chunk.tokenCount,
      embeddingModelVersion,
      title: chunk.title,
      body: chunk.body,
      embedding: vectors[i]!,
    }));

    if (chunkRows.length > 0) {
      await tx.insert(knowledgeChunks).values(chunkRows);
    }

    // Update source lastSyncedAt
    await tx
      .update(knowledgeSources)
      .set({ lastSyncedAt: now, updatedAt: now })
      .where(
        and(
          eq(knowledgeSources.id, sourceId),
          eq(knowledgeSources.organizationId, organizationId),
        ),
      );

    auditLog(KNOWLEDGE_AUDIT_ACTIONS.DOCUMENT_EMBEDDED, {
      organizationId,
      sourceId,
      documentId,
      externalId: document.externalId,
      chunksInserted: chunkRows.length,
    });

    return { chunksDeleted };
  });

  return {
    documentId,
    chunksInserted: rawChunks.length,
    chunksDeleted: existing ? rawChunks.length : 0,
    skipped: false,
  };
}
