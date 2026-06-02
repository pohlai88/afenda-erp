import { getUsageMetrics } from "@afenda/ai/server";
import { logServerEvent } from "@afenda/observability";
import type {
  TelemetrySettings,
  ToolLoopAgentOnStepFinishCallback,
  ToolSet,
} from "ai";

type LynxRouteAgentObservabilityInput = {
  feature: string;
  functionId: string;
  model: string;
  moduleId: string;
  operation: string;
  organizationId: string;
  requestId?: string;
  route: string;
  userAuthId: string;
  workflowId?: string;
  workflowSessionId?: string;
};

function optionalTelemetryMetadata(input: LynxRouteAgentObservabilityInput) {
  return {
    organizationId: input.organizationId,
    userAuthId: input.userAuthId,
    route: input.route,
    requestId: input.requestId ?? "",
    moduleId: input.moduleId,
    feature: input.feature,
    workflowId: input.workflowId ?? "",
    workflowSessionId: input.workflowSessionId ?? "",
  };
}

export function createRouteAiTelemetrySettings(
  input: LynxRouteAgentObservabilityInput,
): TelemetrySettings {
  return {
    isEnabled: true,
    functionId: input.functionId,
    recordInputs: false,
    recordOutputs: false,
    metadata: optionalTelemetryMetadata(input),
  };
}

export function createRouteAgentStepLogger<TTools extends ToolSet>(
  input: LynxRouteAgentObservabilityInput,
): ToolLoopAgentOnStepFinishCallback<TTools> {
  return (step) => {
    const usageMetrics = getUsageMetrics(step.usage);

    logServerEvent(
      "info",
      "AI agent step completed.",
      {
        requestId: input.requestId,
        organizationId: input.organizationId,
        userId: input.userAuthId,
        module: input.moduleId,
        operation: input.operation,
      },
      {
        route: input.route,
        feature: input.feature,
        model: input.model,
        stepNumber: step.stepNumber,
        finishReason: step.finishReason,
        toolCallCount: step.toolCalls.length,
        toolResultCount: step.toolResults.length,
        ...usageMetrics,
        ...(input.workflowId ? { workflowId: input.workflowId } : {}),
        ...(input.workflowSessionId
          ? { workflowSessionId: input.workflowSessionId }
          : {}),
      },
    );
  };
}
