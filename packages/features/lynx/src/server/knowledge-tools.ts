import "server-only";

import { recordGovernedToolAudit, type GovernedToolAuditLogger } from "@afenda/ai";
import {
  getKnowledgeOrgSetting,
  listRecentKnowledgeChunks,
  retrieveKnowledgeChunks,
} from "@afenda/feature-knowledge/server";
import { tool } from "ai";
import { z } from "zod";
import { lynxKnowledgeToolMeta } from "./tool-meta";

const searchKnowledgeInputSchema = z.object({
  query: z.string().trim().min(1).max(500),
});

const recentKnowledgeChunksInputSchema = z.object({
  limit: z.number().int().min(1).max(20).optional().default(5),
});

export type LynxKnowledgeToolsContext = {
  organizationId: string;
  userAuthId?: string;
  recordToolAudit?: GovernedToolAuditLogger;
};

/**
 * Lynx operator knowledge tools — substrate via @afenda/feature-knowledge only.
 * Meta: packages/features/lynx/src/server/tool-meta.ts
 */
export function createLynxKnowledgeTools(context: LynxKnowledgeToolsContext) {
  return {
    searchKnowledge: tool({
      description:
        "Search tenant knowledge for policy, SOP, and guidance passages. Returns evidence excerpts with chunk ids.",
      inputSchema: searchKnowledgeInputSchema,
      execute: async ({ query }) => {
        const orgSetting = await getKnowledgeOrgSetting(context.organizationId);
        const rows = await retrieveKnowledgeChunks(
          context.organizationId,
          query,
          {
            topK: 8,
            hybrid: orgSetting?.retrievalHybridEnabled ?? false,
            rerank: orgSetting?.retrievalRerankEnabled ?? false,
          },
        );

        const output = {
          passages: rows.map((row, index) => ({
            passage: index + 1,
            id: row.id,
            title: row.title,
            excerpt: row.body.slice(0, 600),
          })),
        };

        if (context.userAuthId) {
          await recordGovernedToolAudit({
            logger: context.recordToolAudit,
            toolName: "searchKnowledge",
            meta: lynxKnowledgeToolMeta.searchKnowledge!,
            organizationId: context.organizationId,
            userAuthId: context.userAuthId,
            input: { query },
            output,
          });
        }

        return output;
      },
    }),
    recentKnowledgeChunks: tool({
      description:
        "List recently indexed knowledge chunks for the active organization.",
      inputSchema: recentKnowledgeChunksInputSchema,
      execute: async ({ limit }) => {
        const rows = await listRecentKnowledgeChunks(
          context.organizationId,
          limit,
        );

        return {
          chunks: rows.map((row) => ({
            id: row.id,
            title: row.title,
            excerpt: row.body.slice(0, 400),
            createdAt: row.createdAt.toISOString(),
          })),
        };
      },
    }),
  };
}

export const LYNX_KNOWLEDGE_TOOL_IDS = [
  "searchKnowledge",
  "recentKnowledgeChunks",
] as const;
