import { describe, expect, it, vi } from "vitest";
import type { ModuleId } from "@afenda/config/module-ids";
import { createSolutionProviderTools } from "../../src/tools/lynx.solution-provider-tools.tool.server";

function createWorkspace() {
  return {
    dataMode: "live",
    workItems: [],
    records: [],
    documents: [],
  };
}

async function executeTool<TInput>(
  toolValue: { execute?: unknown },
  input: TInput,
) {
  if (typeof toolValue.execute !== "function") {
    throw new Error("Tool is missing execute.");
  }

  const execute = toolValue.execute as (
    input: TInput,
    options: never,
  ) => Promise<unknown>;

  return execute(input, undefined as never);
}

function createProviderTools(approvalToolEnabled: boolean) {
  const getAllowedWorkspace = vi.fn(async (_moduleId: ModuleId) => ({
    moduleDefinition: {
      label: "Finance",
      ownerTeam: "Finance",
      requiredCapability: "dashboard.view",
    },
    workspace: createWorkspace(),
  }));

  return createSolutionProviderTools({
    organization: {
      id: "org_test",
      capabilities: ["dashboard.view"],
    },
    session: { id: "user_test" },
    model: "gpt-test",
    getModuleDefinition: () => ({
      label: "Finance",
      ownerTeam: "Finance",
      requiredCapability: "dashboard.view",
    }),
    getAllowedWorkspace,
    getWorkspaceStats: () => ({
      recordCount: 0,
      workItemCount: 0,
      highPriorityWorkItemCount: 0,
      documentCount: 0,
      savedViewCount: 0,
    }),
    isApprovalToolEnabled: () => approvalToolEnabled,
    registerSolutionActionProposal: async () => "proposal_1",
    persistActionSandbox: async () => "sandbox_1",
  });
}

describe("solution provider approval-tool entitlement guards", () => {
  it("blocks action proposals when approval-tool is disabled", async () => {
    const tools = createProviderTools(false);

    await expect(
      executeTool(tools.proposeHumanApprovedAction, {
        moduleId: "finance",
        title: "Stabilize gross margin variance",
        rationale:
          "Finance owner validated the diagnostics and requested a tracked remediation action.",
        riskLevel: "medium",
        expectedImpact:
          "Reduce unresolved variance and improve close confidence.",
        sourceRecordIds: ["fin_001"],
        requiredHumanChecks: ["Controller confirmation"],
      }),
    ).rejects.toThrow("Approval tools are disabled for this tenant.");
  });
});
