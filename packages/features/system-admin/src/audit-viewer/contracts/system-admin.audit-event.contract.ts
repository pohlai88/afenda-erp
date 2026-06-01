export type SystemAdminAuditEventRow = {
  id: string;
  occurredAt: string;
  actorId: string;
  action: string;
  target: string;
  moduleKey: string;
  result: string;
  summary: string;
};

export type SystemAdminAuditEventDetail = {
  id: string;
  occurredAt: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  moduleKey: string;
  summary: string;
  metadata: Record<string, unknown>;
  /** Policy keys referenced in event metadata when present. */
  policyKeys: readonly string[];
  /** Approval keys referenced in event metadata when present. */
  approvalKeys: readonly string[];
  /** Chronological evidence for the same target (oldest first). */
  timeline: readonly SystemAdminAuditEventRow[];
};
