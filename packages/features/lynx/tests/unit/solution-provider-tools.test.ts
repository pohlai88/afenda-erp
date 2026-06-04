import { describe, expect, it } from "vitest";
import { assertGovernedToolset } from "@afenda/ai/server";
import { createSolutionProviderTools } from "../../src/lyn-solution-provider-tools.tool.server";
import {
  SOLUTION_PROVIDER_TOOL_IDS,
  solutionProviderToolMeta,
} from "../../src/lyn-solution-provider-tool-meta";

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
    getWorkspaceStats: () => emptyWorkspaceStats,
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
