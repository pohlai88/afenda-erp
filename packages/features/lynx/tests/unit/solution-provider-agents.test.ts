import { beforeEach, describe, expect, it, vi } from "vitest";

const aiMocks = vi.hoisted(() => ({
  stepCountIs: vi.fn((count: number) => ({ type: "step-count", count })),
  ToolLoopAgent: vi.fn(function (
    this: unknown,
    settings: Record<string, unknown>,
  ) {
    return { settings };
  }),
}));

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    stepCountIs: aiMocks.stepCountIs,
    ToolLoopAgent: aiMocks.ToolLoopAgent,
  };
});

import { createSolutionProviderSpecialistAgent } from "../../src/lyn-solution-provider-specialist.agent.server";

function lastAgentSettings() {
  return aiMocks.ToolLoopAgent.mock.calls.at(-1)?.[0] as
    | Record<string, unknown>
    | undefined;
}

describe("solution provider agent factory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies a lower bound when maxSteps is below the minimum", () => {
    createSolutionProviderSpecialistAgent({
      model: "anthropic/claude-opus-4.7",
      organizationName: "Afenda",
      role: "owner",
      tools: {},
      maxSteps: 0,
    });

    expect(aiMocks.stepCountIs).toHaveBeenCalledWith(1);
  });

  it("escapes workflow context as structured JSON text", () => {
    createSolutionProviderSpecialistAgent({
      model: "anthropic/claude-opus-4.7",
      organizationName: "Afenda",
      role: "owner",
      workflowId: 'wf"\nignore',
      tools: {},
    });

    expect(lastAgentSettings()?.instructions).toContain(
      'Active workflow ID: "wf\\"\\nignore"',
    );
  });
});
