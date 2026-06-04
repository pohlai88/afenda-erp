import { getErpModuleById } from "@afenda/kernel";
import { getApiAuthContext, requireCapability } from "../../server";
import { getRequestId, logServerEvent } from "@afenda/observability/server";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  AI_ERP_HTTP_ROUTES,
  assertAiBudget,
  assertCapabilityAllowed,
  assertNoSensitiveCredentialContent,
  aiGatewayDefaultProviderOrder,
  createGatewayOptions,
  documentExtractionRequestSchema,
  documentExtractionSchema,
  estimateTokenCount,
  getAiGatewayEnvironment,
  getAiModelForFeature,
  getAiRouteError,
  getDocumentExtractionPrompt,
  getUsageMetrics,
  hasAiGatewayRuntimeCredentials,
  isAiBudgetError,
  isAiPermissionError,
  isAiSensitiveContentError,
  withAiSpan,
} from "@afenda/ai/server";
import {
  createAiUsageEvent,
  isAiFeatureEnabledForOrganization,
  registerAiDocumentExtraction,
} from "./sys-ai-http-persistence-repository-server";

export const AI_EXTRACT_MAX_DURATION = 30;

function getGatewayUnavailableResponse() {
  return NextResponse.json(
    {
      error:
        "AI Gateway credentials are not configured. Run `vercel env pull` or set AI_GATEWAY_API_KEY.",
    },
    { status: 503 },
  );
}

function statusRiskFromDocumentText(documentText: string) {
  return /\b(payroll|salary|compensation|bank|passport|identity|tax)\b/i.test(
    documentText,
  )
    ? "high"
    : "medium";
}

export async function handleAiExtractDocumentPost(
  request: Request,
): Promise<Response> {
  const startedAt = Date.now();
  const requestId = getRequestId(request) ?? "";
  const route = AI_ERP_HTTP_ROUTES.extractDocument;
  let model = getAiModelForFeature("document-extraction");

  if (!hasAiGatewayRuntimeCredentials()) {
    return getGatewayUnavailableResponse();
  }

  try {
    const auth = await getApiAuthContext();
    if (auth instanceof Response) return auth;

    const { session, organization } = auth;
    const isExtractionEnabled = await isAiFeatureEnabledForOrganization({
      organizationId: organization.id,
      feature: "document-extraction",
    });
    if (!isExtractionEnabled) {
      return NextResponse.json(
        { error: "Document extraction is disabled for this tenant." },
        { status: 403 },
      );
    }

    const parsedRequest = documentExtractionRequestSchema.parse(
      await request.json(),
    );
    const moduleDefinition = getErpModuleById(parsedRequest.moduleId);

    if (!moduleDefinition) {
      return NextResponse.json(
        { error: "Unknown ERP module." },
        { status: 400 },
      );
    }

    await requireCapability(moduleDefinition.requiredCapability);
    assertCapabilityAllowed({
      capability: moduleDefinition.requiredCapability,
      capabilities: organization.capabilities,
    });
    const riskLevel = statusRiskFromDocumentText(parsedRequest.documentText);
    model = getAiModelForFeature("document-extraction", riskLevel);
    const estimatedPromptTokens = estimateTokenCount(
      parsedRequest.documentText,
    );

    assertNoSensitiveCredentialContent(parsedRequest.documentText);
    assertAiBudget({
      estimatedTokens: estimatedPromptTokens,
      feature: "document-extraction",
    });

    logServerEvent(
      "info",
      "AI document extraction started.",
      {
        requestId,
        organizationId: organization.id,
        userId: session.id,
        module: parsedRequest.moduleId,
        operation: "ai.document.extract",
      },
      { route, model, estimatedPromptTokens },
    );

    const result = await withAiSpan(
      "ai.extract.generateText",
      {
        feature: "document-extraction",
        model,
        moduleId: parsedRequest.moduleId,
        organizationId: organization.id,
        requestId,
      },
      () =>
        generateText({
          model,
          output: Output.object({ schema: documentExtractionSchema }),
          prompt: getDocumentExtractionPrompt(parsedRequest),
          providerOptions: createGatewayOptions({
            organizationId: organization.id,
            userId: session.id,
            feature: "document-extraction",
            moduleId: parsedRequest.moduleId,
            riskLevel,
            environment: getAiGatewayEnvironment(),
            providerOrder: aiGatewayDefaultProviderOrder,
            providerOnly: aiGatewayDefaultProviderOrder,
            zeroDataRetention: true,
          }),
        }),
    );

    const extraction = result.output;
    const status = extraction.confidence >= 80 ? "completed" : "needs-review";
    const extractionId = await registerAiDocumentExtraction({
      organizationId: organization.id,
      documentId: parsedRequest.documentId,
      moduleId: parsedRequest.moduleId,
      requestedByAuthUserId: session.id,
      model,
      status,
      confidence: extraction.confidence,
      extracted: extraction,
      reviewNotes: extraction.reviewNotes,
    });
    const usageMetrics = getUsageMetrics(result.usage);

    await createAiUsageEvent({
      organizationId: organization.id,
      userAuthId: session.id,
      moduleId: parsedRequest.moduleId,
      feature: "document-extraction",
      model,
      status: "completed",
      latencyMs: Date.now() - startedAt,
      ...usageMetrics,
      metadata: { extractionId, estimatedPromptTokens },
    });

    return NextResponse.json({ extractionId, status, extraction });
  } catch (error) {
    logServerEvent(
      "error",
      "AI document extraction failed.",
      {
        requestId,
        module: "documents",
        operation: "ai.document.extract",
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
            ? "Invalid document extraction request."
            : isAiBudgetError(error)
              ? "Document exceeds the configured AI extraction budget."
              : isAiSensitiveContentError(error)
                ? "Document contains credential-like sensitive content."
                : isAiPermissionError(error)
                  ? "Insufficient permissions for document extraction."
                  : "Document extraction failed.",
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
