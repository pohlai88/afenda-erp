import {
  recordGovernedToolAudit,
  type GovernedToolAuditLogger,
} from "@afenda/ai/server";
import {
  getKnowledgeOrgSetting,
  listRecentKnowledgeChunks,
  retrieveKnowledgeChunksWithDiagnostics,
} from "@afenda/feature-knowledge/server";
import { tool } from "ai";
import {
  recentKnowledgeChunksInputSchema,
  searchKnowledgeInputSchema,
} from "../schemas/lynx.knowledge-tools.schema";
import { lynxKnowledgeToolMeta } from "./lynx.tool-meta";

export type LynxKnowledgeToolsContext = {
  organizationId: string;
  userAuthId?: string;
  recordToolAudit?: GovernedToolAuditLogger;
};

/**
 * Lynx operator knowledge tools — substrate via @afenda/feature-knowledge only.
 * Meta: packages/features/lynx/src/tools/lynx.tool-meta.ts
 */
export function createLynxKnowledgeTools(context: LynxKnowledgeToolsContext) {
  return {
    searchKnowledge: tool({
      description:
        "Search tenant knowledge for policy, SOP, and guidance passages. Returns evidence excerpts with chunk ids.",
      inputSchema: searchKnowledgeInputSchema,
      execute: async ({ query }) => {
        const orgSetting = await getKnowledgeOrgSetting(context.organizationId);
        const retrievalResult = await retrieveKnowledgeChunksWithDiagnostics(
          context.organizationId,
          query,
          {
            topK: 8,
            hybrid: orgSetting?.retrievalHybridEnabled ?? false,
            rerank: orgSetting?.retrievalRerankEnabled ?? false,
            telemetry: {
              organizationId: context.organizationId,
              userId: context.userAuthId,
              feature: "knowledge-retrieval",
              moduleId: "lynx",
            },
          },
        );
        const rows = retrievalResult.rows;

        const output = {
          diagnostics: retrievalResult.diagnostics,
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
            meta: lynxKnowledgeToolMeta.searchKnowledge,
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
