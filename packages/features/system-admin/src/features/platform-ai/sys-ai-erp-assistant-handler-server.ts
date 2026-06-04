import { getApiAuthContext } from "../../server";
import {
  getErpModuleById,
  getModuleWorkspace,
  getModuleWorkspaceStats,
  moduleIds,
  resolveWorkspaceDataMode,
  type ModuleId,
} from "@afenda/kernel";
import { getRequestId, logServerEvent } from "@afenda/observability/server";
import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  AI_ERP_HTTP_ROUTES,
  assertAiBudget,
  assertCapabilityAllowed,
  assertGovernedToolset,
  assertNoSensitiveCredentialContent,
  aiGatewayDefaultProviderOrder,
  chatRequestSchema,
  createErpAssistantTools,
  createErpSpecialistAgent,
  createGatewayOptions,
  createRouteAgentStepLogger,
  createRouteAiTelemetrySettings,
  erpAssistantToolMeta,
  estimateTokenCount,
  getAiGatewayEnvironment,
  getAiModelForFeature,
  getAiRouteError,
  getUsageMetrics,
  hasAiGatewayRuntimeCredentials,
  isAiBudgetError,
  isAiPermissionError,
  isAiSensitiveContentError,
  withAiSpan,
} from "@afenda/ai/server";
import {
  createAiActionSandbox,
  createAiUsageEvent,
  isAiFeatureEnabledForOrganization,
  registerAiApprovalProposal,
} from "./ai-http-persistence.repository.server";

export const AI_ERP_ASSISTANT_MAX_DURATION = 30;

function getGatewayUnavailableResponse() {
  return NextResponse.json(
    {
      error:
        "AI Gateway credentials are not configured. Run `vercel env pull` or set AI_GATEWAY_API_KEY.",
    },
    { status: 503 },
  );
}

export async function handleAiErpAssistantPost(
  request: Request,
): Promise<Response> {
  const startedAt = Date.now();
  const requestId = getRequestId(request) ?? "";
  const route = AI_ERP_HTTP_ROUTES.erpAssistant;
  const model = getAiModelForFeature("erp-assistant");
  let contextModuleId: ModuleId = "dashboard";

  if (!hasAiGatewayRuntimeCredentials()) {
    return getGatewayUnavailableResponse();
  }

  try {
    const auth = await getApiAuthContext();
    if (auth instanceof Response) return auth;

    const { session: activeSession, organization } = auth;
    const isAssistantEnabled = await isAiFeatureEnabledForOrganization({
      organizationId: organization.id,
      feature: "assistant",
    });
    if (!isAssistantEnabled) {
      return NextResponse.json(
        { error: "AI assistant is disabled for this tenant." },
        { status: 403 },
      );
    }

    const isApprovalToolEnabled = await isAiFeatureEnabledForOrganization({
      organizationId: organization.id,
      feature: "approval-tool",
    });

    const parsedRequest = chatRequestSchema.parse(await request.json());
    const messages = parsedRequest.messages as UIMessage[];
    contextModuleId = parsedRequest.contextModuleId ?? "dashboard";

    const contextModuleDefinition = getErpModuleById(contextModuleId);
    assertCapabilityAllowed({
      capability:
        contextModuleDefinition?.requiredCapability ?? "dashboard.view",
      capabilities: organization.capabilities,
    });
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
        module: contextModuleId,
        operation: "ai.assistant.stream",
      },
      { route, model, estimatedPromptTokens },
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

      return { moduleDefinition, workspace };
    }

    const tools = createErpAssistantTools({
      organization,
      session: activeSession,
      model,
      getModuleDefinition: (moduleId) => getErpModuleById(moduleId) ?? undefined,
      getAllowedWorkspace,
      getWorkspaceStats: getModuleWorkspaceStats,
      registerApprovalProposal: registerAiApprovalProposal,
      isApprovalToolEnabled: () => isApprovalToolEnabled,
      persistActionSandbox: async (sandbox, approvalProposalId) =>
        createAiActionSandbox({
          id: sandbox.id,
          organizationId: sandbox.organizationId,
          moduleId: sandbox.moduleId,
          actionType: sandbox.actionType,
          title: sandbox.title,
          proposedBy: sandbox.proposedBy,
          status: sandbox.status,
          diff: sandbox.diff as Record<string, unknown>,
          riskAssessment: sandbox.riskAssessment as Record<string, unknown>,
          sourceEvidence: (sandbox.sourceEvidence ?? []) as Record<
            string,
            unknown
          >[],
          rollbackMetadata: sandbox.rollbackMetadata as
            | Record<string, unknown>
            | null
            | undefined,
          approvalProposalId,
          rejectionReason: sandbox.rejectionReason,
          approvedAt: sandbox.approvedAt
            ? new Date(sandbox.approvedAt)
            : undefined,
          rejectedAt: sandbox.rejectedAt
            ? new Date(sandbox.rejectedAt)
            : undefined,
          createdAt: new Date(sandbox.createdAt),
          updatedAt: new Date(sandbox.updatedAt),
        }),
    });

    assertGovernedToolset({
      tools,
      meta: erpAssistantToolMeta,
      capabilities: organization.capabilities,
    });

    const agent = createErpSpecialistAgent({
      model,
      organizationName: organization.name,
      role: organization.role,
      tools,
      maxSteps: 6,
      providerOptions: createGatewayOptions({
        organizationId: organization.id,
        userId: activeSession.id,
        feature: "erp-assistant",
        moduleId: contextModuleId,
        riskLevel: "medium",
        environment: getAiGatewayEnvironment(),
        providerOrder: aiGatewayDefaultProviderOrder,
        providerOnly: aiGatewayDefaultProviderOrder,
        fallbackModels: ["anthropic/claude-sonnet-4.6"],
      }),
      onStepFinish: createRouteAgentStepLogger({
        feature: "erp-assistant",
        functionId: "ai.chat.agent",
        model,
        moduleId: contextModuleId,
        operation: "ai.assistant.step",
        organizationId: organization.id,
        requestId,
        route,
        userAuthId: activeSession.id,
      }),
      experimental_telemetry: createRouteAiTelemetrySettings({
        feature: "erp-assistant",
        functionId: "ai.chat.agent",
        model,
        moduleId: contextModuleId,
        operation: "ai.assistant.stream",
        organizationId: organization.id,
        requestId,
        route,
        userAuthId: activeSession.id,
      }),
      onFinish: async ({ totalUsage, finishReason }) => {
        const usageMetrics = getUsageMetrics(totalUsage);
        await createAiUsageEvent({
          organizationId: organization.id,
          userAuthId: activeSession.id,
          moduleId: contextModuleId,
          feature: "assistant",
          model,
          status: "completed",
          latencyMs: Date.now() - startedAt,
          ...usageMetrics,
          metadata: { finishReason, estimatedPromptTokens },
        });
      },
    });

    return withAiSpan(
      "ai.chat.stream",
      {
        feature: "erp-assistant",
        model,
        moduleId: contextModuleId,
        organizationId: organization.id,
        requestId,
      },
      () => createAgentUIStreamResponse({ agent, uiMessages: messages }),
    );
  } catch (error) {
    logServerEvent(
      "error",
      "AI assistant stream failed.",
      {
        requestId,
        module: contextModuleId,
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
                : isAiPermissionError(error)
                  ? "Insufficient permissions for this AI request."
                  : "AI assistant failed.",
      },
      {
        status: isAiBudgetError(error)
          ? 413
          : isAiSensitiveContentError(error)
            ? 422
            : isAiPermissionError(error)
              ? 403
              : 400,
      },
    );
  }
}
