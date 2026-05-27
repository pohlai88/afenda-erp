import {
  stepCountIs,
  ToolLoopAgent,
  type ToolLoopAgentOnFinishCallback,
  type ToolLoopAgentSettings,
  type ToolSet,
} from "ai";
import { getAssistantSystemPrompt } from "../prompts";

export function createErpAssistantAgent<TTools extends ToolSet>(input: {
  model: string;
  organizationName: string;
  role: string;
  tools: TTools;
  providerOptions?: ToolLoopAgentSettings<TTools>["providerOptions"];
  stopSteps?: number;
  onFinish?: ToolLoopAgentOnFinishCallback<TTools>;
}) {
  return new ToolLoopAgent({
    id: "afenda-erp-assistant",
    model: input.model,
    instructions: getAssistantSystemPrompt({
      organizationName: input.organizationName,
      role: input.role,
    }),
    tools: input.tools,
    stopWhen: stepCountIs(input.stopSteps ?? 6),
    providerOptions: input.providerOptions,
    onFinish: input.onFinish,
  });
}
