import {
  actionSandboxSchema,
  type ActionDiff,
  type ActionSandbox,
  type GroundedEvidence,
  type OperationalModuleId,
  type RiskAssessment,
} from "../schemas/ai.operations.schema";

export type CreateActionSandboxInput = {
  organizationId: string;
  moduleId: OperationalModuleId;
  actionType: string;
  title: string;
  proposedBy?: "ai" | "user";
  riskLevel: "low" | "medium" | "high";
  summary: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  affectedRecords?: readonly string[];
  creates?: number;
  updates?: number;
  deletes?: number;
  sourceEvidence?: readonly GroundedEvidence[];
  requiredHumanChecks?: readonly string[];
};

function createSandboxId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `aisbx_${globalThis.crypto.randomUUID()}`;
  }

  return `aisbx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function assessRisk(input: CreateActionSandboxInput): RiskAssessment {
  const affectedCount = input.affectedRecords?.length ?? 0;
  const baseScore =
    input.riskLevel === "high" ? 75 : input.riskLevel === "medium" ? 50 : 25;
  const score = Math.min(
    100,
    baseScore + affectedCount * 3 + (input.deletes ?? 0) * 10,
  );
  const reasons = [
    `${input.riskLevel} risk action in ${input.moduleId}.`,
    affectedCount > 0
      ? `${affectedCount} source record(s) may be affected.`
      : "No source records are directly attached.",
  ];
  const requiredHumanChecks =
    input.requiredHumanChecks && input.requiredHumanChecks.length > 0
      ? [...input.requiredHumanChecks].slice(0, 10)
      : [
          "Confirm owner, affected records, and rollback path before execution.",
        ];

  return {
    riskLevel: input.riskLevel,
    score,
    reasons: reasons.slice(0, 10),
    requiredHumanChecks,
    canAutoApply: false,
  };
}

function assertSandboxCanTransition(input: {
  sandbox: ActionSandbox;
  targetStatus: "approved" | "rejected" | "discarded";
}) {
  if (input.sandbox.status !== "pending") {
    throw new Error(
      `Cannot mark ${input.sandbox.status} sandbox as ${input.targetStatus}.`,
    );
  }
}

export function createActionSandbox(
  input: CreateActionSandboxInput,
): ActionSandbox {
  const now = new Date().toISOString();
  const diff: ActionDiff = {
    summary: input.summary,
    before: input.before ?? {},
    after: input.after ?? {},
    affectedRecords: [...(input.affectedRecords ?? [])],
    creates: input.creates ?? 0,
    updates: input.updates ?? 0,
    deletes: input.deletes ?? 0,
  };

  return actionSandboxSchema.parse({
    id: createSandboxId(),
    organizationId: input.organizationId,
    moduleId: input.moduleId,
    actionType: input.actionType,
    title: input.title,
    proposedBy: input.proposedBy ?? "ai",
    status: "pending",
    diff,
    riskAssessment: assessRisk(input),
    sourceEvidence: [...(input.sourceEvidence ?? [])].slice(0, 40),
    rollbackMetadata: {
      reversible: (input.deletes ?? 0) === 0,
      strategy:
        (input.deletes ?? 0) === 0
          ? "Persist before/after payloads and reverse generated changes if rejected or rolled back."
          : "Deletion-like actions require manual rollback validation before execution.",
    },
    createdAt: now,
    updatedAt: now,
  });
}

export function approveActionSandbox(input: {
  sandbox: ActionSandbox;
  approvedAt?: string;
}): ActionSandbox {
  assertSandboxCanTransition({
    sandbox: input.sandbox,
    targetStatus: "approved",
  });

  const approvedAt = input.approvedAt ?? new Date().toISOString();

  return actionSandboxSchema.parse({
    ...input.sandbox,
    status: "approved",
    approvedAt,
    updatedAt: approvedAt,
  });
}

export function rejectActionSandbox(input: {
  sandbox: ActionSandbox;
  reason: string;
  rejectedAt?: string;
}): ActionSandbox {
  assertSandboxCanTransition({
    sandbox: input.sandbox,
    targetStatus: "rejected",
  });

  const rejectedAt = input.rejectedAt ?? new Date().toISOString();

  return actionSandboxSchema.parse({
    ...input.sandbox,
    status: "rejected",
    rejectedAt,
    rejectionReason: input.reason,
    updatedAt: rejectedAt,
  });
}

export function discardActionSandbox(input: {
  sandbox: ActionSandbox;
  discardedAt?: string;
}): ActionSandbox {
  assertSandboxCanTransition({
    sandbox: input.sandbox,
    targetStatus: "discarded",
  });

  const discardedAt = input.discardedAt ?? new Date().toISOString();

  return actionSandboxSchema.parse({
    ...input.sandbox,
    status: "discarded",
    updatedAt: discardedAt,
  });
}
