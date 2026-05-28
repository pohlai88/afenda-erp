import "server-only";

import { recordGovernedToolAudit, type GovernedToolAuditLogger } from "@afenda/ai";
import { tool } from "ai";
import { z } from "zod";
import type { LynxReadinessSnapshot } from "../readiness-contract";
import { lynxKnowledgeToolMeta } from "./tool-meta";

const inspectLynxReadinessInputSchema = z.object({
  includeModules: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
});

export function createLynxReadinessTools(input: {
  organizationId: string;
  userAuthId: string;
  snapshot: LynxReadinessSnapshot;
  recordToolAudit?: GovernedToolAuditLogger;
}) {
  return {
    inspectLynxReadiness: tool({
      description:
        "Inspect tenant-scoped Lynx readiness across Knowledge, module substrate, eval gates, and enterprise controls. This is read-only.",
      inputSchema: inspectLynxReadinessInputSchema,
      execute: async ({ includeModules }) => {
        const moduleFilter = new Set(includeModules ?? []);
        const output = {
          ...input.snapshot,
          modules:
            moduleFilter.size > 0
              ? input.snapshot.modules.filter((module) =>
                  moduleFilter.has(module.moduleId),
                )
              : input.snapshot.modules,
        };

        await recordGovernedToolAudit({
          logger: input.recordToolAudit,
          toolName: "inspectLynxReadiness",
          meta: lynxKnowledgeToolMeta.inspectLynxReadiness!,
          organizationId: input.organizationId,
          userAuthId: input.userAuthId,
          input: { includeModules },
          output,
        });

        return output;
      },
    }),
  };
}

export const LYNX_READINESS_TOOL_IDS = ["inspectLynxReadiness"] as const;
