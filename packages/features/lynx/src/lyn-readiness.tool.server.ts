import {
  recordGovernedToolAudit,
  type GovernedToolAuditLogger,
} from "@afenda/ai/server";
import { tool } from "ai";
import type { LynxReadinessSnapshot } from "./lyn-readiness-contract";
import { inspectLynxReadinessInputSchema } from "./lyn-readiness-tools-schema";
import { lynxReadinessToolMeta } from "./lynx.tool-meta";

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
          meta: lynxReadinessToolMeta.inspectLynxReadiness,
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
