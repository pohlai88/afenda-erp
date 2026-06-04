import {
  aiGatewayHighConfidenceProviderOrder,
  assertAiBudget,
  assertCapabilityAllowed,
  createGovernedToolRegistry,
  assertGovernedToolset,
  assertNoSensitiveCredentialContent,
  createGatewayOptions,
  estimateTokenCount,
  getAiGatewayEnvironment,
  getAiModelForFeature,
  getUsageMetrics,
  hasAiGatewayRuntimeCredentials,
} from "@afenda/ai/server";
import { createSolutionProviderSpecialistAgent } from "../agents/lynx.solution-provider-specialist.agent.server";
import { solutionProviderToolMeta } from "../tools/lynx.solution-provider-tool-meta";
import { getApiAuthContext } from "./server";
import {
  isAiFeatureEnabledForOrganization,
} from "./lynx.run-lifecycle.repository.server";
import {
  getLynxWorkflowSession,
  type LynxWorkflowSessionSummary,
} from "./lynx.workflow-session.repository.server";
import {
  executeLynxCompleteRunCommand,
  executeLynxCreateAiUsageEventCommand,
  executeLynxCreateRunCommand,
  executeLynxCreateWorkflowSessionCommand,
  executeLynxRecordRunEventCommand,
  executeLynxUpdateWorkflowSessionCommand,
} from "../commands";
import {
  combineLynxQualityGates,
  summarizeLynxQualityGate,
  validateLynxClaims,
  type LynxQualityGateResult,
} from "./lyn-evidence-trust-contract";
import { createLynxOperatorCheckpoint } from "./lyn-operator-checkpoint-contract";
import {
  LYNX_AUDIT_ACTIONS,
  LYNX_ERP_HTTP_ROUTES,
  LYNX_GATEWAY_FEATURES,
  LYNX_MODULE_ID,
  LYNX_OPERATOR_MAX_STEPS,
} from "./lyn-core-contract";
import type {
  LynxRunContextData,
  LynxRunContextMetadata,
} from "./lyn-run-feedback-schema";
import { getLynxReadinessSnapshot } from "./lynx.readiness.query.server";
import {
  createLynxErpReadTools,
  createLynxKnowledgeTools,
  createLynxReadinessTools,
  lynxToolMeta,
} from "../tools";
import { getRequestId, logServerEvent } from "@afenda/observability/server";
import { solutionWorkflowIds, type SolutionWorkflowId } from "@afenda/kernel";
import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { NextResponse } from "next/server";
import { lynxOperatorRequestSchema } from "./lyn-operator-schema";
import {
  createRouteAgentStepLogger,
  createRouteAiTelemetrySettings,
} from "./lynx.route-observability.shared.server";
import { createLynxSolutionProviderTools } from "../tools/lynx.solution-provider-bindings.tool.server";
import { withAiSpan } from "./lynx.ai-span.shared.server";

function getGatewayUnavailableResponse() {
  return NextResponse.json(
    {
      error:
        "AI Gateway credentials are not configured. Run `vercel env pull` or set AI_GATEWAY_API_KEY.",
    },
    { status: 503 },
  );
}

function summarizeLatestUserPrompt(messages: unknown[]): string {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];
    if (typeof message !== "object" || message === null) continue;
    const record = message as { role?: unknown; parts?: unknown };
    if (record.role !== "user" || !Array.isArray(record.parts)) continue;
    const text = record.parts
      .map((part) => {
        if (
          typeof part === "object" &&
          part !== null &&
          (part as { type?: unknown }).type === "text" &&
          typeof (part as { text?: unknown }).text === "string"
        ) {
          return (part as { text: string }).text;
        }
        return "";
      })
      .join(" ")
      .trim();
    if (text) return text.slice(0, 240);
  }
  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function summarizeToolPayload(value: unknown) {
  if (!isRecord(value)) {
    return { kind: typeof value };
  }

  return {
    source: typeof value.source === "string" ? value.source : undefined,
    readinessStatus:
      typeof value.readinessStatus === "string"
        ? value.readinessStatus
        : undefined,
    summary: typeof value.summary === "string" ? value.summary : undefined,
    moduleCount: Array.isArray(value.modules)
      ? value.modules.length
      : undefined,
    signalCount: Array.isArray(value.signals)
      ? value.signals.length
      : undefined,
    evidenceCount: Array.isArray(value.evidence)
      ? value.evidence.length
      : undefined,
  };
}

function extractEvidenceReferences(value: unknown): Record<string, unknown>[] {
  if (!isRecord(value) || !Array.isArray(value.evidence)) {
    return [];
  }

  return value.evidence
    .filter(isRecord)
    .slice(0, 20)
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : undefined,
      type: typeof item.type === "string" ? item.type : undefined,
      moduleId: typeof item.moduleId === "string" ? item.moduleId : undefined,
      label: typeof item.label === "string" ? item.label : undefined,
      signal: typeof item.signal === "string" ? item.signal : undefined,
      href: typeof item.href === "string" ? item.href : undefined,
    }));
}

function resolveSolutionWorkflowId(value: string): SolutionWorkflowId | null {
  return solutionWorkflowIds.includes(value as SolutionWorkflowId)
    ? (value as SolutionWorkflowId)
    : null;
}

export async function handleLynxOperatorPost(request: Request): Promise<Response> {
  const startedAt = Date.now();
  const requestId = getRequestId(request);
  const route = LYNX_ERP_HTTP_ROUTES.operator;
  const model = getAiModelForFeature("lynx-operator", "high");
  let activeRun:
    | {
        id: string;
        organizationId: string;
        workflowId: string;
        workflowSessionId: string;
      }
    | undefined;
  let activeWorkflowSession: { id: string; organizationId: string } | undefined;
  let toolQualityGates: LynxQualityGateResult[] = [];

  if (!hasAiGatewayRuntimeCredentials()) {
    return getGatewayUnavailableResponse();
  }

  try {
    const auth = await getApiAuthContext();
    if (auth instanceof Response) return auth;

    const { session, organization } = auth;

    assertCapabilityAllowed({
      capability: "system-admin.lynx.read",
      capabilities: organization.capabilities,
    });
    const isLynxOperatorEnabled = await isAiFeatureEnabledForOrganization({
      organizationId: organization.id,
      feature: "lynx-operator",
    });
    if (!isLynxOperatorEnabled) {
      return NextResponse.json(
        { error: "Lynx operator is disabled for this tenant." },
        { status: 403 },
      );
    }
    const isApprovalToolEnabled = await isAiFeatureEnabledForOrganization({
      organizationId: organization.id,
      feature: "approval-tool",
    });

    const body = await request.json().catch(() => ({}));
    const parsed = lynxOperatorRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { messages, workflowId, workflowSessionId } = parsed.data;
    const uiMessages = messages as UIMessage[];
    let workflow: SolutionWorkflowId = workflowId ?? "negative_pnl_recovery";
    const serializedMessages = JSON.stringify(messages);
    const estimatedPromptTokens = estimateTokenCount(serializedMessages);

    assertNoSensitiveCredentialContent(serializedMessages);
    assertAiBudget({
      estimatedTokens: estimatedPromptTokens,
      feature: "lynx-operator",
    });

    const promptSummary = summarizeLatestUserPrompt(messages);
    let workflowSession: LynxWorkflowSessionSummary;
    if (workflowSessionId) {
      const existingSession = await getLynxWorkflowSession({
        organizationId: organization.id,
        id: workflowSessionId,
      });

      if (!existingSession) {
        return NextResponse.json(
          { error: "Workflow session was not found." },
          { status: 404 },
        );
      }

      if (
        existingSession.status === "completed" ||
        existingSession.status === "failed" ||
        existingSession.status === "cancelled"
      ) {
        return NextResponse.json(
          { error: "Workflow session cannot be resumed." },
          { status: 409 },
        );
      }

      workflowSession = existingSession;
      const storedWorkflow = resolveSolutionWorkflowId(
        existingSession.workflowId,
      );
      if (!storedWorkflow) {
        return NextResponse.json(
          { error: "Workflow session has an unsupported workflow type." },
          { status: 409 },
        );
      }
      workflow = storedWorkflow;
    } else {
      workflowSession = await executeLynxCreateWorkflowSessionCommand({
        organizationId: organization.id,
        userAuthId: session.id,
        workflowId: workflow,
        currentStage: "request.started",
        promptSummary,
        nextRecommendedStep: "Review the generated Lynx run before resuming.",
        metadata: {
          requestId,
          messageCount: messages.length,
        },
      });
    }
    activeWorkflowSession = {
      id: workflowSession.id,
      organizationId: organization.id,
    };

    await executeLynxCreateAiUsageEventCommand({
      organizationId: organization.id,
      userAuthId: session.id,
      moduleId: "dashboard",
      feature: "lynx-operator",
      model,
      status: "started",
      metadata: {
        estimatedPromptTokens,
        workflowId: workflow,
        workflowSessionId: workflowSession.id,
        messageCount: messages.length,
      },
    });

    const runId = await executeLynxCreateRunCommand({
      organizationId: organization.id,
      userAuthId: session.id,
      route,
      workflowId: workflow,
      workflowSessionId: workflowSession.id,
      model,
      promptSummary,
      metadata: {
        requestId,
        estimatedPromptTokens,
        messageCount: messages.length,
        workflowSessionId: workflowSession.id,
      },
    });
    activeRun = {
      id: runId,
      organizationId: organization.id,
      workflowId: workflow,
      workflowSessionId: workflowSession.id,
    };
    const runContext = {
      runId,
      route,
      workflowId: workflow,
      workflowSessionId: workflowSession.id,
    } satisfies LynxRunContextData;
    await executeLynxRecordRunEventCommand({
      organizationId: organization.id,
      runId,
      eventType: "request.started",
      summary: "Lynx operator run started.",
      metadata: {
        requestId,
        workflowId: workflow,
        workflowSessionId: workflowSession.id,
        estimatedPromptTokens,
      },
    });

    const readinessSnapshot = await getLynxReadinessSnapshot({
      organizationId: organization.id,
      capabilities: organization.capabilities,
      sessionSource: session.source,
    });

    const recordToolAudit = async (event: {
      toolName: string;
      meta: unknown;
      organizationId: string;
      userAuthId: string;
      input?: unknown;
      output?: unknown;
    }) => {
      if (event.organizationId !== organization.id) {
        throw new Error("Tool audit organization mismatch.");
      }

      logServerEvent(
        "info",
        "Governed tool call recorded.",
        {
          requestId,
          organizationId: event.organizationId,
          userId: event.userAuthId,
          module: LYNX_MODULE_ID,
          operation: `tool.${event.toolName}`,
        },
        {
          route,
          toolName: event.toolName,
          meta: event.meta,
          workflowId: workflow,
          workflowSessionId: workflowSession.id,
        },
      );
      const evidenceReferences = extractEvidenceReferences(event.output);
      const outputSummary = summarizeToolPayload(event.output);
      const answer =
        typeof outputSummary.summary === "string" ? outputSummary.summary : "";
      const claims = answer
        ? validateLynxClaims({
            answer,
            evidence: evidenceReferences.map((reference, index) => ({
              id:
                typeof reference.id === "string"
                  ? reference.id
                  : `${event.toolName}-evidence-${index + 1}`,
              title:
                typeof reference.label === "string"
                  ? reference.label
                  : undefined,
              excerpt:
                typeof reference.signal === "string"
                  ? reference.signal
                  : undefined,
            })),
            mode: "operator",
          })
        : [];
      const qualityGate = answer
        ? summarizeLynxQualityGate(claims)
        : ({
            status: "review",
            unsupportedClaimCount: 0,
            citationPrecision: 1,
            noAnswerCorrectness: 1,
            promptInjectionResilience: 1,
            reasons: ["Tool output did not expose a claim summary."],
            generatedAt: new Date().toISOString(),
          } satisfies LynxQualityGateResult);
      toolQualityGates = [...toolQualityGates, qualityGate];

      await executeLynxRecordRunEventCommand({
        organizationId: organization.id,
        runId,
        eventType: "tool.called",
        summary: `Governed tool ${event.toolName} called.`,
        toolName: event.toolName,
        evidenceReferences,
        validationMetrics: {
          qualityGate,
        },
        metadata: {
          meta: event.meta,
          workflowId: workflow,
          workflowSessionId: workflowSession.id,
          input: event.input,
          output: outputSummary,
          claims,
        },
      });
    };

    const recoveryTools = createLynxSolutionProviderTools(auth, model, {
      approvalToolEnabled: isApprovalToolEnabled,
    });
    const knowledgeTools = createLynxKnowledgeTools({
      organizationId: organization.id,
      userAuthId: session.id,
    });
    const readinessTools = createLynxReadinessTools({
      organizationId: organization.id,
      userAuthId: session.id,
      snapshot: readinessSnapshot,
    });
    const erpReadTools = createLynxErpReadTools({
      organizationId: organization.id,
      userAuthId: session.id,
      capabilities: organization.capabilities,
      sessionSource: session.source,
      readinessSnapshot,
    });
    const rawTools = {
      ...recoveryTools,
      ...knowledgeTools,
      ...readinessTools,
      ...erpReadTools,
    };
    const toolMeta = { ...solutionProviderToolMeta, ...lynxToolMeta };
    const toolMetaByName = toolMeta as Record<
      string,
      (typeof toolMeta)[keyof typeof toolMeta]
    >;

    assertGovernedToolset({
      tools: rawTools,
      meta: toolMetaByName,
      capabilities: organization.capabilities,
    });
    const operatorCheckpoint = createLynxOperatorCheckpoint({
      runId,
      workflowId: workflow,
      workflowSessionId: workflowSession.id,
      tools: Object.keys(rawTools).map((toolName) => {
        const tool = rawTools[toolName as keyof typeof rawTools] as {
          needsApproval?: boolean;
        };
        const meta = toolMetaByName[toolName]!;
        return {
          id: toolName,
          access: meta.access,
          risk: meta.risk,
          requiresApproval: Boolean(tool.needsApproval),
        };
      }),
    });
    const { tools } = createGovernedToolRegistry({
      tools: rawTools,
      meta: toolMetaByName,
      capabilities: organization.capabilities,
      organizationId: organization.id,
      userAuthId: session.id,
      logger: recordToolAudit,
    });
    await executeLynxRecordRunEventCommand({
      organizationId: organization.id,
      runId,
      eventType: "operator.checkpoint",
      summary: "Lynx operator checkpoint persisted before tool loop.",
      metadata: {
        workflowId: workflow,
        workflowSessionId: workflowSession.id,
        checkpoint: operatorCheckpoint,
      },
    });
    await executeLynxUpdateWorkflowSessionCommand({
      organizationId: organization.id,
      id: workflowSession.id,
      status: "active",
      currentStage: "operator.checkpointed",
      latestRunId: runId,
      metadata: {
        requestId,
        workflowId: workflow,
        checkpoint: operatorCheckpoint,
      },
    });

    const agent = createSolutionProviderSpecialistAgent({
      model,
      organizationName: organization.name,
      role: organization.role,
      workflowId: workflow,
      tools,
      maxSteps: LYNX_OPERATOR_MAX_STEPS,
      providerOptions: createGatewayOptions({
        organizationId: organization.id,
        userId: session.id,
        feature: LYNX_GATEWAY_FEATURES.operator,
        moduleId: LYNX_MODULE_ID,
        workflowId: workflow,
        workflowSessionId: workflowSession.id,
        qualityGate: "claim-validation",
        riskLevel: "high",
        environment: getAiGatewayEnvironment(),
        providerOrder: aiGatewayHighConfidenceProviderOrder,
        providerOnly: aiGatewayHighConfidenceProviderOrder,
        fallbackModels: ["openai/gpt-5.5"],
      }),
      onStepFinish: createRouteAgentStepLogger({
        feature: "lynx-operator",
        functionId: LYNX_AUDIT_ACTIONS.operatorRecommend,
        model,
        moduleId: LYNX_MODULE_ID,
        operation: "lynx.operator.step",
        organizationId: organization.id,
        requestId,
        route,
        userAuthId: session.id,
        workflowId: workflow,
        workflowSessionId: workflowSession.id,
      }),
      experimental_telemetry: createRouteAiTelemetrySettings({
        feature: "lynx-operator",
        functionId: LYNX_AUDIT_ACTIONS.operatorRecommend,
        model,
        moduleId: LYNX_MODULE_ID,
        operation: LYNX_AUDIT_ACTIONS.operatorRecommend,
        organizationId: organization.id,
        requestId,
        route,
        userAuthId: session.id,
        workflowId: workflow,
        workflowSessionId: workflowSession.id,
      }),
      onFinish: async ({ totalUsage, finishReason }) => {
        const usageMetrics = getUsageMetrics(totalUsage);
        const qualityGate = combineLynxQualityGates(toolQualityGates);

        await executeLynxCreateAiUsageEventCommand({
          organizationId: organization.id,
          userAuthId: session.id,
          moduleId: "dashboard",
          feature: "lynx-operator",
          model,
          status: "completed",
          latencyMs: Date.now() - startedAt,
          ...usageMetrics,
          metadata: {
            finishReason,
            estimatedPromptTokens,
            workflowId: workflow,
            workflowSessionId: workflowSession.id,
            qualityGate,
          },
        });
        await executeLynxCompleteRunCommand({
          id: runId,
          organizationId: organization.id,
          status: "completed",
          latencyMs: Date.now() - startedAt,
          metadata: {
            finishReason,
            workflowId: workflow,
            workflowSessionId: workflowSession.id,
            readinessStatus: readinessSnapshot.status,
            qualityGate,
          },
        });
        await executeLynxUpdateWorkflowSessionCommand({
          organizationId: organization.id,
          id: workflowSession.id,
          status: "active",
          currentStage: "awaiting_operator_review",
          promptSummary,
          latestRunId: runId,
          evidenceSummary: {
            toolQualityGateCount: toolQualityGates.length,
            readinessStatus: readinessSnapshot.status,
          },
          qualityGateSummary: qualityGate,
          nextRecommendedStep:
            "Review the latest Lynx run and resume this workflow when ready.",
          metadata: {
            finishReason,
            workflowId: workflow,
            requestId,
          },
        });
        await executeLynxRecordRunEventCommand({
          organizationId: organization.id,
          runId,
          eventType: "request.completed",
          summary: "Lynx operator run completed.",
          metadata: {
            finishReason,
            workflowId: workflow,
            workflowSessionId: workflowSession.id,
            qualityGate,
          },
        });
      },
    });

    logServerEvent(
      "info",
      "Lynx operator request started.",
      {
        requestId,
        organizationId: organization.id,
        userId: session.id,
        module: LYNX_MODULE_ID,
        operation: LYNX_AUDIT_ACTIONS.operatorRecommend,
      },
      {
        route,
        model,
        workflowId: workflow,
        workflowSessionId: workflowSession.id,
      },
    );

    return withAiSpan(
      "lynx.operator.stream",
      {
        feature: "lynx-operator",
        model,
        moduleId: LYNX_MODULE_ID,
        organizationId: organization.id,
        requestId,
        workflowSessionId: workflowSession.id,
      },
      () =>
        Promise.resolve(
          createAgentUIStreamResponse({
            agent,
            uiMessages,
            messageMetadata: () =>
              ({
                lynxRun: runContext,
              }) satisfies LynxRunContextMetadata,
          }),
        ),
    );
  } catch (error) {
    if (activeRun) {
      await executeLynxCompleteRunCommand({
        id: activeRun.id,
        organizationId: activeRun.organizationId,
        status: "failed",
        latencyMs: Date.now() - startedAt,
        metadata: {
          workflowId: activeRun.workflowId,
          workflowSessionId: activeRun.workflowSessionId,
          error: error instanceof Error ? error.message : String(error),
        },
      }).catch(() => undefined);
    }
    if (activeWorkflowSession && activeRun) {
      await executeLynxUpdateWorkflowSessionCommand({
        organizationId: activeWorkflowSession.organizationId,
        id: activeWorkflowSession.id,
        status: "failed",
        currentStage: "request.failed",
        latestRunId: activeRun.id,
        nextRecommendedStep: "Review the failed run before resuming.",
        metadata: {
          workflowId: activeRun.workflowId,
          requestId,
          error: error instanceof Error ? error.message : String(error),
        },
      }).catch(() => undefined);
    } else if (activeWorkflowSession) {
      await executeLynxUpdateWorkflowSessionCommand({
        organizationId: activeWorkflowSession.organizationId,
        id: activeWorkflowSession.id,
        status: "failed",
        currentStage: "request.failed",
        nextRecommendedStep: "Review the failed workflow request.",
        metadata: {
          requestId,
          error: error instanceof Error ? error.message : String(error),
        },
      }).catch(() => undefined);
    }

    logServerEvent(
      "error",
      "Lynx operator request failed.",
      {
        requestId,
        module: LYNX_MODULE_ID,
        operation: LYNX_AUDIT_ACTIONS.operatorRecommend,
      },
      {
        route,
        durationMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      },
    );

    return NextResponse.json(
      { error: "Operator request failed." },
      { status: 500 },
    );
  }
}
