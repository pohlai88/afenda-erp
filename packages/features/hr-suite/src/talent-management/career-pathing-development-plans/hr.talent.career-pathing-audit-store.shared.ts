import { createEntityId } from "@afenda/db";

export type HrCareerPathingAuditEventRecord = {
  id: string;
  organizationId: string;
  occurredAt: Date;
  action: string;
  summary: string;
  actorAuthUserId: string | null;
  employeeId: string | null;
  planId: string | null;
  metadata: Record<string, unknown> | null;
};

const auditStore = new Map<string, HrCareerPathingAuditEventRecord[]>();

function storeKey(organizationId: string) {
  return organizationId;
}

export function appendHrCareerPathingAuditEventToStore(input: {
  organizationId: string;
  action: string;
  summary: string;
  actorAuthUserId?: string | null;
  employeeId?: string | null;
  planId?: string | null;
  metadata?: Record<string, unknown> | null;
}): HrCareerPathingAuditEventRecord {
  const event: HrCareerPathingAuditEventRecord = {
    id: createEntityId("car_aud"),
    organizationId: input.organizationId,
    occurredAt: new Date(),
    action: input.action,
    summary: input.summary,
    actorAuthUserId: input.actorAuthUserId ?? null,
    employeeId: input.employeeId ?? null,
    planId: input.planId ?? null,
    metadata: input.metadata ?? null,
  };

  const key = storeKey(input.organizationId);
  const existing = auditStore.get(key) ?? [];
  auditStore.set(key, [event, ...existing]);
  return event;
}

export function listHrCareerPathingAuditEventsFromStore(input: {
  organizationId: string;
  limit?: number;
  search?: string;
}): {
  rows: HrCareerPathingAuditEventRecord[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
} {
  const pageSize = Math.min(Math.max(input.limit ?? 50, 1), 200);
  const all = auditStore.get(storeKey(input.organizationId)) ?? [];
  const trimmedSearch = input.search?.trim().toLowerCase();

  const filtered = trimmedSearch
    ? all.filter(
        (row) =>
          row.action.toLowerCase().includes(trimmedSearch) ||
          row.summary.toLowerCase().includes(trimmedSearch) ||
          (row.employeeId ?? "").toLowerCase().includes(trimmedSearch),
      )
    : all;

  return {
    rows: filtered.slice(0, pageSize),
    pageSize,
    totalCount: filtered.length,
    hasNextPage: filtered.length > pageSize,
  };
}

/** Test-only reset. */
export function resetHrCareerPathingAuditStore(organizationId?: string): void {
  if (organizationId) {
    auditStore.delete(storeKey(organizationId));
    return;
  }
  auditStore.clear();
}
