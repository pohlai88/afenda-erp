import { describe, expect, it } from "vitest";
import {
  businessProblemTypes,
  getSolutionToolModuleBindings,
  solutionToolModuleBindings,
  solutionWorkflowIds,
} from "../../src/modules/solution-playbooks";
import { getRecoveryPlaybookDefinitions } from "../../src/modules/workflow-metadata";

describe("solution provider metadata", () => {
  it("aligns workflow ids with playbook definitions", () => {
    const playbooks = getRecoveryPlaybookDefinitions();

    expect(playbooks).toHaveLength(solutionWorkflowIds.length);
    expect(playbooks.map((playbook) => playbook.workflowId)).toEqual([
      ...solutionWorkflowIds,
    ]);
  });

  it("aligns problem types with playbook definitions", () => {
    const playbooks = getRecoveryPlaybookDefinitions();

    expect(playbooks.map((playbook) => playbook.problemType)).toEqual([
      ...businessProblemTypes,
    ]);
  });

  it("exposes tool bindings for every recovery playbook workflow", () => {
    const bindings = getSolutionToolModuleBindings();
    const playbookWorkflowIds = getRecoveryPlaybookDefinitions().map(
      (playbook) => playbook.workflowId,
    );

    expect(Object.keys(bindings)).toEqual([
      "analyzeProfitAndLoss",
      "findRevenueLeakage",
      "findCostDrivers",
      "reviewCashConversion",
      "assessInventoryRisk",
      "reviewApprovalThroughput",
      "reviewAuditReadiness",
    ]);
    expect(Object.keys(bindings).length).toBeGreaterThanOrEqual(
      playbookWorkflowIds.length,
    );
    expect(solutionToolModuleBindings.reviewApprovalThroughput).toContain(
      "approvals",
    );
    expect(solutionToolModuleBindings.reviewAuditReadiness).toContain(
      "reports",
    );
  });
});
