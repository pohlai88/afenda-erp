import { describe, expect, it } from "vitest";
import { createErpAssistantTools } from "../../src/ai-erp-tools.tool.server";
import {
  assertGovernedToolPolicy,
  assertGovernedToolset,
  createGovernedToolRegistry,
  redactGovernedToolAuditValue,
} from "../../src/ai-governance.tool.server";
import {
  ERP_ASSISTANT_TOOL_IDS,
  erpAssistantToolMeta,
} from "../../src/ai-tool.meta";

const baseOrg = {
  id: "org_test",
  capabilities: [
    "finance.view",
    "finance.approve",
    "dashboard.view",
    "system-admin.view",
  ],
};
const baseSession = { id: "user_test" };
const baseModuleDef = {
  label: "Finance",
  ownerTeam: "Finance",
  requiredCapability: "finance.view" as const,
};

const emptyWorkspaceStats = {
  recordCount: 0,
  workItemCount: 0,
  highPriorityWorkItemCount: 0,
  documentCount: 0,
  savedViewCount: 0,
};

describe("ERP assistant tools — needsApproval contracts", () => {
  const toolset = createErpAssistantTools({
    organization: baseOrg,
    session: baseSession,
    model: "openai/gpt-5.5",
    getModuleDefinition: () => baseModuleDef,
    getAllowedWorkspace: async () => ({
      moduleDefinition: baseModuleDef,
      workspace: {
        dataMode: "metadata" as const,
        workItems: [],
        records: [],
        documents: [],
      },
    }),
    getWorkspaceStats: () => emptyWorkspaceStats,
    registerApprovalProposal: async () => "proposal_test",
  });

  it("proposeApprovalDecision has needsApproval=true", () => {
    expect(toolset.proposeApprovalDecision.needsApproval).toBe(true);
  });

  it("searchRecords does NOT have needsApproval", () => {
    expect((toolset as Record<string, unknown>).searchRecords).toBeDefined();
    const tool = toolset.searchRecords as { needsApproval?: boolean };
    expect(tool.needsApproval).toBeFalsy();
  });

  it("passes runtime governed tool policy", () => {
    expect(() =>
      assertGovernedToolset({
        tools: toolset,
        meta: erpAssistantToolMeta,
        capabilities: baseOrg.capabilities,
      }),
    ).not.toThrow();
  });
});

describe("ERP assistant tool meta — id and meta stability", () => {
  it("ERP_ASSISTANT_TOOL_IDS matches expected tool list (stability anchor)", () => {
    expect([...ERP_ASSISTANT_TOOL_IDS]).toEqual([
      "summarizeWorkspace",
      "searchRecords",
      "lookupDocument",
      "draftTask",
      "proposeApprovalDecision",
    ]);
  });

  it("every ERP tool id has a GovernedToolMeta entry", () => {
    for (const id of ERP_ASSISTANT_TOOL_IDS) {
      expect(erpAssistantToolMeta[id], `Missing meta for ${id}`).toBeDefined();
    }
  });

  it("every ERP tool meta has all required fields", () => {
    const requiredFields = [
      "risk",
      "category",
      "access",
      "dataSensitivity",
      "audit",
    ] as const;
    for (const id of ERP_ASSISTANT_TOOL_IDS) {
      const meta = erpAssistantToolMeta[id];
      for (const field of requiredFields) {
        expect(meta?.[field], `Missing ${field} in ${id}`).toBeDefined();
      }
    }
  });

  it("proposeApprovalDecision is write+high-risk+audit:record", () => {
    const meta = erpAssistantToolMeta.proposeApprovalDecision;
    expect(meta?.access).toBe("write");
    expect(meta?.risk).toBe("high");
    expect(meta?.audit).toBe("record");
  });

  it("read tools have access:read", () => {
    const readTools: string[] = [
      "summarizeWorkspace",
      "searchRecords",
      "lookupDocument",
      "draftTask",
    ];
    for (const id of readTools) {
      expect(erpAssistantToolMeta[id]?.access, id).toBe("read");
    }
  });
});

describe("Runtime governed tool registry", () => {
  it("blocks missing metadata at execution boundary", () => {
    expect(() =>
      assertGovernedToolPolicy({
        toolName: "missingMetaTool",
        tool: { execute: async () => ({ ok: true }) },
        meta: undefined,
        capabilities: baseOrg.capabilities,
      }),
    ).toThrow("Missing GovernedToolMeta");
  });

  it("blocks high-sensitivity tools without the required capability", () => {
    expect(() =>
      assertGovernedToolPolicy({
        toolName: "sensitiveTool",
        tool: { execute: async () => ({ ok: true }) },
        meta: {
          risk: "low",
          category: "operations",
          access: "read",
          dataSensitivity: "high",
          audit: "record",
        },
        capabilities: ["dashboard.view"],
      }),
    ).toThrow();
  });

  it("blocks write tools that do not require approval", () => {
    expect(() =>
      assertGovernedToolPolicy({
        toolName: "unsafeWriteTool",
        tool: { execute: async () => ({ ok: true }) },
        meta: {
          risk: "high",
          category: "operations",
          access: "write",
          dataSensitivity: "medium",
          audit: "record",
        },
        capabilities: baseOrg.capabilities,
      }),
    ).toThrow("must require approval");
  });

  it("audits record-enabled tool execution with redacted payloads", async () => {
    const events: unknown[] = [];
    const { tools } = createGovernedToolRegistry({
      tools: {
        safeTool: {
          execute: async (input: unknown) => ({ input, apiKey: "secret" }),
        },
      },
      meta: {
        safeTool: {
          risk: "low",
          category: "operations",
          access: "read",
          dataSensitivity: "low",
          audit: "record",
        },
      },
      capabilities: baseOrg.capabilities,
      organizationId: baseOrg.id,
      userAuthId: baseSession.id,
      logger: (event) => {
        events.push(event);
      },
    });

    await (
      tools.safeTool as {
        execute: (input: unknown, options?: unknown) => Promise<unknown>;
      }
    ).execute({ token: "raw-token", value: "ok" }, undefined);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      toolName: "safeTool",
      input: { token: "[redacted]", value: "ok" },
      output: { apiKey: "[redacted]" },
    });
  });
});

describe("Governed audit redaction", () => {
  it("bounds nested objects, circular references, and long strings", () => {
    const circular: Record<string, unknown> = { value: "ok" };
    circular.self = circular;
    circular.deep = { next: { final: "too deep" } };

    const redacted = redactGovernedToolAuditValue(
      {
        authorization: "Bearer secret",
        longText: "x".repeat(20),
        circular,
      },
      {
        maxDepth: 2,
        maxStringLength: 5,
      },
    );

    expect(redacted).toMatchObject({
      authorization: "[redacted]",
      longText: "xxxxx...[truncated]",
      circular: {
        value: "ok",
        self: "[circular]",
        deep: "[truncated-depth]",
      },
    });
  });

  it("limits large arrays and object key counts", () => {
    const input = Object.fromEntries(
      Array.from({ length: 5 }, (_, index) => [`key${index}`, index]),
    );

    const redacted = redactGovernedToolAuditValue(
      {
        list: [1, 2, 3, 4],
        object: input,
      },
      {
        maxArrayItems: 2,
        maxObjectKeys: 3,
      },
    );

    expect(redacted).toMatchObject({
      list: [1, 2, "[truncated-array:2]"],
      object: {
        key0: 0,
        key1: 1,
        key2: 2,
        __truncatedKeys: 2,
      },
    });
  });
});
