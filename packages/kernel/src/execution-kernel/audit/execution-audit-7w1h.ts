import type { AuditEntityType } from "@afenda/db";
import {
  type ExecutionAuditDbInput,
  type ExecutionAuditEvent,
  type NormalizedExecutionAuditEvent,
} from "./execution-audit.types";
import { buildExecutionAuditDiff } from "./execution-audit-diff";
import {
  redactExecutionAuditDiff,
  redactExecutionAuditRecord,
} from "./execution-audit-redaction";

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
  if (input.summary?.trim()) {
    return input.summary.trim();
  }

  const targetLabel = input.targetDisplayName
    ? input.targetDisplayName
    : input.targetId
      ? `${input.targetType}:${input.targetId}`
      : input.targetType;

  return `${input.action} executed against ${targetLabel}.`;
}

export function normalizeExecutionAuditEvent(
  input: ExecutionAuditEvent,
): NormalizedExecutionAuditEvent {
  const targetId = input.targetId ?? input.organizationId;
  const metadata = redactExecutionAuditRecord(input.metadata ?? {}) ?? {};
  const before = redactExecutionAuditRecord(input.before);
  const after = redactExecutionAuditRecord(input.after);
  const diff =
    redactExecutionAuditDiff(input.diff) ??
    (before || after ? buildExecutionAuditDiff(before, after) : []);

  return {
    ...input,
    targetId,
    summary: buildExecutionAuditSummary(input),
    outcome: input.outcome ?? "success",
    metadata,
    before,
    after,
    diff,
    occurredAt: input.occurredAt ?? new Date(),
  };
}

export function buildExecutionAuditDbInput(
  input: NormalizedExecutionAuditEvent,
): ExecutionAuditDbInput {
  const entityType = resolveExecutionAuditEntityType(input.targetType);

  return {
    organizationId: input.organizationId,
    actorAuthUserId: input.actorId,
    actorType: input.actorType,
    actorRole: input.actorRole,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    entityType,
    entityId: input.targetId,
    action: input.action,
    summary: input.summary,
    outcome: input.outcome,
    targetType: input.targetType,
    targetId: input.targetId,
    targetDisplayName: input.targetDisplayName,
    module: input.module,
    surface: input.surface,
    route: input.route,
    channel: input.channel,
    reason: input.reason,
    policyReference: input.policyReference,
    approvalId: input.approvalId,
    requestId: input.requestId,
    operationId: input.operationId,
    beforeJson: input.before,
    afterJson: input.after,
    diffJson: input.diff,
    metadata: input.metadata,
    occurredAt: input.occurredAt,
  };
}
