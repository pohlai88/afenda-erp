import { listLynxEvalRuns } from "./knowledge.eval.server";
import {
  countKnowledgeChunks,
  countKnowledgeDocuments,
  getKnowledgeOrgSetting,
  listKnowledgeSources,
  listRecentKnowledgeChunks,
} from "./knowledge.queries.server";

export type KnowledgeAdminPageModel = {
  sources: Awaited<ReturnType<typeof listKnowledgeSources>>;
  recentChunks: Awaited<ReturnType<typeof listRecentKnowledgeChunks>>;
  chunkCount: number;
  documentCount: number;
  orgSetting: Awaited<ReturnType<typeof getKnowledgeOrgSetting>>;
  evalRuns: Awaited<ReturnType<typeof listLynxEvalRuns>>;
};

const KNOWLEDGE_ADMIN_RECENT_CHUNK_LIMIT = 10;
const KNOWLEDGE_ADMIN_EVAL_RUN_LIMIT = 20;

/** In-process admin read model — ARCH-1003 server query path. */
export async function loadKnowledgeAdminPageModel(input: {
  organizationId: string;
}): Promise<KnowledgeAdminPageModel> {
  const { organizationId } = input;

  const [
    sources,
    recentChunks,
    chunkCount,
    documentCount,
    orgSetting,
    evalRuns,
  ] = await Promise.all([
    listKnowledgeSources(organizationId),
    listRecentKnowledgeChunks(organizationId, KNOWLEDGE_ADMIN_RECENT_CHUNK_LIMIT),
    countKnowledgeChunks(organizationId),
    countKnowledgeDocuments(organizationId),
    getKnowledgeOrgSetting(organizationId),
    listLynxEvalRuns(organizationId, KNOWLEDGE_ADMIN_EVAL_RUN_LIMIT),
  ]);

  return {
    sources,
    recentChunks,
    chunkCount,
    documentCount,
    orgSetting,
    evalRuns,
  };
}
