import {
  createAuditLog,
  insertAuditLog,
  type AuditEntityType,
  type AfendaTransaction,
} from "@afenda/db";

export type ExecutionAuditEvent = {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  action: string;
  targetType: string;
  targetId?: string;
  reason?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
};

const auditEntityTypeByTargetType: Record<string, AuditEntityType> = {
  organization: "organization",
  membership: "membership",
  "user-profile": "user-profile",
  record: "erp-record",
  "erp-record": "erp-record",
  "workflow-item": "workflow-item",
  "saved-view": "saved-view",
  document: "document",
  system: "system",
};

export function resolveExecutionAuditEntityType(targetType: string) {
  return auditEntityTypeByTargetType[targetType] ?? "system";
}

function buildExecutionAuditSummary(input: ExecutionAuditEvent) {
  if (input.summary) {
    return input.summary;
  }

  const targetLabel = input.targetId
    ? `${input.targetType}:${input.targetId}`
    : input.targetType;

  return `${input.action} executed against ${targetLabel}.`;
}

function buildExecutionAuditLogInput(input: ExecutionAuditEvent) {
  const entityType = resolveExecutionAuditEntityType(input.targetType);

  return {
    organizationId: input.organizationId,
    actorAuthUserId: input.actorId,
    entityType,
    entityId: input.targetId ?? input.organizationId,
    action: input.action,
    summary: buildExecutionAuditSummary(input),
    metadata: {
      actorType: input.actorType,
      executionTargetType: input.targetType,
      ...(input.reason ? { reason: input.reason } : {}),
      ...(input.metadata ?? {}),
    },
  };
}

export async function writeExecutionAuditEvent(input: ExecutionAuditEvent) {
  await createAuditLog(buildExecutionAuditLogInput(input));
}

/** Persist audit in the same Postgres transaction as the domain mutation. */
export async function writeExecutionAuditEventInTransaction(
  db: AfendaTransaction,
  input: ExecutionAuditEvent,
) {
  await insertAuditLog(db, buildExecutionAuditLogInput(input));
}
