import type { AuditEntityType } from "@afenda/db";

export type ExecutionAuditActorType =
  | "user"
  | "system"
  | "service"
  | "integration"
  | "agent";

export type ExecutionAuditOutcome = "success" | "failure" | "denied";

export type ExecutionAuditChannel =
  | "web"
  | "api"
  | "server_action"
  | "cron"
  | "webhook"
  | "migration";

export type AuditDiff = {
  path: string;
  change: "added" | "removed" | "changed";
  before?: unknown;
  after?: unknown;
};

export type WriteExecutionAuditEventInput = {
  organizationId: string;
  module?: string;
  surface?: string;
  route?: string;

  actorId: string;
  actorType: ExecutionAuditActorType;
  actorRole?: string;

  subjectType?: string;
  subjectId?: string;

  action: string;
  summary?: string;
  outcome?: ExecutionAuditOutcome;

  targetType: string;
  targetId?: string;
  targetDisplayName?: string;

  reason?: string;
  policyReference?: string;
  approvalId?: string;

  channel?: ExecutionAuditChannel;
  requestId?: string;
  operationId?: string;

  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  diff?: AuditDiff[];
  metadata?: Record<string, unknown>;

  occurredAt?: Date;
};

export type ExecutionAuditEvent = WriteExecutionAuditEventInput;

export type NormalizedExecutionAuditEvent = Required<
  Pick<
    WriteExecutionAuditEventInput,
    | "organizationId"
    | "actorId"
    | "actorType"
    | "action"
    | "summary"
    | "outcome"
    | "targetType"
    | "targetId"
  >
> &
  Omit<
    WriteExecutionAuditEventInput,
    "organizationId" | "actorId" | "actorType" | "action" | "summary" | "outcome" | "targetType" | "targetId"
  > & {
    metadata: Record<string, unknown>;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    diff: AuditDiff[];
    occurredAt: Date;
  };

export type ExecutionAuditDbInput = {
  organizationId: string;
  actorAuthUserId: string;
  actorType?: ExecutionAuditActorType;
  actorRole?: string;
  subjectType?: string;
  subjectId?: string;
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  summary: string;
  outcome?: ExecutionAuditOutcome;
  targetType?: string;
  targetId?: string;
  targetDisplayName?: string;
  module?: string;
  surface?: string;
  route?: string;
  channel?: ExecutionAuditChannel;
  reason?: string;
  policyReference?: string;
  approvalId?: string;
  requestId?: string;
  operationId?: string;
  beforeJson?: Record<string, unknown>;
  afterJson?: Record<string, unknown>;
  diffJson?: AuditDiff[];
  metadata: Record<string, unknown>;
  occurredAt?: Date;
};

export const executionAuditEntityTypes = [
  "organization",
  "membership",
  "user-profile",
  "erp-record",
  "workflow-item",
  "saved-view",
  "document",
  "system",
] as const satisfies readonly AuditEntityType[];
