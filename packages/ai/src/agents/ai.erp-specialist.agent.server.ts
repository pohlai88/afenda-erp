import {
  stepCountIs,
  ToolLoopAgent,
  type ToolLoopAgentOnFinishCallback,
  type ToolLoopAgentOnStepFinishCallback,
  type ToolLoopAgentSettings,
  type ToolSet,
} from "ai";
import { getAssistantSystemPrompt } from "../prompts/ai.system-prompt";

const DEFAULT_MAX_STEPS = 6;
const MIN_MAX_STEPS = 1;
const MAX_MAX_STEPS = 12;

export type CreateErpSpecialistAgentInput<TTools extends ToolSet> = {
  model: ToolLoopAgentSettings<never, TTools>["model"];
  organizationName: string;
  role: string;
  tools: TTools;
  providerOptions?: ToolLoopAgentSettings<never, TTools>["providerOptions"];
  maxSteps?: number;
  /** @deprecated Use maxSteps instead. */
  stopSteps?: number;
  onStepFinish?: ToolLoopAgentOnStepFinishCallback<TTools>;
  onFinish?: ToolLoopAgentOnFinishCallback<TTools>;
  experimental_telemetry?: ToolLoopAgentSettings<
    never,
    TTools
  >["experimental_telemetry"];
};

export function createErpSpecialistAgent<TTools extends ToolSet>(
  input: CreateErpSpecialistAgentInput<TTools>,
) {
  const maxSteps = Math.min(
    Math.max(
      input.maxSteps ?? input.stopSteps ?? DEFAULT_MAX_STEPS,
      MIN_MAX_STEPS,
    ),
    MAX_MAX_STEPS,
  );

  return new ToolLoopAgent({
    id: "afenda-erp-specialist",
    model: input.model,
    instructions: getAssistantSystemPrompt({
      organizationName: input.organizationName,
      role: input.role,
    }),
    tools: input.tools,
    stopWhen: stepCountIs(maxSteps),
    providerOptions: input.providerOptions,
    onStepFinish: input.onStepFinish,
    onFinish: input.onFinish,
    experimental_telemetry: input.experimental_telemetry,
  });
}

/**
 * Backward-compatible export for callers not yet migrated to the specialist
 * naming. New code should use createErpSpecialistAgent.
 *
 * @deprecated Use createErpSpecialistAgent.
 */
export const createErpAssistantAgent = createErpSpecialistAgent;
