import { describe, expect, it, vi } from "vitest";
import { createErpAssistantTools } from "../../src/tools/ai.erp-tools.tool.server";
import { createSolutionProviderTools } from "../../src/tools/ai.solution-provider-tools.tool.server";
import type { ModuleId } from "@afenda/config/module-ids";

function createWorkspace() {
  return {
    dataMode: "live",
    workItems: [],
    records: [],
    documents: [],
  };
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
    }),
    isApprovalToolEnabled: () => approvalToolEnabled,
    registerApprovalProposal: async () => "proposal_1",
    persistActionSandbox: async () => "sandbox_1",
  });
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
    }),
    isApprovalToolEnabled: () => approvalToolEnabled,
    registerSolutionActionProposal: async () => "proposal_1",
    persistActionSandbox: async () => "sandbox_1",
  });
}

describe("approval-tool entitlement guards", () => {
  it("blocks ERP approval proposals when approval-tool is disabled", async () => {
    const tools = createAssistantTools(false);

    await expect(
      tools.proposeApprovalDecision.execute({
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
      tools.proposeApprovalDecision.execute({
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

  it("blocks Solution Provider action proposals when approval-tool is disabled", async () => {
    const tools = createProviderTools(false);

    await expect(
      tools.proposeHumanApprovedAction.execute({
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
