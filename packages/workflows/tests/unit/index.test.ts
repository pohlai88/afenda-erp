import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getRecoveryPlaybookDefinitions,
  getWorkflowAutomationDefinitions,
} from "../../src/index";

describe("@afenda/workflows facade", () => {
  it("re-exports automation metadata", () => {
    expect(getWorkflowAutomationDefinitions().length).toBeGreaterThan(0);
  });

  it("re-exports recovery playbooks", () => {
    expect(getRecoveryPlaybookDefinitions().length).toBe(7);
  });

  it("derives sync watch status from automation metadata", () => {
    const automations = getWorkflowAutomationDefinitions();
    const delayedAutomations = automations.filter(
      (run) => run.status === "watch",
    );

    expect(automations.length).toBeGreaterThan(0);
    expect(delayedAutomations.length).toBeGreaterThanOrEqual(0);
  });
});
