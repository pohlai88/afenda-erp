import { and, desc, eq, gte, ilike, inArray, lte, sql } from "drizzle-orm";
import { createAuditLog } from "./audit";
import { getDb, runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  aiFeatureEntitlements,
  aiActionSandboxes,
  aiApprovalProposals,
  aiDocumentExtractions,
  aiUsageEvents,
  lynxEvalCaseResults,
  lynxEvalCases,
  lynxEvalSets,
  lynxOutcomeMonitorSettings,
  lynxRunEvents,
  lynxRunFeedback,
  lynxRuns,
  lynxWorkflowSessions,
  organizations,
} from "./schema";
import type { ErpModuleId } from "./erp";

export type AiFeature =
  | "assistant"
  | "document-extraction"
  | "approval-tool"
  | "solution-provider"
  | "lynx-truth"
  | "lynx-operator";

const AI_FEATURE_KEYS: readonly AiFeature[] = [
  "assistant",
  "document-extraction",
  "approval-tool",
  "solution-provider",
  "lynx-truth",
  "lynx-operator",
];

export type AiFeatureEntitlementSummary = {
  feature: AiFeature;
  enabled: boolean;
  updatedAt: Date | null;
  updatedByAuthUserId: string | null;
};
export type AiRequestStatus = "started" | "completed" | "failed";
export type AiExtractionStatus = "completed" | "needs-review" | "failed";
export type AiApprovalStatus =
  | "proposed"
  | "approved"
  | "rejected"
  | "executed";

export type AiApprovalProposalSummary = {
  id: string;
  moduleId: string;
  proposedAction: string;
  rationale: string;
  riskLevel: string;
  status: AiApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type AiSandboxStatus = "pending" | "approved" | "rejected" | "discarded";

export type AiActionSandboxRecord = {
  id: string;
  organizationId: string;
  moduleId: string;
  actionType: string;
  title: string;
  proposedBy: string;
  status: AiSandboxStatus;
  diff: Record<string, unknown>;
  riskAssessment: Record<string, unknown>;
  sourceEvidence: Record<string, unknown>[];
  rollbackMetadata: Record<string, unknown> | null;
  approvalProposalId: string | null;
  rejectionReason: string | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AiActionSandboxSummary = {
  id: string;
  moduleId: string;
  actionType: string;
  title: string;
  proposedBy: string;
  status: AiSandboxStatus;
  riskLevel: string;
  approvalProposalId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AiUsageSummary = {
  id: string;
  feature: AiFeature;
  model: string;
  status: AiRequestStatus;
  totalTokens: number;
  latencyMs: number;
  createdAt: Date;
};

export async function createAiUsageEvent(input: {
  organizationId: string;
  userAuthId: string;
  moduleId: ErpModuleId;
  feature: AiFeature;
  model: string;
  status: AiRequestStatus;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const id = createEntityId("aiuse");

    await db.insert(aiUsageEvents).values({
      id,
      organizationId: input.organizationId,
      userAuthId: input.userAuthId,
      moduleId: input.moduleId,
      feature: input.feature,
      model: input.model,
      status: input.status,
      promptTokens: input.promptTokens ?? 0,
      completionTokens: input.completionTokens ?? 0,
      totalTokens: input.totalTokens ?? 0,
      latencyMs: input.latencyMs ?? 0,
      errorMessage: input.errorMessage,
      metadata: input.metadata ?? {},
    });

    return id;
  });
}

export async function listAiFeatureEntitlements(input: {
  organizationId: string;
}): Promise<AiFeatureEntitlementSummary[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        feature: aiFeatureEntitlements.feature,
        enabled: aiFeatureEntitlements.enabled,
        updatedAt: aiFeatureEntitlements.updatedAt,
        updatedByAuthUserId: aiFeatureEntitlements.updatedByAuthUserId,
      })
      .from(aiFeatureEntitlements)
      .where(eq(aiFeatureEntitlements.organizationId, input.organizationId));

    const byFeature = new Map(rows.map((row) => [row.feature as AiFeature, row]));

    return AI_FEATURE_KEYS.map((feature) => {
      const row = byFeature.get(feature);
      return {
        feature,
        enabled: row?.enabled ?? true,
        updatedAt: row?.updatedAt ?? null,
        updatedByAuthUserId: row?.updatedByAuthUserId ?? null,
      };
    });
  });
}

export async function isAiFeatureEnabledForOrganization(input: {
  organizationId: string;
  feature: AiFeature;
}): Promise<boolean> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({ enabled: aiFeatureEntitlements.enabled })
      .from(aiFeatureEntitlements)
      .where(
        and(
          eq(aiFeatureEntitlements.organizationId, input.organizationId),
          eq(aiFeatureEntitlements.feature, input.feature),
        ),
      )
      .limit(1);

    return rows[0]?.enabled ?? true;
  });
}

export async function upsertAiFeatureEntitlement(input: {
  organizationId: string;
  feature: AiFeature;
  enabled: boolean;
  actorAuthUserId: string;
}): Promise<void> {
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .insert(aiFeatureEntitlements)
      .values({
        organizationId: input.organizationId,
        feature: input.feature,
        enabled: input.enabled,
        updatedByAuthUserId: input.actorAuthUserId,
      })
      .onConflictDoUpdate({
        target: [
          aiFeatureEntitlements.organizationId,
          aiFeatureEntitlements.feature,
        ],
        set: {
          enabled: input.enabled,
          updatedByAuthUserId: input.actorAuthUserId,
          updatedAt: new Date(),
        },
      });
  });
}

export async function listAiUsageEvents(input: {
  organizationId: string;
  limit?: number;
}): Promise<AiUsageSummary[]> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select({
        id: aiUsageEvents.id,
        feature: aiUsageEvents.feature,
        model: aiUsageEvents.model,
        status: aiUsageEvents.status,
        totalTokens: aiUsageEvents.totalTokens,
        latencyMs: aiUsageEvents.latencyMs,
        createdAt: aiUsageEvents.createdAt,
      })
      .from(aiUsageEvents)
      .where(eq(aiUsageEvents.organizationId, input.organizationId))
      .orderBy(desc(aiUsageEvents.createdAt))
      .limit(input.limit ?? 8),
  );
}

export async function registerAiDocumentExtraction(input: {
  organizationId: string;
  documentId?: string;
  moduleId: ErpModuleId;
  requestedByAuthUserId: string;
  model: string;
  status: AiExtractionStatus;
  confidence: number;
  extracted: Record<string, unknown>;
  reviewNotes: string;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const id = createEntityId("aiextract");

    await db.insert(aiDocumentExtractions).values({
      id,
      organizationId: input.organizationId,
      documentId: input.documentId ?? null,
      moduleId: input.moduleId,
      requestedByAuthUserId: input.requestedByAuthUserId,
      model: input.model,
      status: input.status,
      confidence: input.confidence,
      extracted: input.extracted,
      reviewNotes: input.reviewNotes,
    });

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.requestedByAuthUserId,
      entityType: "document",
      entityId: input.documentId ?? id,
      action: "ai.document.extract",
      summary: `AI extraction registered with ${input.confidence}% confidence.`,
      metadata: {
        extractionId: id,
        moduleId: input.moduleId,
        model: input.model,
        status: input.status,
      },
    });

    return id;
  });
}

export async function listAiApprovalProposals(input: {
  organizationId: string;
  limit?: number;
}): Promise<AiApprovalProposalSummary[]> {
  return runWithOrganizationContext(input.organizationId, async (db) =>
    db
      .select({
        id: aiApprovalProposals.id,
        moduleId: aiApprovalProposals.moduleId,
        proposedAction: aiApprovalProposals.proposedAction,
        rationale: aiApprovalProposals.rationale,
        riskLevel: aiApprovalProposals.riskLevel,
        status: aiApprovalProposals.status,
        createdAt: aiApprovalProposals.createdAt,
        updatedAt: aiApprovalProposals.updatedAt,
      })
      .from(aiApprovalProposals)
      .where(eq(aiApprovalProposals.organizationId, input.organizationId))
      .orderBy(desc(aiApprovalProposals.createdAt))
      .limit(input.limit ?? 20),
  );
}

export async function registerAiApprovalProposal(input: {
  organizationId: string;
  workItemId?: string;
  moduleId: ErpModuleId;
  requestedByAuthUserId: string;
  model: string;
  status: AiApprovalStatus;
  proposedAction: string;
  rationale: string;
  riskLevel: string;
  toolInput: Record<string, unknown>;
  toolOutput: Record<string, unknown>;
}) {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const id = createEntityId("aiprop");

    await db.insert(aiApprovalProposals).values({
      id,
      organizationId: input.organizationId,
      workItemId: input.workItemId ?? null,
      moduleId: input.moduleId,
      requestedByAuthUserId: input.requestedByAuthUserId,
      model: input.model,
      status: input.status,
      proposedAction: input.proposedAction,
      rationale: input.rationale,
      riskLevel: input.riskLevel,
      toolInput: input.toolInput,
      toolOutput: input.toolOutput,
    });

    await createAuditLog({
      organizationId: input.organizationId,
      actorAuthUserId: input.requestedByAuthUserId,
      entityType: "workflow-item",
      entityId: input.workItemId ?? id,
      action: "ai.approval.propose",
      summary: `AI approval proposal recorded for ${input.proposedAction}.`,
      metadata: {
        proposalId: id,
        moduleId: input.moduleId,
        model: input.model,
        status: input.status,
        riskLevel: input.riskLevel,
      },
    });

    return id;
  });
}

export async function createAiActionSandbox(input: {
  id: string;
  organizationId: string;
  moduleId: string;
  actionType: string;
  title: string;
  proposedBy: "ai" | "user";
  status: AiSandboxStatus;
  diff: Record<string, unknown>;
  riskAssessment: Record<string, unknown>;
  sourceEvidence?: Record<string, unknown>[];
  rollbackMetadata?: Record<string, unknown> | null;
  approvalProposalId?: string;
  rejectionReason?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}): Promise<string> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    await db.insert(aiActionSandboxes).values({
      id: input.id,
      organizationId: input.organizationId,
      moduleId: input.moduleId,
      actionType: input.actionType,
      title: input.title,
      proposedBy: input.proposedBy,
      status: input.status,
      diff: input.diff,
      riskAssessment: input.riskAssessment,
      sourceEvidence: input.sourceEvidence ?? [],
      rollbackMetadata: input.rollbackMetadata ?? null,
      approvalProposalId: input.approvalProposalId ?? null,
      rejectionReason: input.rejectionReason ?? null,
      approvedAt: input.approvedAt ?? null,
      rejectedAt: input.rejectedAt ?? null,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
    return input.id;
  });
}

export async function getAiActionSandboxById(input: {
  id: string;
  organizationId: string;
}): Promise<AiActionSandboxRecord | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select({
        id: aiActionSandboxes.id,
        organizationId: aiActionSandboxes.organizationId,
        moduleId: aiActionSandboxes.moduleId,
        actionType: aiActionSandboxes.actionType,
        title: aiActionSandboxes.title,
        proposedBy: aiActionSandboxes.proposedBy,
        status: aiActionSandboxes.status,
        diff: aiActionSandboxes.diff,
        riskAssessment: aiActionSandboxes.riskAssessment,
        sourceEvidence: aiActionSandboxes.sourceEvidence,
        rollbackMetadata: aiActionSandboxes.rollbackMetadata,
        approvalProposalId: aiActionSandboxes.approvalProposalId,
        rejectionReason: aiActionSandboxes.rejectionReason,
        approvedAt: aiActionSandboxes.approvedAt,
        rejectedAt: aiActionSandboxes.rejectedAt,
        createdAt: aiActionSandboxes.createdAt,
        updatedAt: aiActionSandboxes.updatedAt,
      })
      .from(aiActionSandboxes)
      .where(
        and(
          eq(aiActionSandboxes.id, input.id),
          eq(aiActionSandboxes.organizationId, input.organizationId),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      ...row,
      status: row.status as AiSandboxStatus,
    };
  });
}

export async function listAiActionSandboxes(input: {
  organizationId: string;
  moduleId?: string;
  status?: AiSandboxStatus;
  limit?: number;
}): Promise<AiActionSandboxSummary[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      eq(aiActionSandboxes.organizationId, input.organizationId),
      ...(input.moduleId
        ? [eq(aiActionSandboxes.moduleId, input.moduleId)]
        : []),
      ...(input.status ? [eq(aiActionSandboxes.status, input.status)] : []),
    ];

    const rows = await db
      .select({
        id: aiActionSandboxes.id,
        moduleId: aiActionSandboxes.moduleId,
        actionType: aiActionSandboxes.actionType,
        title: aiActionSandboxes.title,
        proposedBy: aiActionSandboxes.proposedBy,
        status: aiActionSandboxes.status,
        riskAssessment: aiActionSandboxes.riskAssessment,
        approvalProposalId: aiActionSandboxes.approvalProposalId,
        createdAt: aiActionSandboxes.createdAt,
        updatedAt: aiActionSandboxes.updatedAt,
      })
      .from(aiActionSandboxes)
      .where(and(...conditions))
      .orderBy(desc(aiActionSandboxes.createdAt))
      .limit(input.limit ?? 20);

    return rows.map((row) => ({
      id: row.id,
      moduleId: row.moduleId,
      actionType: row.actionType,
      title: row.title,
      proposedBy: row.proposedBy,
      status: row.status as AiSandboxStatus,
      riskLevel:
        (row.riskAssessment as { riskLevel?: string })?.riskLevel ?? "medium",
      approvalProposalId: row.approvalProposalId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  });
}

export async function transitionAiActionSandbox(input: {
  id: string;
  organizationId: string;
  to: "approved" | "rejected" | "discarded";
  reason?: string;
  actorAuthUserId: string;
}): Promise<void> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const existing = await db
      .select({ status: aiActionSandboxes.status })
      .from(aiActionSandboxes)
      .where(
        and(
          eq(aiActionSandboxes.id, input.id),
          eq(aiActionSandboxes.organizationId, input.organizationId),
        ),
      )
      .limit(1);

    const currentStatus = existing[0]?.status;
    if (!currentStatus) {
      throw new Error("AI action sandbox was not found for this organization.");
    }

    if (currentStatus !== "pending") {
      throw new Error(
        `Cannot transition sandbox from ${currentStatus} to ${input.to}.`,
      );
    }

    const now = new Date();
    await db
      .update(aiActionSandboxes)
      .set({
        status: input.to,
        ...(input.to === "approved" ? { approvedAt: now } : {}),
        ...(input.to === "rejected"
          ? { rejectedAt: now, rejectionReason: input.reason ?? null }
          : {}),
        updatedAt: now,
      })
      .where(
        and(
          eq(aiActionSandboxes.id, input.id),
          eq(aiActionSandboxes.organizationId, input.organizationId),
        ),
      );
  });
}

export type LynxRunStatus = AiRequestStatus;
export type LynxWorkflowSessionStatus =
  | "active"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";
export type LynxRunFeedbackRating = "positive" | "negative";
export type LynxRunFeedbackCategory =
  | "accurate"
  | "unsupported"
  | "wrong-tool"
  | "slow"
  | "unsafe"
  | "other";

export type LynxRunLedgerFilters = {
  runIds?: string[];
  status?: LynxRunStatus;
  route?: string;
  workflowId?: string;
  workflowSessionId?: string;
  model?: string;
  toolName?: string;
  qualityGate?: "unsupported" | "lowCitationPrecision" | "failedQualityGate";
  search?: string;
  startedFrom?: Date;
  startedTo?: Date;
  from?: Date;
  to?: Date;
  origin?: string;
  monitorStatus?: string;
  severity?: string;
  provider?: string;
};

export type LynxRunLedgerSummary = {
  id: string;
  organizationId: string;
  userAuthId: string;
  route: string;
  workflowId: string | null;
  workflowSessionId: string | null;
  model: string;
  status: LynxRunStatus;
  promptSummary: string;
  latencyMs: number;
  metadata: Record<string, unknown>;
  startedAt: Date;
  completedAt: Date | null;
};

export type LynxRunEventSummary = {
  id: string;
  runId: string;
  eventType: string;
  toolName: string | null;
  summary: string;
  inputSummary: Record<string, unknown> | null;
  outputSummary: Record<string, unknown> | null;
  evidenceReferences: Record<string, unknown>[];
  validationMetrics: Record<string, unknown>;
  approvalProposalId: string | null;
  sandboxId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

export type LynxRunFeedbackSummary = {
  id: string;
  runId: string;
  userAuthId: string;
  rating: LynxRunFeedbackRating;
  category: LynxRunFeedbackCategory;
  note: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type LynxRunDetail = LynxRunLedgerSummary & {
  events: LynxRunEventSummary[];
  feedback: LynxRunFeedbackSummary[];
};

export type LynxRunAnalyticsSummary = {
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  startedRuns: number;
  averageLatencyMs: number;
  toolCallCount: number;
  evidenceReferenceCount: number;
  feedbackCount: number;
  negativeFeedbackCount: number;
  failedQualityGateCount: number;
  unsupportedClaimCount: number;
  lowCitationPrecisionCount: number;
};

export type LynxWorkflowSessionSummary = {
  id: string;
  organizationId: string;
  userAuthId: string;
  workflowId: string;
  status: LynxWorkflowSessionStatus;
  currentStage: string;
  promptSummary: string;
  latestRunId: string | null;
  evidenceSummary: Record<string, unknown>;
  qualityGateSummary: Record<string, unknown>;
  nextRecommendedStep: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type LynxWorkflowSessionFilters = {
  status?: LynxWorkflowSessionStatus;
  workflowId?: string;
  origin?: string;
  monitorStatus?: string;
  severity?: string;
};

type LynxWorkflowSessionListInput = {
  organizationId: string;
  filters?: LynxWorkflowSessionFilters;
  status?: LynxWorkflowSessionStatus;
  workflowId?: string;
  origin?: string;
  monitorStatus?: string;
  severity?: string;
  limit?: number;
};

export type LynxOutcomeSweepTarget = {
  organizationId: string;
  organizationName: string;
  ownerAuthUserId: string;
};

export type LynxObservabilityOverview = {
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  failedQualityGateCount: number;
  unsupportedClaimCount: number;
  lowCitationPrecisionCount: number;
  proactiveWatchCount: number;
  proactiveBlockedCount: number;
  workflowSessionsCreated: number;
  workflowSessionsUpdated: number;
  averageLatencyMs: number;
  maxLatencyMs: number;
};

export type LynxLatencyAnalyticsRow = {
  route: string;
  workflowId: string;
  model: string;
  runCount: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  maxLatencyMs: number;
};

export type LynxQualityAnalyticsRow = {
  workflowId: string;
  route: string;
  failedQualityGateCount: number;
  unsupportedClaimCount: number;
  lowCitationPrecisionCount: number;
};

export type LynxProactiveOutcomeAnalyticsRow = {
  monitorId: string;
  status: string;
  severity: string;
  count: number;
};

export type LynxSpendAnalyticsRow = {
  feature: string;
  model: string;
  provider: string;
  totalRequests: number;
  totalTokens: number;
  estimatedCostUsd: number;
};

export type LynxOutcomeMonitorSetting = {
  id: string;
  organizationId: string;
  monitorId: string;
  enabled: boolean;
  thresholds: Record<string, unknown>;
  ownerAuthUserId: string | null;
  severityPolicy: Record<string, unknown>;
  updatedByAuthUserId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LynxEvalSetRecord = {
  id: string;
  organizationId: string;
  evalSetId: string;
  version: number;
  workflowId: string;
  moduleId: string;
  status: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type LynxEvalCaseRecord = {
  id: string;
  organizationId: string;
  evalSetRowId: string;
  caseId: string;
  query: string;
  expectedEvidenceIds: string[];
  expectedBehavior: string;
  shouldAnswer: boolean;
  containsPromptInjection: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type LynxRepresentativeEvalFailure = {
  id: string;
  caseId: string;
  query: string;
  observedAnswer: string;
  retrievedEvidenceIds: string[];
  metrics: Record<string, unknown>;
  failureReasons: string[];
  semanticGrade: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

function buildLynxRunConditions(input: {
  organizationId: string;
  filters?: LynxRunLedgerFilters;
}) {
  const filters = input.filters;
  return [
    eq(lynxRuns.organizationId, input.organizationId),
    filters?.status ? eq(lynxRuns.status, filters.status) : undefined,
    filters?.runIds && filters.runIds.length > 0
      ? inArray(lynxRuns.id, filters.runIds)
      : undefined,
    filters?.route ? eq(lynxRuns.route, filters.route) : undefined,
    filters?.workflowId
      ? eq(lynxRuns.workflowId, filters.workflowId)
      : undefined,
    filters?.workflowSessionId
      ? eq(lynxRuns.workflowSessionId, filters.workflowSessionId)
      : undefined,
    filters?.model ? eq(lynxRuns.model, filters.model) : undefined,
    filters?.search
      ? ilike(lynxRuns.promptSummary, `%${filters.search}%`)
      : undefined,
    (filters?.startedFrom ?? filters?.from)
      ? gte(lynxRuns.startedAt, (filters.startedFrom ?? filters.from)!)
      : undefined,
    (filters?.startedTo ?? filters?.to)
      ? lte(lynxRuns.startedAt, (filters.startedTo ?? filters.to)!)
      : undefined,
    filters?.origin
      ? sql`${lynxRuns.metadata}->>'origin' = ${filters.origin}`
      : undefined,
    filters?.monitorStatus
      ? sql`${lynxRuns.metadata}->'monitorStatuses' @> ${JSON.stringify([
          { status: filters.monitorStatus },
        ])}::jsonb`
      : undefined,
    filters?.severity
      ? sql`${lynxRuns.metadata}->'monitorStatuses' @> ${JSON.stringify([
          { severity: filters.severity },
        ])}::jsonb`
      : undefined,
  ].filter((condition) => condition !== undefined);
}

function getQualityGate(value: Record<string, unknown> | null | undefined) {
  const gate = value?.qualityGate;
  return typeof gate === "object" && gate !== null
    ? (gate as Record<string, unknown>)
    : null;
}

function getQualityGateStatus(value: Record<string, unknown>) {
  return typeof value.status === "string" ? value.status : "";
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function hasQualityGateMatch(
  metrics: Record<string, unknown>,
  filter: LynxRunLedgerFilters["qualityGate"],
) {
  const gate = getQualityGate(metrics);
  if (!gate) return false;
  if (filter === "failedQualityGate")
    return getQualityGateStatus(gate) === "failed";
  if (filter === "unsupported") {
    return getNumber(gate.unsupportedClaimCount) > 0;
  }
  if (filter === "lowCitationPrecision") {
    return getNumber(gate.citationPrecision, 1) < 0.8;
  }
  return true;
}

function mapRun(row: typeof lynxRuns.$inferSelect): LynxRunLedgerSummary {
  return {
    id: row.id,
    organizationId: row.organizationId,
    userAuthId: row.userAuthId,
    route: row.route,
    workflowId: row.workflowId,
    workflowSessionId: row.workflowSessionId,
    model: row.model,
    status: row.status as LynxRunStatus,
    promptSummary: row.promptSummary,
    latencyMs: row.latencyMs,
    metadata: row.metadata,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
  };
}

function mapRunEvent(
  row: typeof lynxRunEvents.$inferSelect,
): LynxRunEventSummary {
  return {
    id: row.id,
    runId: row.runId,
    eventType: row.eventType,
    toolName: row.toolName,
    summary: row.summary,
    inputSummary: row.inputSummary,
    outputSummary: row.outputSummary,
    evidenceReferences: row.evidenceReferences,
    validationMetrics: row.validationMetrics,
    approvalProposalId: row.approvalProposalId,
    sandboxId: row.sandboxId,
    metadata: row.metadata,
    createdAt: row.createdAt,
  };
}

function mapFeedback(
  row: typeof lynxRunFeedback.$inferSelect,
): LynxRunFeedbackSummary {
  return {
    id: row.id,
    runId: row.runId,
    userAuthId: row.userAuthId,
    rating: row.rating as LynxRunFeedbackRating,
    category: row.category as LynxRunFeedbackCategory,
    note: row.note,
    metadata: row.metadata,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapWorkflowSession(
  row: typeof lynxWorkflowSessions.$inferSelect,
): LynxWorkflowSessionSummary {
  return {
    id: row.id,
    organizationId: row.organizationId,
    userAuthId: row.userAuthId,
    workflowId: row.workflowId,
    status: row.status as LynxWorkflowSessionStatus,
    currentStage: row.currentStage,
    promptSummary: row.promptSummary,
    latestRunId: row.latestRunId,
    evidenceSummary: row.evidenceSummary,
    qualityGateSummary: row.qualityGateSummary,
    nextRecommendedStep: row.nextRecommendedStep,
    metadata: row.metadata,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function createLynxRun(input: {
  organizationId: string;
  userAuthId: string;
  route: string;
  workflowId?: string;
  workflowSessionId?: string;
  model: string;
  promptSummary: string;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const id = createEntityId("lynxrun");
    await db.insert(lynxRuns).values({
      id,
      organizationId: input.organizationId,
      userAuthId: input.userAuthId,
      route: input.route,
      workflowId: input.workflowId ?? null,
      workflowSessionId: input.workflowSessionId ?? null,
      model: input.model,
      status: "started",
      promptSummary: input.promptSummary || "Lynx run",
      metadata: input.metadata ?? {},
    });
    return id;
  });
}

export async function completeLynxRun(input: {
  id: string;
  organizationId: string;
  status: LynxRunStatus;
  latencyMs: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(lynxRuns)
      .set({
        status: input.status,
        latencyMs: Math.max(0, Math.round(input.latencyMs)),
        metadata: input.metadata ?? {},
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(lynxRuns.id, input.id),
          eq(lynxRuns.organizationId, input.organizationId),
        ),
      );
  });
}

export async function recordLynxRunEvent(input: {
  organizationId: string;
  runId: string;
  eventType: string;
  summary: string;
  toolName?: string;
  inputSummary?: Record<string, unknown> | null;
  outputSummary?: Record<string, unknown> | null;
  evidenceReferences?: Record<string, unknown>[];
  validationMetrics?: Record<string, unknown>;
  approvalProposalId?: string | null;
  sandboxId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const id = createEntityId("lynxevt");
    await db.insert(lynxRunEvents).values({
      id,
      organizationId: input.organizationId,
      runId: input.runId,
      eventType: input.eventType,
      toolName: input.toolName ?? null,
      summary: input.summary,
      inputSummary: input.inputSummary ?? null,
      outputSummary: input.outputSummary ?? null,
      evidenceReferences: input.evidenceReferences ?? [],
      validationMetrics: input.validationMetrics ?? {},
      approvalProposalId: input.approvalProposalId ?? null,
      sandboxId: input.sandboxId ?? null,
      metadata: input.metadata ?? {},
    });
    return id;
  });
}

export async function listLynxRunEvents(input: {
  organizationId: string;
  runId: string;
  limit?: number;
}): Promise<LynxRunEventSummary[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select()
      .from(lynxRunEvents)
      .where(
        and(
          eq(lynxRunEvents.organizationId, input.organizationId),
          eq(lynxRunEvents.runId, input.runId),
        ),
      )
      .orderBy(desc(lynxRunEvents.createdAt))
      .limit(input.limit ?? 200);
    return rows.reverse().map(mapRunEvent);
  });
}

export async function listLynxRunFeedback(input: {
  organizationId: string;
  runId: string;
  limit?: number;
}): Promise<LynxRunFeedbackSummary[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select()
      .from(lynxRunFeedback)
      .where(
        and(
          eq(lynxRunFeedback.organizationId, input.organizationId),
          eq(lynxRunFeedback.runId, input.runId),
        ),
      )
      .orderBy(desc(lynxRunFeedback.createdAt))
      .limit(input.limit ?? 50);
    return rows.map(mapFeedback);
  });
}

async function listRunIdsMatchingEventFilters(input: {
  organizationId: string;
  filters?: LynxRunLedgerFilters;
}): Promise<string[] | null> {
  if (!input.filters?.toolName && !input.filters?.qualityGate) return null;
  const db = getDb();
  const events = await db
    .select({
      runId: lynxRunEvents.runId,
      toolName: lynxRunEvents.toolName,
      validationMetrics: lynxRunEvents.validationMetrics,
    })
    .from(lynxRunEvents)
    .where(eq(lynxRunEvents.organizationId, input.organizationId))
    .limit(2_000);
  const matches = events.filter((event) => {
    if (input.filters?.toolName && event.toolName !== input.filters.toolName) {
      return false;
    }
    return input.filters?.qualityGate
      ? hasQualityGateMatch(event.validationMetrics, input.filters.qualityGate)
      : true;
  });
  return [...new Set(matches.map((event) => event.runId))];
}

export async function listLynxRunLedger(input: {
  organizationId: string;
  filters?: LynxRunLedgerFilters;
  runIds?: string[];
  limit?: number;
}): Promise<LynxRunLedgerSummary[]> {
  const filters = {
    ...input.filters,
    ...(input.runIds ? { runIds: input.runIds } : {}),
  };
  const eventRunIds = await listRunIdsMatchingEventFilters({
    organizationId: input.organizationId,
    filters,
  });
  if (eventRunIds && eventRunIds.length === 0) return [];

  return runWithOrganizationContext(input.organizationId, async (db) => {
    const conditions = [
      ...buildLynxRunConditions({
        organizationId: input.organizationId,
        filters,
      }),
      eventRunIds ? inArray(lynxRuns.id, eventRunIds) : undefined,
    ].filter((condition) => condition !== undefined);
    const rows = await db
      .select()
      .from(lynxRuns)
      .where(and(...conditions))
      .orderBy(desc(lynxRuns.startedAt))
      .limit(input.limit ?? 100);
    return rows.map(mapRun);
  });
}

export async function getLynxRunDetail(input: {
  organizationId: string;
  runId: string;
}): Promise<LynxRunDetail | null> {
  const [runs, events, feedback] = await Promise.all([
    listLynxRunLedger({
      organizationId: input.organizationId,
      runIds: [input.runId],
      limit: 1,
    }),
    listLynxRunEvents({
      organizationId: input.organizationId,
      runId: input.runId,
    }),
    listLynxRunFeedback({
      organizationId: input.organizationId,
      runId: input.runId,
    }),
  ]);
  const run = runs.find((item) => item.id === input.runId);
  return run ? { ...run, events, feedback } : null;
}

function analyzeRunSet(
  runs: readonly LynxRunLedgerSummary[],
  events: readonly LynxRunEventSummary[],
  feedback: readonly LynxRunFeedbackSummary[] = [],
): LynxRunAnalyticsSummary {
  const failedQualityGateCount = events.filter((event) =>
    hasQualityGateMatch(event.validationMetrics, "failedQualityGate"),
  ).length;
  return {
    totalRuns: runs.length,
    completedRuns: runs.filter((run) => run.status === "completed").length,
    failedRuns: runs.filter((run) => run.status === "failed").length,
    startedRuns: runs.filter((run) => run.status === "started").length,
    averageLatencyMs:
      runs.length === 0
        ? 0
        : Math.round(
            runs.reduce((total, run) => total + run.latencyMs, 0) / runs.length,
          ),
    toolCallCount: events.filter((event) => event.toolName).length,
    evidenceReferenceCount: events.reduce(
      (total, event) => total + event.evidenceReferences.length,
      0,
    ),
    feedbackCount: feedback.length,
    negativeFeedbackCount: feedback.filter((item) => item.rating === "negative")
      .length,
    failedQualityGateCount,
    unsupportedClaimCount: events.reduce((total, event) => {
      const gate = getQualityGate(event.validationMetrics);
      return total + getNumber(gate?.unsupportedClaimCount);
    }, 0),
    lowCitationPrecisionCount: events.filter((event) =>
      hasQualityGateMatch(event.validationMetrics, "lowCitationPrecision"),
    ).length,
  };
}

async function listEventsForRuns(input: {
  organizationId: string;
  runIds: readonly string[];
}) {
  if (input.runIds.length === 0) return [];
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select()
      .from(lynxRunEvents)
      .where(
        and(
          eq(lynxRunEvents.organizationId, input.organizationId),
          inArray(lynxRunEvents.runId, [...input.runIds]),
        ),
      )
      .limit(5_000);
    return rows.map(mapRunEvent);
  });
}

async function listFeedbackForRuns(input: {
  organizationId: string;
  runIds: readonly string[];
}) {
  if (input.runIds.length === 0) return [];
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select()
      .from(lynxRunFeedback)
      .where(
        and(
          eq(lynxRunFeedback.organizationId, input.organizationId),
          inArray(lynxRunFeedback.runId, [...input.runIds]),
        ),
      )
      .limit(2_000);
    return rows.map(mapFeedback);
  });
}

export async function getLynxRunAnalytics(input: {
  organizationId: string;
  filters?: LynxRunLedgerFilters;
  limit?: number;
}): Promise<LynxRunAnalyticsSummary> {
  const runs = await listLynxRunLedger(input);
  const runIds = runs.map((run) => run.id);
  const [events, feedback] = await Promise.all([
    listEventsForRuns({ organizationId: input.organizationId, runIds }),
    listFeedbackForRuns({ organizationId: input.organizationId, runIds }),
  ]);
  return analyzeRunSet(runs, events, feedback);
}

export async function recordLynxRunFeedback(input: {
  organizationId: string;
  runId: string;
  userAuthId: string;
  rating: LynxRunFeedbackRating;
  category: LynxRunFeedbackCategory;
  note?: string;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const id = createEntityId("lynxfb");
    await db.insert(lynxRunFeedback).values({
      id,
      organizationId: input.organizationId,
      runId: input.runId,
      userAuthId: input.userAuthId,
      rating: input.rating,
      category: input.category,
      note: input.note ?? "",
      metadata: input.metadata ?? {},
    });
    return id;
  });
}

export async function createLynxWorkflowSession(input: {
  organizationId: string;
  userAuthId: string;
  workflowId: string;
  currentStage: string;
  promptSummary: string;
  latestRunId?: string | null;
  evidenceSummary?: Record<string, unknown>;
  qualityGateSummary?: Record<string, unknown>;
  nextRecommendedStep: string;
  metadata?: Record<string, unknown>;
}): Promise<LynxWorkflowSessionSummary> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const id = createEntityId("lynxwf");
    const rows = await db
      .insert(lynxWorkflowSessions)
      .values({
        id,
        organizationId: input.organizationId,
        userAuthId: input.userAuthId,
        workflowId: input.workflowId,
        status: "active",
        currentStage: input.currentStage,
        promptSummary: input.promptSummary,
        latestRunId: input.latestRunId ?? null,
        evidenceSummary: input.evidenceSummary ?? {},
        qualityGateSummary: input.qualityGateSummary ?? {},
        nextRecommendedStep: input.nextRecommendedStep,
        metadata: input.metadata ?? {},
      })
      .returning();
    return mapWorkflowSession(rows[0]!);
  });
}

export async function updateLynxWorkflowSession(input: {
  organizationId: string;
  id: string;
  status?: LynxWorkflowSessionStatus;
  currentStage?: string;
  promptSummary?: string;
  latestRunId?: string | null;
  evidenceSummary?: Record<string, unknown>;
  qualityGateSummary?: Record<string, unknown>;
  nextRecommendedStep?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await runWithOrganizationContext(input.organizationId, async (db) => {
    await db
      .update(lynxWorkflowSessions)
      .set({
        ...(input.status ? { status: input.status } : {}),
        ...(input.currentStage ? { currentStage: input.currentStage } : {}),
        ...(input.promptSummary ? { promptSummary: input.promptSummary } : {}),
        ...(input.latestRunId !== undefined
          ? { latestRunId: input.latestRunId }
          : {}),
        ...(input.evidenceSummary
          ? { evidenceSummary: input.evidenceSummary }
          : {}),
        ...(input.qualityGateSummary
          ? { qualityGateSummary: input.qualityGateSummary }
          : {}),
        ...(input.nextRecommendedStep
          ? { nextRecommendedStep: input.nextRecommendedStep }
          : {}),
        ...(input.metadata ? { metadata: input.metadata } : {}),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(lynxWorkflowSessions.organizationId, input.organizationId),
          eq(lynxWorkflowSessions.id, input.id),
        ),
      );
  });
}

export async function getLynxWorkflowSession(input: {
  organizationId: string;
  id: string;
}): Promise<LynxWorkflowSessionSummary | null> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select()
      .from(lynxWorkflowSessions)
      .where(
        and(
          eq(lynxWorkflowSessions.organizationId, input.organizationId),
          eq(lynxWorkflowSessions.id, input.id),
        ),
      )
      .limit(1);
    return rows[0] ? mapWorkflowSession(rows[0]) : null;
  });
}

export async function listLynxWorkflowSessions(
  input: LynxWorkflowSessionListInput,
): Promise<LynxWorkflowSessionSummary[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const filters = {
      ...input.filters,
      ...(input.status ? { status: input.status } : {}),
      ...(input.workflowId ? { workflowId: input.workflowId } : {}),
      ...(input.origin ? { origin: input.origin } : {}),
      ...(input.monitorStatus ? { monitorStatus: input.monitorStatus } : {}),
      ...(input.severity ? { severity: input.severity } : {}),
    };
    const conditions = [
      eq(lynxWorkflowSessions.organizationId, input.organizationId),
      filters?.status
        ? eq(lynxWorkflowSessions.status, filters.status)
        : undefined,
      filters?.workflowId
        ? eq(lynxWorkflowSessions.workflowId, filters.workflowId)
        : undefined,
      filters?.origin
        ? sql`${lynxWorkflowSessions.metadata}->>'origin' = ${filters.origin}`
        : undefined,
      filters?.monitorStatus
        ? sql`${lynxWorkflowSessions.metadata}->>'monitorStatus' = ${filters.monitorStatus}`
        : undefined,
      filters?.severity
        ? sql`${lynxWorkflowSessions.metadata}->>'severity' = ${filters.severity}`
        : undefined,
    ].filter((condition) => condition !== undefined);
    const rows = await db
      .select()
      .from(lynxWorkflowSessions)
      .where(and(...conditions))
      .orderBy(desc(lynxWorkflowSessions.updatedAt))
      .limit(input.limit ?? 100);
    return rows.map(mapWorkflowSession);
  });
}

export async function findOpenLynxWorkflowSession(input: {
  organizationId: string;
  workflowId: string;
  origin?: string;
}): Promise<LynxWorkflowSessionSummary | null> {
  const sessions = await listLynxWorkflowSessions({
    organizationId: input.organizationId,
    filters: {
      workflowId: input.workflowId,
      origin: input.origin,
    },
    limit: 20,
  });
  return (
    sessions.find(
      (session) => session.status === "active" || session.status === "paused",
    ) ?? null
  );
}

export async function listLynxOutcomeSweepTargets(): Promise<
  LynxOutcomeSweepTarget[]
> {
  const db = getDb();
  const rows = await db
    .select({
      organizationId: organizations.id,
      organizationName: organizations.name,
      ownerAuthUserId: organizations.ownerAuthUserId,
    })
    .from(organizations)
    .limit(500);
  return rows;
}

function defaultMonitorSetting(input: {
  organizationId: string;
  monitorId: string;
  ownerAuthUserId: string;
}) {
  return {
    id: createEntityId("lynxmon"),
    organizationId: input.organizationId,
    monitorId: input.monitorId,
    enabled: true,
    thresholds: {},
    ownerAuthUserId: input.ownerAuthUserId,
    severityPolicy: {},
    updatedByAuthUserId: input.ownerAuthUserId,
  };
}

export async function getLynxOutcomeMonitorSettings(input: {
  organizationId: string;
  monitorIds: readonly string[];
}): Promise<LynxOutcomeMonitorSetting[]> {
  if (input.monitorIds.length === 0) return [];
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const orgRows = await db
      .select({ ownerAuthUserId: organizations.ownerAuthUserId })
      .from(organizations)
      .where(eq(organizations.id, input.organizationId))
      .limit(1);
    const ownerAuthUserId = orgRows[0]?.ownerAuthUserId ?? "system";

    for (const monitorId of input.monitorIds) {
      await db
        .insert(lynxOutcomeMonitorSettings)
        .values(
          defaultMonitorSetting({
            organizationId: input.organizationId,
            monitorId,
            ownerAuthUserId,
          }),
        )
        .onConflictDoNothing();
    }

    const rows = await db
      .select()
      .from(lynxOutcomeMonitorSettings)
      .where(
        and(
          eq(lynxOutcomeMonitorSettings.organizationId, input.organizationId),
          inArray(lynxOutcomeMonitorSettings.monitorId, [...input.monitorIds]),
        ),
      )
      .orderBy(lynxOutcomeMonitorSettings.monitorId);
    return rows;
  });
}

export async function updateLynxOutcomeMonitorSetting(input: {
  organizationId: string;
  monitorId: string;
  enabled: boolean;
  thresholds: Record<string, unknown>;
  ownerAuthUserId?: string | null;
  severityPolicy: Record<string, unknown>;
  updatedByAuthUserId: string;
}): Promise<LynxOutcomeMonitorSetting> {
  await getLynxOutcomeMonitorSettings({
    organizationId: input.organizationId,
    monitorIds: [input.monitorId],
  });

  const rows = await runWithOrganizationContext(
    input.organizationId,
    async (db) =>
      db
        .update(lynxOutcomeMonitorSettings)
        .set({
          enabled: input.enabled,
          thresholds: input.thresholds,
          ownerAuthUserId: input.ownerAuthUserId ?? null,
          severityPolicy: input.severityPolicy,
          updatedByAuthUserId: input.updatedByAuthUserId,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(lynxOutcomeMonitorSettings.organizationId, input.organizationId),
            eq(lynxOutcomeMonitorSettings.monitorId, input.monitorId),
          ),
        )
        .returning(),
  );

  const row = rows[0];
  if (!row) {
    throw new Error(
      "Lynx outcome monitor setting update did not return a row.",
    );
  }

  await createAuditLog({
    organizationId: input.organizationId,
    actorAuthUserId: input.updatedByAuthUserId,
    entityType: "system",
    entityId: input.monitorId,
    action: "lynx.outcome-monitor.update",
    summary: `Lynx proactive monitor ${input.monitorId} setting updated.`,
    metadata: {
      enabled: input.enabled,
      ownerAuthUserId: input.ownerAuthUserId ?? null,
    },
  });

  return row;
}

async function getRunsAndEventsForAnalytics(input: {
  organizationId: string;
  filters?: LynxRunLedgerFilters;
}) {
  const filters = {
    from:
      input.filters?.from ??
      input.filters?.startedFrom ??
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1_000),
    to: input.filters?.to ?? input.filters?.startedTo,
    ...input.filters,
  };
  const runs = await listLynxRunLedger({
    organizationId: input.organizationId,
    filters,
    limit: 2_000,
  });
  const events = await listEventsForRuns({
    organizationId: input.organizationId,
    runIds: runs.map((run) => run.id),
  });
  return { runs, events };
}

export async function getLynxObservabilityOverview(input: {
  organizationId: string;
  filters?: LynxRunLedgerFilters;
}): Promise<LynxObservabilityOverview> {
  const { runs, events } = await getRunsAndEventsForAnalytics(input);
  const analytics = analyzeRunSet(runs, events);
  const workflowEvents = events.filter(
    (event) => event.eventType === "workflow.session-linked",
  );
  return {
    totalRuns: analytics.totalRuns,
    completedRuns: analytics.completedRuns,
    failedRuns: analytics.failedRuns,
    failedQualityGateCount: analytics.failedQualityGateCount,
    unsupportedClaimCount: analytics.unsupportedClaimCount,
    lowCitationPrecisionCount: analytics.lowCitationPrecisionCount,
    proactiveWatchCount: events.filter(
      (event) => event.eventType === "outcome.watch",
    ).length,
    proactiveBlockedCount: events.filter(
      (event) => event.eventType === "outcome.blocked",
    ).length,
    workflowSessionsCreated: workflowEvents.filter(
      (event) => event.metadata.workflowAction === "created",
    ).length,
    workflowSessionsUpdated: workflowEvents.filter(
      (event) => event.metadata.workflowAction === "updated",
    ).length,
    averageLatencyMs: analytics.averageLatencyMs,
    maxLatencyMs: runs.reduce((max, run) => Math.max(max, run.latencyMs), 0),
  };
}

function percentile(values: readonly number[], p: number) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  );
  return sorted[index] ?? 0;
}

export async function getLynxLatencyAnalytics(input: {
  organizationId: string;
  filters?: LynxRunLedgerFilters;
}): Promise<LynxLatencyAnalyticsRow[]> {
  const { runs } = await getRunsAndEventsForAnalytics(input);
  const groups = new Map<string, LynxRunLedgerSummary[]>();
  for (const run of runs) {
    const key = `${run.route}\0${run.workflowId ?? "-"}\0${run.model}`;
    groups.set(key, [...(groups.get(key) ?? []), run]);
  }
  return [...groups.entries()].map(([key, group]) => {
    const [route, workflowId, model] = key.split("\0");
    const latencies = group.map((run) => run.latencyMs);
    return {
      route: route ?? "-",
      workflowId: workflowId ?? "-",
      model: model ?? "-",
      runCount: group.length,
      p50LatencyMs: percentile(latencies, 50),
      p95LatencyMs: percentile(latencies, 95),
      maxLatencyMs: Math.max(...latencies, 0),
    };
  });
}

export async function getLynxQualityAnalytics(input: {
  organizationId: string;
  filters?: LynxRunLedgerFilters;
}): Promise<LynxQualityAnalyticsRow[]> {
  const { runs, events } = await getRunsAndEventsForAnalytics(input);
  const runsById = new Map(runs.map((run) => [run.id, run]));
  const groups = new Map<string, LynxQualityAnalyticsRow>();
  for (const event of events) {
    const run = runsById.get(event.runId);
    if (!run) continue;
    const key = `${run.workflowId ?? "-"}\0${run.route}`;
    const row = groups.get(key) ?? {
      workflowId: run.workflowId ?? "-",
      route: run.route,
      failedQualityGateCount: 0,
      unsupportedClaimCount: 0,
      lowCitationPrecisionCount: 0,
    };
    if (hasQualityGateMatch(event.validationMetrics, "failedQualityGate")) {
      row.failedQualityGateCount += 1;
    }
    if (hasQualityGateMatch(event.validationMetrics, "unsupported")) {
      row.unsupportedClaimCount += getNumber(
        getQualityGate(event.validationMetrics)?.unsupportedClaimCount,
        1,
      );
    }
    if (hasQualityGateMatch(event.validationMetrics, "lowCitationPrecision")) {
      row.lowCitationPrecisionCount += 1;
    }
    groups.set(key, row);
  }
  return [...groups.values()];
}

export async function getLynxProactiveOutcomeAnalytics(input: {
  organizationId: string;
  filters?: LynxRunLedgerFilters;
}): Promise<LynxProactiveOutcomeAnalyticsRow[]> {
  const { events } = await getRunsAndEventsForAnalytics(input);
  const groups = new Map<string, LynxProactiveOutcomeAnalyticsRow>();
  for (const event of events) {
    if (!event.eventType.startsWith("outcome.")) continue;
    const monitor =
      typeof event.metadata.monitor === "object" && event.metadata.monitor
        ? (event.metadata.monitor as Record<string, unknown>)
        : event.metadata;
    const monitorId =
      typeof monitor.monitorId === "string" ? monitor.monitorId : "-";
    const status = event.eventType.replace("outcome.", "");
    const severity =
      typeof monitor.severity === "string" ? monitor.severity : "-";
    if (
      input.filters?.monitorStatus &&
      input.filters.monitorStatus !== status
    ) {
      continue;
    }
    if (input.filters?.severity && input.filters.severity !== severity) {
      continue;
    }
    const key = `${monitorId}\0${status}\0${severity}`;
    const existing = groups.get(key);
    groups.set(key, {
      monitorId,
      status,
      severity,
      count: (existing?.count ?? 0) + 1,
    });
  }
  return [...groups.values()];
}

export async function getLynxSpendAnalytics(input: {
  organizationId: string;
  filters?: LynxRunLedgerFilters;
}): Promise<LynxSpendAnalyticsRow[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const from =
      input.filters?.from ??
      input.filters?.startedFrom ??
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1_000);
    const to = input.filters?.to ?? input.filters?.startedTo;
    const rows = await db
      .select()
      .from(aiUsageEvents)
      .where(
        and(
          eq(aiUsageEvents.organizationId, input.organizationId),
          gte(aiUsageEvents.createdAt, from),
          to ? lte(aiUsageEvents.createdAt, to) : undefined,
          input.filters?.model
            ? eq(aiUsageEvents.model, input.filters.model)
            : undefined,
        ),
      )
      .limit(2_000);
    const groups = new Map<string, LynxSpendAnalyticsRow>();
    for (const row of rows) {
      const provider =
        typeof row.metadata.provider === "string"
          ? row.metadata.provider
          : row.model.includes("/")
            ? row.model.split("/")[0]!
            : "gateway";
      if (input.filters?.provider && input.filters.provider !== provider) {
        continue;
      }
      const key = `${row.feature}\0${row.model}\0${provider}`;
      const existing =
        groups.get(key) ??
        ({
          feature: row.feature,
          model: row.model,
          provider,
          totalRequests: 0,
          totalTokens: 0,
          estimatedCostUsd: 0,
        } satisfies LynxSpendAnalyticsRow);
      existing.totalRequests += 1;
      existing.totalTokens += row.totalTokens;
      existing.estimatedCostUsd += getNumber(row.metadata.estimatedCostUsd);
      groups.set(key, existing);
    }
    return [...groups.values()];
  });
}

export async function getLynxEvalSets(input: {
  organizationId: string;
  limit?: number;
}): Promise<LynxEvalSetRecord[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select()
      .from(lynxEvalSets)
      .where(eq(lynxEvalSets.organizationId, input.organizationId))
      .orderBy(desc(lynxEvalSets.updatedAt))
      .limit(input.limit ?? 50);
    return rows;
  });
}

export async function createLynxEvalSet(input: {
  organizationId: string;
  evalSetId: string;
  version: number;
  workflowId: string;
  moduleId: string;
  status: string;
  description?: string;
  metadata?: Record<string, unknown>;
}): Promise<LynxEvalSetRecord> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const existing = await db
      .select()
      .from(lynxEvalSets)
      .where(
        and(
          eq(lynxEvalSets.organizationId, input.organizationId),
          eq(lynxEvalSets.evalSetId, input.evalSetId),
          eq(lynxEvalSets.version, input.version),
        ),
      )
      .limit(1);
    if (existing[0]) return existing[0];

    const rows = await db
      .insert(lynxEvalSets)
      .values({
        id: createEntityId("lynxevalset"),
        organizationId: input.organizationId,
        evalSetId: input.evalSetId,
        version: input.version,
        workflowId: input.workflowId,
        moduleId: input.moduleId,
        status: input.status,
        description: input.description ?? "",
        metadata: input.metadata ?? {},
      })
      .returning();
    return rows[0]!;
  });
}

export async function upsertLynxEvalCase(input: {
  organizationId: string;
  evalSetRowId: string;
  caseId: string;
  query: string;
  expectedEvidenceIds: string[];
  expectedBehavior: string;
  shouldAnswer: boolean;
  containsPromptInjection: boolean;
  metadata?: Record<string, unknown>;
}): Promise<LynxEvalCaseRecord> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const existing = await db
      .select()
      .from(lynxEvalCases)
      .where(
        and(
          eq(lynxEvalCases.organizationId, input.organizationId),
          eq(lynxEvalCases.evalSetRowId, input.evalSetRowId),
          eq(lynxEvalCases.caseId, input.caseId),
        ),
      )
      .limit(1);

    if (existing[0]) {
      const rows = await db
        .update(lynxEvalCases)
        .set({
          query: input.query,
          expectedEvidenceIds: input.expectedEvidenceIds,
          expectedBehavior: input.expectedBehavior,
          shouldAnswer: input.shouldAnswer,
          containsPromptInjection: input.containsPromptInjection,
          metadata: input.metadata ?? {},
          updatedAt: new Date(),
        })
        .where(eq(lynxEvalCases.id, existing[0].id))
        .returning();
      return rows[0]!;
    }

    const rows = await db
      .insert(lynxEvalCases)
      .values({
        id: createEntityId("lynxevalcase"),
        organizationId: input.organizationId,
        evalSetRowId: input.evalSetRowId,
        caseId: input.caseId,
        query: input.query,
        expectedEvidenceIds: input.expectedEvidenceIds,
        expectedBehavior: input.expectedBehavior,
        shouldAnswer: input.shouldAnswer,
        containsPromptInjection: input.containsPromptInjection,
        metadata: input.metadata ?? {},
      })
      .returning();
    return rows[0]!;
  });
}

export async function recordLynxEvalCaseResult(input: {
  organizationId: string;
  evalRunId: string;
  evalSetRowId: string;
  evalCaseRowId: string;
  caseId: string;
  query: string;
  observedAnswer: string;
  retrievedEvidenceIds: string[];
  metrics: Record<string, unknown>;
  failureReasons: string[];
  semanticGrade?: unknown | null;
  representativeFailure: boolean;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const id = createEntityId("lynxevalres");
    await db.insert(lynxEvalCaseResults).values({
      id,
      organizationId: input.organizationId,
      evalRunId: input.evalRunId,
      evalSetRowId: input.evalSetRowId,
      evalCaseRowId: input.evalCaseRowId,
      caseId: input.caseId,
      query: input.query,
      observedAnswer: input.observedAnswer,
      retrievedEvidenceIds: input.retrievedEvidenceIds,
      metrics: input.metrics,
      failureReasons: input.failureReasons,
      semanticGrade:
        typeof input.semanticGrade === "object" || input.semanticGrade === null
          ? (input.semanticGrade as Record<string, unknown> | null)
          : null,
      representativeFailure: input.representativeFailure,
      metadata: input.metadata ?? {},
    });
    return id;
  });
}

export async function listRepresentativeLynxEvalFailures(input: {
  organizationId: string;
  limit?: number;
}): Promise<LynxRepresentativeEvalFailure[]> {
  return runWithOrganizationContext(input.organizationId, async (db) => {
    const rows = await db
      .select()
      .from(lynxEvalCaseResults)
      .where(
        and(
          eq(lynxEvalCaseResults.organizationId, input.organizationId),
          eq(lynxEvalCaseResults.representativeFailure, true),
        ),
      )
      .orderBy(desc(lynxEvalCaseResults.createdAt))
      .limit(input.limit ?? 20);
    return rows.map((row) => ({
      id: row.id,
      caseId: row.caseId,
      query: row.query,
      observedAnswer: row.observedAnswer,
      retrievedEvidenceIds: row.retrievedEvidenceIds,
      metrics: row.metrics,
      failureReasons: row.failureReasons,
      semanticGrade: row.semanticGrade,
      metadata: row.metadata,
      createdAt: row.createdAt,
    }));
  });
}
