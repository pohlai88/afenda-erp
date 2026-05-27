import { describe, expect, it } from "vitest";
import {
  getRecoveryPlaybookDefinitions,
  getResolvedWorkflowAutomationRuns,
  getWorkflowAutomationDefinitions,
} from "../../src/index";

describe("workflow metadata", () => {
  it("serializes automation definitions", () => {
    const automations = getWorkflowAutomationDefinitions();

    expect(automations.length).toBeGreaterThan(0);
    expect(automations[0]?.id).toBeTruthy();
  });

  it("serializes recovery playbooks", () => {
    const playbooks = getRecoveryPlaybookDefinitions();

    expect(playbooks).toHaveLength(7);
    expect(playbooks.map((playbook) => playbook.id)).toEqual([
      "negative-pnl",
      "cash-flow",
      "revenue-leakage",
      "cost-drivers",
      "inventory",
      "approvals",
      "audit-readiness",
    ]);
    expect(playbooks[0]?.label).toBe("Recover negative P&L");
    expect(playbooks[0]?.problemType).toBe("negative_pnl");
  });

  it("returns metadata-mode automation runs without database access", async () => {
    const runs = await getResolvedWorkflowAutomationRuns({
      organizationId: "org_demo",
      dataMode: "metadata",
    });

    expect(runs).toHaveLength(getWorkflowAutomationDefinitions().length);
    expect(runs[0]?.name).toBe("Approval SLA sweep");
  });
});
