import { and, desc, eq } from "drizzle-orm";
import { createAuditLog } from "./audit";
import { runWithOrganizationContext } from "./client";
import { createEntityId } from "./ids";
import {
  aiActionSandboxes,
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
