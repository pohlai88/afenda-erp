import { describe, expect, it } from "vitest";
import {
  LYNX_ERP_READ_TOOL_IDS,
  lynxErpReadToolInputSchema,
  lynxErpReadToolOutputSchema,
} from "../../src/lyn-erp-read-tools.contract";
import { lynxToolMeta } from "../../src/lyn-tool-meta";

describe("Lynx ERP read tools contract", () => {
  it("keeps tool inputs tenant-safe", () => {
    const parsed = lynxErpReadToolInputSchema.parse({});

    expect(parsed).toEqual({ limit: 5, includeEvidence: true });
    expect(
      lynxErpReadToolInputSchema.safeParse({ organizationId: "org_1" }).success,
    ).toBe(false);
    expect(Object.keys(parsed)).not.toContain("organizationId");
  });

  it("parses a serializable ERP read tool output", () => {
    const output = lynxErpReadToolOutputSchema.parse({
      source: "tenant-erp-read-tool",
      organizationId: "org_1",
      toolName: "inspectFinanceSignals",
      generatedAt: new Date().toISOString(),
      readinessStatus: "partial",
      summary: "Finance has open control pressure.",
      modules: [
        {
          moduleId: "finance",
          moduleLabel: "Finance",
          readinessStatus: "partial",
          dataMode: "persisted",
          fallbackApplied: false,
          stats: {
            recordCount: 1,
            workItemCount: 1,
            highPriorityWorkItemCount: 1,
            documentCount: 0,
            savedViewCount: 2,
          },
        },
      ],
      signals: [
        {
          id: "finance-blocked-records",
          moduleId: "finance",
          label: "Blocked finance records",
          status: "partial",
          value: "1",
          detail: "Blocked finance records indicate control exceptions.",
        },
      ],
      evidence: [
        {
          id: "erp_1",
          type: "record",
          moduleId: "finance",
          label: "FIN-001",
          signal: "blocked close-control",
          href: "/finance/records/erp_1",
        },
      ],
      missingData: [],
      safeNextActions: ["Review finance evidence."],
    });

    expect(output.source).toBe("tenant-erp-read-tool");
  });

  it("declares governed metadata for every ERP read tool", () => {
    for (const id of LYNX_ERP_READ_TOOL_IDS) {
      const meta = lynxToolMeta[id];
      expect(meta, `Missing meta for ${id}`).toBeDefined();
      expect(meta?.access).toBe("read");
      expect(meta?.risk).toBe("low");
      expect(meta?.audit).toBe("record");
    }
  });
});
