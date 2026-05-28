import {
  aiGatewayHighConfidenceProviderOrder,
  assertAiBudget,
  assertCapabilityAllowed,
  assertGovernedToolset,
  assertNoSensitiveCredentialContent,
  createGatewayOptions,
  createSolutionProviderSpecialistAgent,
  estimateTokenCount,
  getAiGatewayEnvironment,
  getAiModelForFeature,
  getAiRouteError,
  getUsageMetrics,
  hasAiGatewayRuntimeCredentials,
  isAiBudgetError,
  isAiPermissionError,
  isAiSensitiveContentError,
  solutionProviderToolMeta,
} from "@afenda/ai/server";
import { getApiAuthContext } from "@afenda/auth/server";
import {
  createAiUsageEvent,
  isAiFeatureEnabledForOrganization,
} from "@afenda/db";
import { getRequestId, logServerEvent } from "@afenda/observability";
import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { solutionProviderRequestSchema } from "@/lib/api/ai-request-schemas";
import {
  createRouteAgentStepLogger,
  createRouteAiTelemetrySettings,
} from "@/lib/api/ai-agent-observability";
import { createErpSolutionProviderTools } from "@/lib/api/solution-provider-tool-bindings";
import { withAiSpan } from "@/lib/ai-tracing";

export const maxDuration = 30;

/**
 * RFC 8594 deprecation headers for the legacy /api/ai/solution-provider endpoint.
 * Canonical surface: /api/lynx/operator
 */
const DEPRECATION_HEADERS = {
  Deprecation: "Thu, 01 May 2026 00:00:00 GMT",
  Sunset: "Sat, 01 Aug 2026 00:00:00 GMT",
  Link: '</api/lynx/operator>; rel="successor-version"',
} as const;

function addDeprecationHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(DEPRECATION_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

function getGatewayUnavailableResponse() {
  return addDeprecationHeaders(
    NextResponse.json(
      {
        error:
          "AI Gateway credentials are not configured. Run `vercel env pull` or set AI_GATEWAY_API_KEY.",
      },
      { status: 503 },
    ),
  );
}

async function handlePost(request: Request): Promise<NextResponse | Response> {
  const startedAt = Date.now();
  const requestId = getRequestId(request);
  const route = "/api/ai/solution-provider";
  const model = getAiModelForFeature("solution-provider", "high");

  if (!hasAiGatewayRuntimeCredentials()) {
    return getGatewayUnavailableResponse();
  }

  try {
    const auth = await getApiAuthContext();

    if (auth instanceof NextResponse) {
      return auth;
    }

    const { session, organization } = auth;
    const isSolutionProviderEnabled = await isAiFeatureEnabledForOrganization({
      organizationId: organization.id,
      feature: "solution-provider",
    });
    if (!isSolutionProviderEnabled) {
      return NextResponse.json(
        { error: "Solution provider is disabled for this tenant." },
        { status: 403 },
      );
    }
    const isApprovalToolEnabled = await isAiFeatureEnabledForOrganization({
      organizationId: organization.id,
      feature: "approval-tool",
    });

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
      "Legacy solution-provider stream started (deprecated).",
      {
        requestId,
        organizationId: organization.id,
        userId: session.id,
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

    const tools = createErpSolutionProviderTools(auth, model, {
      approvalToolEnabled: isApprovalToolEnabled,
    });

    assertGovernedToolset({
      tools,
      meta: solutionProviderToolMeta,
      capabilities: organization.capabilities,
    });

    const agent = createSolutionProviderSpecialistAgent({
      model,
      organizationName: organization.name,
      role: organization.role,
      workflowId,
      tools,
      maxSteps: 8,
      providerOptions: createGatewayOptions({
        organizationId: organization.id,
        userId: session.id,
        feature: "solution-provider",
        moduleId: "dashboard",
        workflowId,
        riskLevel: "high",
        environment: getAiGatewayEnvironment(),
        providerOrder: aiGatewayHighConfidenceProviderOrder,
        providerOnly: aiGatewayHighConfidenceProviderOrder,
        fallbackModels: ["openai/gpt-5.5"],
      }),
      onStepFinish: createRouteAgentStepLogger({
        feature: "solution-provider",
        functionId: "ai.solution-provider.agent",
        model,
        moduleId: "dashboard",
        operation: "ai.solution-provider.step",
        organizationId: organization.id,
        requestId,
        route,
        userAuthId: session.id,
        ...(workflowId ? { workflowId } : {}),
      }),
      experimental_telemetry: createRouteAiTelemetrySettings({
        feature: "solution-provider",
        functionId: "ai.solution-provider.agent",
        model,
        moduleId: "dashboard",
        operation: "ai.solution-provider.stream",
        organizationId: organization.id,
        requestId,
        route,
        userAuthId: session.id,
        ...(workflowId ? { workflowId } : {}),
      }),
      onFinish: async ({ totalUsage, finishReason }) => {
        const usageMetrics = getUsageMetrics(totalUsage);

        await createAiUsageEvent({
          organizationId: organization.id,
          userAuthId: session.id,
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

    return withAiSpan(
      "ai.solution-provider.stream",
      {
        feature: "solution-provider",
        model,
        organizationId: organization.id,
        requestId,
      },
      () => createAgentUIStreamResponse({ agent, uiMessages: messages }),
    );
  } catch (error) {
    logServerEvent(
      "error",
      "Legacy solution-provider stream failed.",
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
            ? "Invalid request."
            : isAiBudgetError(error)
              ? "Request exceeds the configured token budget."
              : isAiSensitiveContentError(error)
                ? "Request contains credential-like sensitive content."
                : isAiPermissionError(error)
                  ? "Insufficient permissions."
                  : "Request failed.",
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

export async function POST(request: Request): Promise<NextResponse | Response> {
  const response = await handlePost(request);
  if (response instanceof NextResponse) {
    return addDeprecationHeaders(response);
  }
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(DEPRECATION_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, headers });
}
