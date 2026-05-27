import {
  assertAiBudget,
  assertCapabilityAllowed,
  assertNoSensitiveCredentialContent,
  createErpAssistantAgent,
  createErpAssistantTools,
  createGatewayOptions,
  estimateTokenCount,
  getAiGatewayEnvironment,
  getAiModelForFeature,
  getAiRouteError,
  getUsageMetrics,
  hasAiGatewayCredentials,
  isAiBudgetError,
  isAiSensitiveContentError,
} from "@afenda/ai";
import { getApiAuthContext } from "@afenda/auth/server";
import { createAiUsageEvent, registerAiApprovalProposal } from "@afenda/db";
import {
  getErpModuleById,
  getModuleWorkspace,
  getModuleWorkspaceStats,
  moduleIds,
  resolveWorkspaceDataMode,
} from "@afenda/domain";
import { getRequestId, logServerEvent } from "@afenda/observability";
import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { chatRequestSchema } from "@/lib/api/ai-request-schemas";

export const maxDuration = 30;

function getGatewayUnavailableResponse() {
  return NextResponse.json(
    {
      error:
        "AI Gateway credentials are not configured. Run `vercel env pull` or set AI_GATEWAY_API_KEY.",
    },
    { status: 503 },
  );
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const requestId = getRequestId(request);
  const route = "/api/ai/chat";
  const model = getAiModelForFeature("erp-assistant");

  if (!hasAiGatewayCredentials()) {
    return getGatewayUnavailableResponse();
  }

  try {
    const auth = await getApiAuthContext();

    if (auth instanceof NextResponse) {
      return auth;
    }

    const { session: activeSession, organization } = auth;
    const parsedRequest = chatRequestSchema.parse(await request.json());
    const messages = parsedRequest.messages as UIMessage[];
    const serializedMessages = JSON.stringify(parsedRequest.messages);
    const estimatedPromptTokens = estimateTokenCount(serializedMessages);

    assertNoSensitiveCredentialContent(serializedMessages);
    assertAiBudget({
      estimatedTokens: estimatedPromptTokens,
      feature: "erp-assistant",
    });

    logServerEvent(
      "info",
      "AI assistant stream started.",
      {
        requestId,
        organizationId: organization.id,
        userId: activeSession.id,
        module: "dashboard",
        operation: "ai.assistant.stream",
      },
      {
        route,
        model,
        estimatedPromptTokens,
      },
    );

    async function getAllowedWorkspace(moduleId: (typeof moduleIds)[number]) {
      const moduleDefinition = getErpModuleById(moduleId);

      if (!moduleDefinition) {
        throw new Error(`Unknown ERP module: ${moduleId}`);
      }

      assertCapabilityAllowed({
        capability: moduleDefinition.requiredCapability,
        capabilities: organization.capabilities,
      });

      const workspace = await getModuleWorkspace({
        organizationId: organization.id,
        moduleId,
        dataMode: resolveWorkspaceDataMode(activeSession.source),
      });

      return {
        moduleDefinition,
        workspace,
      };
    }

    const tools = createErpAssistantTools({
      organization,
      session: activeSession,
      model,
      getModuleDefinition: (moduleId) =>
        getErpModuleById(moduleId) ?? undefined,
      getAllowedWorkspace,
      getWorkspaceStats: getModuleWorkspaceStats,
      registerApprovalProposal: registerAiApprovalProposal,
    });

    const agent = createErpAssistantAgent({
      model,
      organizationName: organization.name,
      role: organization.role,
      tools,
      stopSteps: 6,
      providerOptions: createGatewayOptions({
        organizationId: organization.id,
        userId: activeSession.id,
        feature: "erp-assistant",
        moduleId: "dashboard",
        riskLevel: "medium",
        environment: getAiGatewayEnvironment(),
      }),
      onFinish: async ({ totalUsage, finishReason }) => {
        const usageMetrics = getUsageMetrics(totalUsage);

        await createAiUsageEvent({
          organizationId: organization.id,
          userAuthId: activeSession.id,
          moduleId: "dashboard",
          feature: "assistant",
          model,
          status: "completed",
          latencyMs: Date.now() - startedAt,
          ...usageMetrics,
          metadata: {
            finishReason,
            estimatedPromptTokens,
          },
        });
      },
    });

    return createAgentUIStreamResponse({
      agent,
      uiMessages: messages,
    });
  } catch (error) {
    logServerEvent(
      "error",
      "AI assistant stream failed.",
      {
        requestId,
        module: "dashboard",
        operation: "ai.assistant.stream",
      },
      {
        route,
        model,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      },
    );

    const gatewayError = getAiRouteError(error);

    if (gatewayError) {
      return NextResponse.json(
        {
          error: gatewayError.message,
          retryAfter: gatewayError.retryAfter,
        },
        { status: gatewayError.status },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof z.ZodError
            ? "Invalid assistant request."
            : isAiBudgetError(error)
              ? "Assistant request exceeds the configured AI budget."
              : isAiSensitiveContentError(error)
                ? "Assistant request contains credential-like sensitive content."
                : "AI assistant failed.",
      },
      {
        status: isAiBudgetError(error)
          ? 413
          : isAiSensitiveContentError(error)
            ? 422
            : 400,
      },
    );
  }
}
