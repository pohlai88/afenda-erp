import type { GovernedToolMeta } from "./ai-tools.contract";

// ---------------------------------------------------------------------------
// Tool audit events
// ---------------------------------------------------------------------------

export type GovernedToolAuditEvent = {
  toolName: string;
  meta: GovernedToolMeta;
  organizationId: string;
  userAuthId: string;
  input?: unknown;
  output?: unknown;
};

export type GovernedToolAuditLogger = (
  event: GovernedToolAuditEvent,
) => Promise<void> | void;

// ---------------------------------------------------------------------------
// Sandbox lifecycle events
// ---------------------------------------------------------------------------

export type AiSandboxEventKind =
  | "sandbox.created"
  | "sandbox.approved"
  | "sandbox.rejected"
  | "sandbox.discarded"
  | "sandbox.executed";

export type AiSandboxEvent = {
  kind: AiSandboxEventKind;
  sandboxId: string;
  organizationId: string;
  actorAuthUserId: string;
  actionType: string;
  moduleId: string;
  riskLevel: "low" | "medium" | "high";
  occurredAt: string;
};

// ---------------------------------------------------------------------------
// Gateway usage events
// ---------------------------------------------------------------------------

export type AiGatewayUsageEvent = {
  kind: "gateway.usage";
  feature: string;
  organizationId: string;
  userId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  occurredAt: string;
};

// ---------------------------------------------------------------------------
// Confidence events
// ---------------------------------------------------------------------------

export type AiConfidenceEvent = {
  kind: "confidence.scored";
  organizationId: string;
  feature: string;
  overall: number;
  level: "low" | "medium" | "high";
  requiresHumanReview: boolean;
  occurredAt: string;
};

// ---------------------------------------------------------------------------
// Union
// ---------------------------------------------------------------------------

export type AiEvent = AiSandboxEvent | AiGatewayUsageEvent | AiConfidenceEvent;
