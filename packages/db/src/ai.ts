import { desc, eq } from "drizzle-orm";
import { createAuditLog } from "./audit";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  aiApprovalProposals,
  aiDocumentExtractions,
  aiUsageEvents,
} from "./schema";
import type { ErpModuleId } from "./erp";

export type AiFeature =
  | "assistant"
  | "document-extraction"
  | "approval-tool"
  | "solution-provider";
export type AiRequestStatus = "started" | "completed" | "failed";
export type AiExtractionStatus = "completed" | "needs-review" | "failed";
export type AiApprovalStatus = "proposed" | "approved" | "rejected" | "executed";

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
