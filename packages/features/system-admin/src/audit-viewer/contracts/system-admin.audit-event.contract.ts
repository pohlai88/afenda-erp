export type SystemAdminAuditEventRow = {
  id: string;
  occurredAt: string;
  actorId: string;
  actorType?: string;
  action: string;
  target: string;
  targetType?: string;
  targetId?: string;
  targetDisplayName?: string;
  outcome?: string;
  moduleKey: string;
  result: string;
  summary: string;
};

export type SystemAdminAuditEventDetail = {
  id: string;
  occurredAt: string;
  actorId: string;
  actorType?: string;
  actorRole?: string;
  subjectType?: string;
  subjectId?: string;
  action: string;
  entityType: string;
  entityId: string;
  targetType?: string;
  targetId?: string;
  targetDisplayName?: string;
  moduleKey: string;
  surface?: string;
  route?: string;
  channel?: string;
  outcome?: string;
  reason?: string;
  policyReference?: string;
  approvalId?: string;
  requestId?: string;
  operationId?: string;
  beforeJson?: Record<string, unknown> | null;
  afterJson?: Record<string, unknown> | null;
  diffJson?: readonly Record<string, unknown>[] | null;
  summary: string;
  metadata: Record<string, unknown>;
  /** Policy keys referenced in event metadata when present. */
  policyKeys: readonly string[];
  /** Approval keys referenced in event metadata when present. */
  approvalKeys: readonly string[];
  /** Chronological evidence for the same target (oldest first). */
  timeline: readonly SystemAdminAuditEventRow[];
};
