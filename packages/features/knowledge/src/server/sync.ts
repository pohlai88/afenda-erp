import "server-only";

import { eq } from "drizzle-orm";

import { getDb, knowledgeSources } from "@afenda/db";

import { KNOWLEDGE_AUDIT_ACTIONS } from "../constants";
import type { KnowledgeSourceKind } from "../constants";
import { commitKnowledgeDocument } from "./pipeline-commit";
import { getKnowledgeSourceAdapter } from "./source-adapter-registry";

export type SyncSourceResult = {
  sourceId: string;
  documentsCommitted: number;
  documentsSkipped: number;
  chunksInserted: number;
  error?: string;
};

export type SyncOrgResult = {
  sources: SyncSourceResult[];
  totalCommitted: number;
  totalSkipped: number;
  totalChunks: number;
  errors: number;
};

function auditLog(action: string, data: Record<string, unknown>): void {
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
 * Sync a single knowledge source.
 * Calls the appropriate adapter → commits each yielded document.
 * Non-WDK: triggered from cron or manual Server Action.
 */
export async function syncKnowledgeSource(
  organizationId: string,
  sourceId: string,
): Promise<SyncSourceResult> {
  const db = getDb();

  const sourceRows = await db
    .select({
      id: knowledgeSources.id,
      kind: knowledgeSources.kind,
      config: knowledgeSources.config,
      enabled: knowledgeSources.enabled,
    })
    .from(knowledgeSources)
    .where(eq(knowledgeSources.id, sourceId))
    .limit(1);

  const source = sourceRows[0];
  if (!source) {
    return {
      sourceId,
      documentsCommitted: 0,
      documentsSkipped: 0,
      chunksInserted: 0,
      error: "Source not found",
    };
  }

  if (!source.enabled) {
    return {
      sourceId,
      documentsCommitted: 0,
      documentsSkipped: 0,
      chunksInserted: 0,
      error: "Source is disabled",
    };
  }

  const adapter = getKnowledgeSourceAdapter(
    source.kind as KnowledgeSourceKind,
  );
  if (!adapter) {
    return {
      sourceId,
      documentsCommitted: 0,
      documentsSkipped: 0,
      chunksInserted: 0,
      error: `No adapter registered for kind: ${source.kind}`,
    };
  }

  const parsedConfig = adapter.configSchema.safeParse(source.config);
  if (!parsedConfig.success) {
    return {
      sourceId,
      documentsCommitted: 0,
      documentsSkipped: 0,
      chunksInserted: 0,
      error: `Invalid source config: ${parsedConfig.error.message}`,
    };
  }

  let committed = 0;
  let skipped = 0;
  let chunks = 0;
  const errors: string[] = [];

  try {
    for await (const doc of adapter.listDocuments(
      { organizationId },
      parsedConfig.data,
    )) {
      try {
        const result = await commitKnowledgeDocument({
          organizationId,
          sourceId,
          document: doc,
        });

        if (result.skipped) {
          skipped++;
        } else {
          committed++;
          chunks += result.chunksInserted;
        }
      } catch (err) {
        errors.push(
          `Document ${doc.externalId}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    auditLog(KNOWLEDGE_AUDIT_ACTIONS.SOURCE_SYNC_COMPLETE, {
      organizationId,
      sourceId,
      committed,
      skipped,
      chunks,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    auditLog(KNOWLEDGE_AUDIT_ACTIONS.SOURCE_SYNC_FAIL, {
      organizationId,
      sourceId,
      error: errorMsg,
    });
    return {
      sourceId,
      documentsCommitted: committed,
      documentsSkipped: skipped,
      chunksInserted: chunks,
      error: errorMsg,
    };
  }

  return {
    sourceId,
    documentsCommitted: committed,
    documentsSkipped: skipped,
    chunksInserted: chunks,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

/**
 * Sync all enabled knowledge sources for an org.
 */
export async function syncOrgKnowledge(
  organizationId: string,
): Promise<SyncOrgResult> {
  const db = getDb();

  const sources = await db
    .select({ id: knowledgeSources.id })
    .from(knowledgeSources)
    .where(eq(knowledgeSources.organizationId, organizationId));

  const results = await Promise.allSettled(
    sources.map((s) => syncKnowledgeSource(organizationId, s.id)),
  );

  const sourceResults: SyncSourceResult[] = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      sourceId: sources[i]?.id ?? "unknown",
      documentsCommitted: 0,
      documentsSkipped: 0,
      chunksInserted: 0,
      error: r.reason instanceof Error ? r.reason.message : String(r.reason),
    };
  });

  return {
    sources: sourceResults,
    totalCommitted: sourceResults.reduce(
      (acc, s) => acc + s.documentsCommitted,
      0,
    ),
    totalSkipped: sourceResults.reduce((acc, s) => acc + s.documentsSkipped, 0),
    totalChunks: sourceResults.reduce((acc, s) => acc + s.chunksInserted, 0),
    errors: sourceResults.filter((s) => Boolean(s.error)).length,
  };
}
