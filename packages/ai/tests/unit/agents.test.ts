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

import { createErpSpecialistAgent } from "../../src/agents/ai.erp-specialist.agent.server";
import { createSolutionProviderSpecialistAgent } from "../../src/agents/ai.solution-provider-specialist.agent.server";

function lastAgentSettings() {
  return aiMocks.ToolLoopAgent.mock.calls.at(-1)?.[0] as
    | Record<string, unknown>
    | undefined;
}

describe("agent factories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bounds ERP maxSteps to the enterprise loop limits", () => {
    createErpSpecialistAgent({
      model: "openai/gpt-5.5",
      organizationName: "Afenda",
      role: "owner",
      tools: {},
      maxSteps: 999,
    });

    expect(aiMocks.stepCountIs).toHaveBeenCalledWith(12);
  });

  it("keeps deprecated stopSteps working with a lower bound", () => {
    createErpSpecialistAgent({
      model: "openai/gpt-5.5",
      organizationName: "Afenda",
      role: "owner",
      tools: {},
      stopSteps: 0,
    });

    expect(aiMocks.stepCountIs).toHaveBeenCalledWith(1);
  });

  it("prefers maxSteps over deprecated stopSteps for solution provider agents", () => {
    createSolutionProviderSpecialistAgent({
      model: "anthropic/claude-opus-4.7",
      organizationName: "Afenda",
      role: "owner",
      tools: {},
      maxSteps: 4,
      stopSteps: 10,
    });

    expect(aiMocks.stepCountIs).toHaveBeenCalledWith(4);
  });

  it("passes step hooks and telemetry through to ToolLoopAgent", () => {
    const onStepFinish = vi.fn();
    const onFinish = vi.fn();
    const experimental_telemetry = {
      isEnabled: true,
      functionId: "erp-specialist",
      recordInputs: false,
      recordOutputs: false,
    };

    createErpSpecialistAgent({
      model: "openai/gpt-5.5",
      organizationName: "Afenda",
      role: "owner",
      tools: {},
      onStepFinish,
      onFinish,
      experimental_telemetry,
    });

    expect(lastAgentSettings()).toMatchObject({
      onStepFinish,
      onFinish,
      experimental_telemetry,
    });
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
