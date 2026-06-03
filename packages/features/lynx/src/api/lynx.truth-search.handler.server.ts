import {
  aiGatewayDefaultProviderOrder,
  assertCapabilityAllowed,
  createGatewayOptions,
  getAiModelForFeature,
  hasAiGatewayRuntimeCredentials,
  resolveLanguageModel,
} from "@afenda/ai/server";
import { getApiAuthContext } from "@afenda/auth/server";
import {
  completeLynxRun,
  createAiUsageEvent,
  createLynxRun,
  isAiFeatureEnabledForOrganization,
  recordLynxRunEvent,
} from "../data/lynx.run-lifecycle.repository.server";
import {
  getKnowledgeOrgSetting,
  retrieveKnowledgeChunksWithDiagnostics,
} from "@afenda/feature-knowledge/server";
import {
  buildLynxTruthSystemPrompt,
  LYNX_AUDIT_ACTIONS,
  LYNX_ERP_HTTP_ROUTES,
  LYNX_GATEWAY_FEATURES,
  LYNX_MODULE_ID,
  type LynxRunContextData,
  type LynxRunContextMetadata,
  summarizeLynxQualityGate,
  validateLynxClaims,
  type LynxTruthEvidenceData,
  type LynxTruthQualityGateData,
  type LynxTruthRetrievalStateData,
  validateLynxTruthResponse,
} from "../contracts";
import { getRequestId, logServerEvent } from "@afenda/observability/server";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from "ai";
import { NextResponse } from "next/server";

import { withAiSpan } from "./lynx.ai-span.shared.server";
import {
  extractLatestQueryFromLynxTruthUiMessages,
  lynxTruthSearchRequestSchema,
  lynxTruthSearchUiRequestSchema,
} from "../schemas/lynx.truth-search.schema";

type LynxTruthDataParts = {
  "lynx-run-context": LynxRunContextData;
  "lynx-truth-evidence": LynxTruthEvidenceData;
  "lynx-retrieval-state": LynxTruthRetrievalStateData;
  "lynx-quality-gate": LynxTruthQualityGateData;
};

type LynxTruthUiMessage = UIMessage<LynxRunContextMetadata, LynxTruthDataParts>;

function getTextFromPart(part: unknown): string {
  if (
    typeof part === "object" &&
    part !== null &&
    (part as { type?: unknown }).type === "text" &&
    typeof (part as { text?: unknown }).text === "string"
  ) {
    return (part as { text: string }).text;
  }

  return "";
}

function getGatewayUnavailableResponse() {
  return NextResponse.json(
    {
      error:
        "AI Gateway credentials are not configured. Run `vercel env pull` or set AI_GATEWAY_API_KEY.",
    },
    { status: 503 },
  );
}

export async function handleLynxTruthSearchPost(request: Request): Promise<Response> {
  const startedAt = Date.now();
  const requestId = getRequestId(request);
  const route = LYNX_ERP_HTTP_ROUTES.truthSearch;
  const modelId = getAiModelForFeature("lynx-truth");
  let activeRun:
    | { id: string; organizationId: string; query: string }
    | undefined;

  if (!hasAiGatewayRuntimeCredentials()) {
    return getGatewayUnavailableResponse();
  }

  try {
    const auth = await getApiAuthContext();
    if (auth instanceof NextResponse) return auth;

    const { session, organization } = auth;
    assertCapabilityAllowed({
      capability: "system-admin.lynx.read",
      capabilities: organization.capabilities,
    });
    const isLynxTruthEnabled = await isAiFeatureEnabledForOrganization({
      organizationId: organization.id,
      feature: "lynx-truth",
    });
    if (!isLynxTruthEnabled) {
      return NextResponse.json(
        { error: "Lynx truth retrieval is disabled for this tenant." },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = lynxTruthSearchRequestSchema.safeParse(body);
    const uiParsed = parsed.success
      ? null
      : lynxTruthSearchUiRequestSchema.safeParse(body);

    if (!parsed.success && !uiParsed?.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    let query: string | null = null;
    if (parsed.success) {
      query = parsed.data.query;
    } else if (uiParsed?.success) {
      query = extractLatestQueryFromLynxTruthUiMessages(uiParsed.data.messages);
    }

    if (!query) {
      return NextResponse.json(
        { error: "Truth search requires a user query." },
        { status: 400 },
      );
    }

    const orgSetting = await getKnowledgeOrgSetting(organization.id);

    let evidence: LynxTruthEvidenceData = {
      query,
      chunkCount: 0,
      passages: [],
    };
    let retrievalState: LynxTruthRetrievalStateData = {
      status: "no_evidence",
      chunkCount: 0,
    };
    let systemPrompt: string;

    try {
      const retrievalResult = await retrieveKnowledgeChunksWithDiagnostics(
        organization.id,
        query,
        {
          topK: 8,
          hybrid: orgSetting?.retrievalHybridEnabled ?? false,
          rerank: orgSetting?.retrievalRerankEnabled ?? false,
          telemetry: {
            organizationId: organization.id,
            userId: session.id,
            feature: "knowledge-retrieval",
            moduleId: LYNX_MODULE_ID,
            requestId,
          },
        },
      );
      const chunks = retrievalResult.rows;
      retrievalState = {
        status: retrievalResult.diagnostics.status,
        chunkCount: chunks.length,
        ...(retrievalResult.diagnostics.degradedReason
          ? { degradedReason: retrievalResult.diagnostics.degradedReason }
          : {}),
      };
      evidence = {
        query,
        chunkCount: chunks.length,
        passages: chunks.map((chunk, index) => ({
          passage: index + 1,
          id: chunk.id,
          title: chunk.title,
          excerpt: chunk.body.slice(0, 600),
          distance: chunk.distance,
          lexicalScore: chunk.lexicalScore,
          fusedRank: chunk.fusedRank,
        })),
      };
      systemPrompt = buildLynxTruthSystemPrompt({
        organizationId: organization.id,
        query,
        retrievalState,
        chunks: chunks.map((chunk, index) => ({
          id: chunk.id,
          title: chunk.title,
          body: chunk.body,
          index,
        })),
      });
    } catch (retrievalError) {
      retrievalState = {
        status: "degraded",
        chunkCount: 0,
        degradedReason: "retrieval-failed",
      };
      logServerEvent(
        "warn",
        "Lynx truth retrieval degraded ÔÇö streaming without passages.",
        {
          requestId,
          organizationId: organization.id,
          module: LYNX_MODULE_ID,
          operation: LYNX_AUDIT_ACTIONS.truthQuery,
        },
        {
          route,
          error:
            retrievalError instanceof Error
              ? retrievalError.message
              : String(retrievalError),
        },
      );
      systemPrompt = buildLynxTruthSystemPrompt({
        organizationId: organization.id,
        query,
        retrievalState,
        chunks: [],
      });
    }

    logServerEvent(
      "info",
      "Lynx truth search started.",
      {
        requestId,
        organizationId: organization.id,
        userId: session.id,
        module: LYNX_MODULE_ID,
        operation: LYNX_AUDIT_ACTIONS.truthQuery,
      },
      {
        route,
        model: modelId,
        chunkCount: evidence.chunkCount,
        retrievalState,
      },
    );

    await createAiUsageEvent({
      organizationId: organization.id,
      userAuthId: session.id,
      moduleId: "dashboard",
      feature: "lynx-truth",
      model: modelId,
      status: "started",
      metadata: {
        query,
        chunkCount: evidence.chunkCount,
        retrievalState,
      },
    });

    const runId = await createLynxRun({
      organizationId: organization.id,
      userAuthId: session.id,
      route,
      model: modelId,
      promptSummary: query.slice(0, 240),
      metadata: {
        requestId,
        query,
        chunkCount: evidence.chunkCount,
        retrievalState,
      },
    });
    activeRun = { id: runId, organizationId: organization.id, query };
    const runContext = {
      runId,
      route,
    } satisfies LynxRunContextData;
    await recordLynxRunEvent({
      organizationId: organization.id,
      runId,
      eventType: "truth.evidence",
      summary: "Truth Retrieval evidence selected.",
      evidenceReferences: evidence.passages.map((passage) => ({
        id: passage.id,
        passage: passage.passage,
        title: passage.title,
      })),
      metadata: {
        query,
        chunkCount: evidence.chunkCount,
      },
    });
    await recordLynxRunEvent({
      organizationId: organization.id,
      runId,
      eventType: "truth.retrieval_state",
      summary:
        retrievalState.status === "degraded"
          ? "Truth Retrieval evidence retrieval degraded."
          : retrievalState.status === "no_evidence"
            ? "Truth Retrieval found no evidence passages."
            : "Truth Retrieval evidence retrieval completed.",
      metadata: {
        query,
        retrievalState,
      },
    });

    return withAiSpan(
      "lynx.truth.search",
      {
        feature: "lynx-truth",
        model: modelId,
        moduleId: LYNX_MODULE_ID,
        organizationId: organization.id,
        requestId,
      },
      () => {
        const result = streamText({
          model: resolveLanguageModel(modelId),
          system: systemPrompt,
          messages: [{ role: "user", content: query }],
          providerOptions: createGatewayOptions({
            organizationId: organization.id,
            userId: session.id,
            feature: LYNX_GATEWAY_FEATURES.truth,
            moduleId: LYNX_MODULE_ID,
            qualityGate: "claim-validation",
            providerOrder: aiGatewayDefaultProviderOrder,
            providerOnly: aiGatewayDefaultProviderOrder,
            fallbackModels: ["anthropic/claude-sonnet-4.6"],
            zeroDataRetention: orgSetting?.enforceZdr ?? false,
          }),
          experimental_telemetry: {
            isEnabled: true,
            functionId: LYNX_AUDIT_ACTIONS.truthQuery,
            recordInputs: false,
            recordOutputs: false,
            metadata: {
              organizationId: organization.id,
              ...(requestId ? { requestId } : {}),
              chunkCount: String(evidence.chunkCount),
              retrievalStatus: retrievalState.status,
              hybridEnabled: String(
                orgSetting?.retrievalHybridEnabled ?? false,
              ),
            },
          },
        });
        const stream = createUIMessageStream<LynxTruthUiMessage>({
          execute: ({ writer }) => {
            writer.write({
              type: "data-lynx-run-context",
              id: "lynx-run-context",
              data: runContext,
            });

            writer.write({
              type: "data-lynx-retrieval-state",
              id: "lynx-retrieval-state",
              data: retrievalState,
            });

            writer.write({
              type: "data-lynx-truth-evidence",
              id: "lynx-truth-evidence",
              data: evidence,
            });

            writer.merge(
              result.toUIMessageStream<LynxTruthUiMessage>({
                messageMetadata: () => ({
                  lynxRun: runContext,
                }),
                onFinish: async ({ responseMessage, finishReason }) => {
                  const text = responseMessage.parts
                    .map(getTextFromPart)
                    .join("\n");
                  const validation = validateLynxTruthResponse({
                    text,
                    evidenceCount: evidence.chunkCount,
                    retrievalStatus: retrievalState.status,
                  });
                  const claims = validateLynxClaims({
                    answer: text,
                    evidence: evidence.passages.map((passage) => ({
                      id: passage.id,
                      passage: passage.passage,
                      title: passage.title,
                      excerpt: passage.excerpt,
                    })),
                    mode: "truth",
                  });
                  const qualityGate = summarizeLynxQualityGate(claims);

                  writer.write({
                    type: "data-lynx-quality-gate",
                    id: "lynx-quality-gate",
                    data: {
                      claims,
                      gate: qualityGate,
                    },
                  });

                  await createAiUsageEvent({
                    organizationId: organization.id,
                    userAuthId: session.id,
                    moduleId: "dashboard",
                    feature: "lynx-truth",
                    model: modelId,
                    status: "completed",
                    latencyMs: Date.now() - startedAt,
                    metadata: {
                      finishReason,
                      query,
                      validation,
                      qualityGate,
                      chunkCount: evidence.chunkCount,
                      retrievalState,
                    },
                  });
                  await recordLynxRunEvent({
                    organizationId: organization.id,
                    runId,
                    eventType: "truth.validation",
                    summary: "Truth Retrieval evidence quality gate completed.",
                    validationMetrics: {
                      ...validation,
                      qualityGate,
                    } as Record<string, unknown>,
                    metadata: {
                      query,
                      finishReason,
                      retrievalState,
                      claims,
                    },
                  });
                  await completeLynxRun({
                    id: runId,
                    organizationId: organization.id,
                    status: "completed",
                    latencyMs: Date.now() - startedAt,
                    metadata: {
                      query,
                      finishReason,
                      validation,
                      qualityGate,
                      chunkCount: evidence.chunkCount,
                      retrievalState,
                    },
                  });

                  logServerEvent(
                    qualityGate.status === "passed" &&
                      validation.hasRequiredSections &&
                      validation.invalidCitations.length === 0
                      ? "info"
                      : "warn",
                    "Lynx truth response citation validation completed.",
                    {
                      requestId,
                      organizationId: organization.id,
                      userId: session.id,
                      module: LYNX_MODULE_ID,
                      operation: LYNX_AUDIT_ACTIONS.truthQuery,
                    },
                    { route, validation },
                  );
                },
              }),
            );
          },
        });

        return Promise.resolve(createUIMessageStreamResponse({ stream }));
      },
    );
  } catch (error) {
    if (activeRun) {
      await completeLynxRun({
        id: activeRun.id,
        organizationId: activeRun.organizationId,
        status: "failed",
        latencyMs: Date.now() - startedAt,
        metadata: {
          query: activeRun.query,
          error: error instanceof Error ? error.message : String(error),
        },
      }).catch(() => undefined);
    }

    logServerEvent(
      "error",
      "Lynx truth search failed.",
      {
        requestId,
        module: LYNX_MODULE_ID,
        operation: LYNX_AUDIT_ACTIONS.truthQuery,
      },
      {
        route,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      },
    );

    return NextResponse.json(
      { error: "Truth search failed." },
      { status: 500 },
    );
  }
}
