import { KNOWLEDGE_AUDIT_ACTIONS } from "../contracts/knowledge.core.contract";

export type KnowledgeAuditAction =
  (typeof KNOWLEDGE_AUDIT_ACTIONS)[keyof typeof KNOWLEDGE_AUDIT_ACTIONS];

export type KnowledgeAuditResult =
  | "started"
  | "completed"
  | "skipped"
  | "failed";

export type KnowledgeAuditEventInput = {
  action: KnowledgeAuditAction;
  organizationId: string;
  sourceId?: string;
  documentId?: string;
  result: KnowledgeAuditResult;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  error?: unknown;
};

const credentialKeyPattern =
  /(api[_-]?key|authorization|client[_-]?secret|cookie|credential|password|private[_-]?key|secret|token)/i;
const credentialValuePattern =
  /(Bearer\s+)[^\s,;]+|((?:api[_-]?key|client[_-]?secret|password|private[_-]?key|secret|token)\s*[=:]\s*)[^\s,;]+/gi;

function redactSensitiveText(value: string) {
  return value.replace(
    credentialValuePattern,
    (_match, bearerPrefix: string | undefined, keyPrefix: string | undefined) =>
      `${bearerPrefix ?? keyPrefix ?? ""}[redacted]`,
  );
}

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[truncated-depth]";
  if (typeof value === "string") {
    const redacted = redactSensitiveText(value);
    return redacted.length > 2000
      ? `${redacted.slice(0, 2000)}...[truncated]`
      : redacted;
  }
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((entry) => sanitizeValue(entry, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, 40)
      .map(([key, entry]) => [
        key,
        credentialKeyPattern.test(key)
          ? "[redacted]"
          : sanitizeValue(entry, depth + 1),
      ]),
  );
}

export function sanitizeKnowledgeAuditMetadata(
  metadata: Record<string, unknown> = {},
) {
  return sanitizeValue(metadata) as Record<string, unknown>;
}

export function formatKnowledgeAuditError(error: unknown) {
  if (!error) return undefined;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: redactSensitiveText(error.message),
    };
  }
  return {
    message: redactSensitiveText(String(error)),
  };
}

export function createKnowledgeAuditEvent(input: KnowledgeAuditEventInput) {
  return {
    level: input.result === "failed" ? "error" : "info",
    audit: true,
    action: input.action,
    organizationId: input.organizationId,
    ...(input.sourceId ? { sourceId: input.sourceId } : {}),
    ...(input.documentId ? { documentId: input.documentId } : {}),
    result: input.result,
    ...(typeof input.durationMs === "number"
      ? { durationMs: input.durationMs }
      : {}),
    metadata: sanitizeKnowledgeAuditMetadata(input.metadata),
    ...(input.error ? { error: formatKnowledgeAuditError(input.error) } : {}),
    timestamp: new Date().toISOString(),
  };
}

export function emitKnowledgeAuditEvent(input: KnowledgeAuditEventInput): void {
  const event = createKnowledgeAuditEvent(input);
  const line = JSON.stringify(event);

  if (event.level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
}
