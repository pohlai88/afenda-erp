import {
  assertAiBudget,
  assertCapabilityAllowed,
  assertNoSensitiveCredentialContent,
  createGatewayOptions,
  createSolutionProviderAgent,
  createSolutionProviderTools,
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
import { solutionProviderRequestSchema } from "@/lib/api/ai-request-schemas";

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
  const route = "/api/ai/solution-provider";
  const model = getAiModelForFeature("solution-provider", "high");

  if (!hasAiGatewayCredentials()) {
    return getGatewayUnavailableResponse();
  }

  try {
    const auth = await getApiAuthContext();

    if (auth instanceof NextResponse) {
      return auth;
    }

    const { session: activeSession, organization } = auth;
    assertCapabilityAllowed({
      capability: "dashboard.view",
      capabilities: organization.capabilities,
    });

    const parsedRequest = solutionProviderRequestSchema.parse(
      await request.json(),
    );
    const messages = parsedRequest.messages as UIMessage[];
    const workflowId = parsedRequest.workflowId ?? "negative_pnl_recovery";
    const serializedMessages = JSON.stringify(parsedRequest.messages);
    const estimatedPromptTokens = estimateTokenCount(serializedMessages);

    assertNoSensitiveCredentialContent(serializedMessages);
    assertAiBudget({
      estimatedTokens: estimatedPromptTokens,
      feature: "solution-provider",
    });

    logServerEvent(
      "info",
      "Solution Provider stream started.",
      {
        requestId,
        organizationId: organization.id,
        userId: activeSession.id,
        module: "dashboard",
        operation: "ai.solution-provider.stream",
      },
      {
        route,
        model,
        estimatedPromptTokens,
        workflowId,
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

    const tools = createSolutionProviderTools({
      organization,
      session: activeSession,
      model,
      getModuleDefinition: (moduleId) =>
        getErpModuleById(moduleId) ?? undefined,
      getAllowedWorkspace,
      getWorkspaceStats: getModuleWorkspaceStats,
      registerSolutionActionProposal: async (proposal) =>
        registerAiApprovalProposal({
          organizationId: proposal.organizationId,
          moduleId: proposal.moduleId,
          requestedByAuthUserId: proposal.requestedByAuthUserId,
          model: proposal.model,
          status: "approved",
          proposedAction: "solution-action",
          rationale: proposal.rationale,
          riskLevel: proposal.riskLevel,
          toolInput: {
            title: proposal.title,
            sourceRecordIds: proposal.sourceRecordIds,
            requiredHumanChecks: proposal.requiredHumanChecks,
            sandbox: proposal.sandbox ?? null,
          },
          toolOutput: {
            humanApproved: true,
            solutionProvider: true,
            sandboxStatus: proposal.sandbox?.status ?? "approved",
          },
        }),
    });

    const agent = createSolutionProviderAgent({
      model,
      organizationName: organization.name,
      role: organization.role,
      tools,
      stopSteps: 8,
      providerOptions: createGatewayOptions({
        organizationId: organization.id,
        userId: activeSession.id,
        feature: "solution-provider",
        moduleId: "dashboard",
        workflowId,
        riskLevel: "high",
        environment: getAiGatewayEnvironment(),
      }),
      onFinish: async ({ totalUsage, finishReason }) => {
        const usageMetrics = getUsageMetrics(totalUsage);

        await createAiUsageEvent({
          organizationId: organization.id,
          userAuthId: activeSession.id,
          moduleId: "dashboard",
          feature: "solution-provider",
          model,
          status: "completed",
          latencyMs: Date.now() - startedAt,
          ...usageMetrics,
          metadata: {
            finishReason,
            estimatedPromptTokens,
            workflowId,
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
      "Solution Provider stream failed.",
      {
        requestId,
        module: "dashboard",
        operation: "ai.solution-provider.stream",
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
            ? "Invalid Solution Provider request."
            : isAiBudgetError(error)
              ? "Solution Provider request exceeds the configured AI budget."
              : isAiSensitiveContentError(error)
                ? "Solution Provider request contains credential-like sensitive content."
                : "Solution Provider failed.",
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
