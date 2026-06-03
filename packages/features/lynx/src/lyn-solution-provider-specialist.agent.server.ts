import {
  stepCountIs,
  ToolLoopAgent,
  type ToolLoopAgentOnFinishCallback,
  type ToolLoopAgentOnStepFinishCallback,
  type ToolLoopAgentSettings,
  type ToolSet,
} from "ai";
import { getSolutionProviderSystemPrompt } from "../prompts/lynx.solution-provider-prompt.server";

const DEFAULT_MAX_STEPS = 8;
const MIN_MAX_STEPS = 1;
const MAX_MAX_STEPS = 12;

export type CreateSolutionProviderSpecialistAgentInput<TTools extends ToolSet> =
  {
    model: ToolLoopAgentSettings<never, TTools>["model"];
    organizationName: string;
    role: string;
    workflowId?: string;
    tools: TTools;
    providerOptions?: ToolLoopAgentSettings<never, TTools>["providerOptions"];
    maxSteps?: number;
    onStepFinish?: ToolLoopAgentOnStepFinishCallback<TTools>;
    onFinish?: ToolLoopAgentOnFinishCallback<TTools>;
    experimental_telemetry?: ToolLoopAgentSettings<
      never,
      TTools
    >["experimental_telemetry"];
  };

export function createSolutionProviderSpecialistAgent<TTools extends ToolSet>(
  input: CreateSolutionProviderSpecialistAgentInput<TTools>,
) {
  const maxSteps = Math.min(
    Math.max(
      input.maxSteps ?? DEFAULT_MAX_STEPS,
      MIN_MAX_STEPS,
    ),
    MAX_MAX_STEPS,
  );
  const instructions = [
    getSolutionProviderSystemPrompt({
      organizationName: input.organizationName,
      role: input.role,
    }),
    input.workflowId
      ? `Active workflow ID: ${JSON.stringify(input.workflowId)}`
      : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  return new ToolLoopAgent({
    id: "afenda-solution-provider-specialist",
    model: input.model,
    instructions,
    tools: input.tools,
    stopWhen: stepCountIs(maxSteps),
    providerOptions: input.providerOptions,
    onStepFinish: input.onStepFinish,
    onFinish: input.onFinish,
    experimental_telemetry: input.experimental_telemetry,
  });
}
