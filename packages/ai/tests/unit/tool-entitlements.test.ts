import { describe, expect, it } from "vitest";
import { createErpAssistantTools } from "../../src/tools/ai.erp-tools.tool.server";

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

function createAssistantTools(approvalToolEnabled: boolean) {
  return createErpAssistantTools({
    organization: {
      id: "org_test",
      capabilities: ["approvals.manage", "dashboard.view"],
    },
    session: { id: "user_test" },
    model: "gpt-test",
    getModuleDefinition: () => ({
      label: "Approvals",
      ownerTeam: "Finance",
      requiredCapability: "approvals.manage",
    }),
    getAllowedWorkspace: async () => ({
      moduleDefinition: {
        label: "Approvals",
        ownerTeam: "Finance",
        requiredCapability: "approvals.manage",
      },
      workspace: createWorkspace(),
    }),
    getWorkspaceStats: () => ({
      recordCount: 0,
      workItemCount: 0,
      highPriorityWorkItemCount: 0,
      documentCount: 0,
      savedViewCount: 0,
    }),
    isApprovalToolEnabled: () => approvalToolEnabled,
    registerApprovalProposal: async () => "proposal_1",
    persistActionSandbox: async () => "sandbox_1",
  });
}

describe("approval-tool entitlement guards", () => {
  it("blocks ERP approval proposals when approval-tool is disabled", async () => {
    const tools = createAssistantTools(false);

    await expect(
      executeTool(tools.proposeApprovalDecision, {
        moduleId: "approvals",
        proposedAction: "approve",
        rationale: "Manual review completed and requirements are satisfied.",
        riskLevel: "low",
        requiredHumanChecks: ["Confirm policy match"],
      }),
    ).rejects.toThrow("Approval tools are disabled for this tenant.");
  });

  it("allows ERP approval proposals when approval-tool is enabled", async () => {
    const tools = createAssistantTools(true);

    await expect(
      executeTool(tools.proposeApprovalDecision, {
        moduleId: "approvals",
        proposedAction: "approve",
        rationale: "Manual review completed and requirements are satisfied.",
        riskLevel: "low",
        requiredHumanChecks: ["Confirm policy match"],
      }),
    ).resolves.toMatchObject({
      proposalId: "proposal_1",
      status: "approved",
      approvalState: "human-approved",
    });
  });
});
