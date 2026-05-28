import { describe, expect, it } from "vitest";
import { createErpAssistantTools } from "../../src/tools/erp-tools";
import {
  assertGovernedToolPolicy,
  assertGovernedToolset,
  createGovernedToolRegistry,
} from "../../src/tools/governance";
import { createSolutionProviderTools } from "../../src/tools/solution-provider-tools";
import {
  ERP_ASSISTANT_TOOL_IDS,
  SOLUTION_PROVIDER_TOOL_IDS,
  erpAssistantToolMeta,
  solutionProviderToolMeta,
} from "../../src/tools/meta";

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
    getWorkspaceStats: () => ({ recordCount: 0 }),
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

describe("Solution provider tools — needsApproval contracts", () => {
  const org = {
    id: "org_sp",
    name: "Afenda",
    role: "owner" as const,
    capabilities: [...baseOrg.capabilities],
  };
  const toolset = createSolutionProviderTools({
    organization: org,
    session: baseSession,
    model: "anthropic/claude-opus-4.7",
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
    getWorkspaceStats: () => ({ recordCount: 0 }),
    registerSolutionActionProposal: async () => "proposal_sp",
  });

  it("proposeHumanApprovedAction has needsApproval=true", () => {
    expect(toolset.proposeHumanApprovedAction.needsApproval).toBe(true);
  });

  it("analyzeProfitAndLoss does NOT have needsApproval", () => {
    const tool = toolset.analyzeProfitAndLoss as { needsApproval?: boolean };
    expect(tool.needsApproval).toBeFalsy();
  });

  it("passes runtime governed tool policy", () => {
    expect(() =>
      assertGovernedToolset({
        tools: toolset,
        meta: solutionProviderToolMeta,
        capabilities: org.capabilities,
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

describe("Solution provider tool meta — id and meta stability", () => {
  it("SOLUTION_PROVIDER_TOOL_IDS matches expected tool list (stability anchor)", () => {
    expect([...SOLUTION_PROVIDER_TOOL_IDS]).toEqual([
      "analyzeProfitAndLoss",
      "findRevenueLeakage",
      "findCostDrivers",
      "reviewCashConversion",
      "assessInventoryRisk",
      "reviewApprovalThroughput",
      "reviewAuditReadiness",
      "draftRecoveryTasks",
      "proposeHumanApprovedAction",
    ]);
  });

  it("every solution provider tool id has a GovernedToolMeta entry", () => {
    for (const id of SOLUTION_PROVIDER_TOOL_IDS) {
      expect(
        solutionProviderToolMeta[id],
        `Missing meta for ${id}`,
      ).toBeDefined();
    }
  });

  it("proposeHumanApprovedAction is write+high-risk+audit:record", () => {
    const meta = solutionProviderToolMeta.proposeHumanApprovedAction;
    expect(meta?.access).toBe("write");
    expect(meta?.risk).toBe("high");
    expect(meta?.audit).toBe("record");
  });

  it("analysis tools have access:read", () => {
    const readTools: string[] = [
      "analyzeProfitAndLoss",
      "findRevenueLeakage",
      "findCostDrivers",
      "reviewCashConversion",
      "assessInventoryRisk",
    ];
    for (const id of readTools) {
      expect(solutionProviderToolMeta[id]?.access, id).toBe("read");
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
      logger: (event) => events.push(event),
    });

    await (
      tools.safeTool as {
        execute: (input: unknown) => Promise<unknown>;
      }
    ).execute({ token: "raw-token", value: "ok" });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      toolName: "safeTool",
      input: { token: "[redacted]", value: "ok" },
      output: { apiKey: "[redacted]" },
    });
  });
});
