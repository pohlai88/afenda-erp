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
  /** Chronological evidence for the same target (oldest first). */
  timeline: readonly SystemAdminAuditEventRow[];
};
