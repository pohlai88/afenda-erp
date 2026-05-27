import {
  stepCountIs,
  ToolLoopAgent,
  type ToolLoopAgentOnFinishCallback,
  type ToolLoopAgentSettings,
  type ToolSet,
} from "ai";
import { getSolutionProviderSystemPrompt } from "../prompts";

export function createSolutionProviderAgent<TTools extends ToolSet>(input: {
  model: string;
  organizationName: string;
  role: string;
  tools: TTools;
  providerOptions?: ToolLoopAgentSettings<TTools>["providerOptions"];
  stopSteps?: number;
  onFinish?: ToolLoopAgentOnFinishCallback<TTools>;
}) {
  return new ToolLoopAgent({
    id: "afenda-solution-provider",
    model: input.model,
    instructions: getSolutionProviderSystemPrompt({
      organizationName: input.organizationName,
      role: input.role,
    }),
    tools: input.tools,
    stopWhen: stepCountIs(input.stopSteps ?? 8),
    providerOptions: input.providerOptions,
    onFinish: input.onFinish,
  });
}
