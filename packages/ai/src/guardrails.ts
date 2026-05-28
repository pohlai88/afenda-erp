import type { AiGatewayFeature } from "./gateway";

export const aiTokenBudgets = {
  "erp-assistant": 8000,
  "document-extraction": 12000,
  "approval-tools": 6000,
  "workspace-summary": 8000,
  "record-search": 4000,
  "document-lookup": 4000,
  "task-drafting": 4000,
  "report-narrative": 10000,
  "anomaly-explanation": 8000,
  "admin-audit-summary": 8000,
  "solution-provider": 14000,
  "lynx-truth": 10000,
  "lynx-operator": 16000,
} as const satisfies Record<AiGatewayFeature, number>;

export class AiBudgetError extends Error {
  readonly code = "AI_BUDGET_EXCEEDED";

  constructor(
    readonly feature: AiGatewayFeature,
    readonly estimatedTokens: number,
    readonly maxTokens: number,
  ) {
    super(
      `AI prompt budget exceeded for ${feature}: ${estimatedTokens} > ${maxTokens}.`,
    );
    this.name = "AiBudgetError";
  }
}

export class AiPermissionError extends Error {
  readonly code = "AI_PERMISSION_DENIED";

  constructor(readonly capability: string) {
    super(`AI tool requires capability: ${capability}.`);
    this.name = "AiPermissionError";
  }
}

export class AiSensitiveContentError extends Error {
  readonly code = "AI_SENSITIVE_CREDENTIAL_CONTENT";

  constructor() {
    super("AI input appears to contain credential-like sensitive content.");
    this.name = "AiSensitiveContentError";
  }
}

export function estimateTokenCount(text: string) {
  return Math.ceil(text.length / 4);
}

export function assertAiBudget(input: {
  estimatedTokens: number;
  feature: AiGatewayFeature;
  maxTokens?: number;
}) {
  const maxTokens = input.maxTokens ?? aiTokenBudgets[input.feature];

  if (input.estimatedTokens > maxTokens) {
    throw new AiBudgetError(input.feature, input.estimatedTokens, maxTokens);
  }
}

export function isAiBudgetError(error: unknown): error is AiBudgetError {
  return error instanceof AiBudgetError;
}

export function isAiPermissionError(
  error: unknown,
): error is AiPermissionError {
  return error instanceof AiPermissionError;
}

export function isAiSensitiveContentError(
  error: unknown,
): error is AiSensitiveContentError {
  return error instanceof AiSensitiveContentError;
}

export function assertCapabilityAllowed(input: {
  capability: string;
  capabilities: readonly string[];
}) {
  if (!input.capabilities.includes(input.capability)) {
    throw new AiPermissionError(input.capability);
  }
}

export function hasSensitiveCredentialPattern(text: string) {
  return /\b(password|secret|api[_-]?key|private[_-]?key|token)\b/i.test(text);
}

export function assertNoSensitiveCredentialContent(text: string) {
  if (hasSensitiveCredentialPattern(text)) {
    throw new AiSensitiveContentError();
  }
}
