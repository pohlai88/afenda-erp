import type { AfendaTransaction } from "@afenda/db";
import {
  writeExecutionAuditEvent,
  writeExecutionAuditEventInTransaction,
  type ExecutionAuditEvent,
} from "@afenda/kernel/execution";
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

function resolveKnowledgeAuditTarget(input: KnowledgeAuditEventInput) {
  if (input.documentId) {
    return {
      targetType: "document",
      targetId: input.documentId,
      subjectType: "knowledge-document",
      subjectId: input.documentId,
    };
  }

  if (input.sourceId) {
    return {
      targetType: "system",
      targetId: input.sourceId,
      subjectType: "knowledge-source",
      subjectId: input.sourceId,
      targetDisplayName: `knowledge-source:${input.sourceId}`,
    };
  }

  return {
    targetType: "system",
    targetId: input.organizationId,
    subjectType: "knowledge",
    subjectId: input.organizationId,
  };
}

function resolveKnowledgeAuditChannel(input: KnowledgeAuditEventInput) {
  if (
    input.action === KNOWLEDGE_AUDIT_ACTIONS.SOURCE_SYNC_COMPLETE ||
    input.action === KNOWLEDGE_AUDIT_ACTIONS.SOURCE_SYNC_FAIL
  ) {
    return "cron";
  }

  return "server_action";
}

export function createKnowledgeExecutionAuditEvent(
  input: KnowledgeAuditEventInput,
): ExecutionAuditEvent {
  const event = createKnowledgeAuditEvent(input);
  const metadata = {
    result: input.result,
    level: event.level,
    ...(event.durationMs ? { durationMs: event.durationMs } : {}),
    ...(event.metadata ? event.metadata : {}),
    ...(event.error ? { error: event.error } : {}),
  };
  const target = resolveKnowledgeAuditTarget(input);

  return {
    organizationId: input.organizationId,
    module: "knowledge",
    surface: "knowledge-audit",
    actorId: "system:knowledge",
    actorType: "service",
    action: input.action,
    outcome: input.result === "failed" ? "failure" : "success",
    channel: resolveKnowledgeAuditChannel(input),
    summary: `${input.action} ${input.result}.`,
    metadata,
    ...target,
  };
}

export async function emitKnowledgeAuditEvent(
  input: KnowledgeAuditEventInput,
): Promise<void> {
  await writeExecutionAuditEvent(createKnowledgeExecutionAuditEvent(input));
}

export async function emitKnowledgeAuditEventInTransaction(
  db: AfendaTransaction,
  input: KnowledgeAuditEventInput,
): Promise<void> {
  await writeExecutionAuditEventInTransaction(
    db,
    createKnowledgeExecutionAuditEvent(input),
  );
}
