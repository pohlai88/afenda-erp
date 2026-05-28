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
  workflowId?: string;
  tools: TTools;
  providerOptions?: ToolLoopAgentSettings<TTools>["providerOptions"];
  stopSteps?: number;
  onFinish?: ToolLoopAgentOnFinishCallback<TTools>;
}) {
  const instructions = input.workflowId
    ? `${getSolutionProviderSystemPrompt({
        organizationName: input.organizationName,
        role: input.role,
      })}\nActive workflow: ${input.workflowId}.`
    : getSolutionProviderSystemPrompt({
        organizationName: input.organizationName,
        role: input.role,
      });

  return new ToolLoopAgent({
    id: "afenda-solution-provider",
    model: input.model,
    instructions,
    tools: input.tools,
    stopWhen: stepCountIs(input.stopSteps ?? 8),
    providerOptions: input.providerOptions,
    onFinish: input.onFinish,
  });
}
