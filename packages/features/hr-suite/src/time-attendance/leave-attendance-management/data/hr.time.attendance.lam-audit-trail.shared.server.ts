import { searchTenantAuditLogs } from "@afenda/db";

export const HR_LAM_AUDIT_MODULE_KEY = "hr.lam";

export type HrLamAuditTrailRow = {
  id: string;
  occurredAt: Date;
  action: string;
  actorAuthUserId: string;
  targetId: string;
  summary: string | null;
};

export type HrLamAuditTrailWindow = {
  rows: readonly HrLamAuditTrailRow[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export async function listHrLamAuditTrailWindow(input: {
  organizationId: string;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<HrLamAuditTrailWindow> {
  const limit = input.limit ?? 25;
  const offset = input.offset ?? 0;

  const result = await searchTenantAuditLogs({
    organizationId: input.organizationId,
    limit,
    offset,
    filters: {
      moduleKey: HR_LAM_AUDIT_MODULE_KEY,
      ...(input.search ? { query: input.search } : {}),
      sortDirection: "desc",
    },
  });

  return {
    rows: result.rows.map((row) => ({
      id: row.id,
      occurredAt: row.createdAt,
      action: row.action,
      actorAuthUserId: row.actorAuthUserId,
      targetId: row.entityId,
      summary: row.summary,
    })),
    pageSize: limit,
    totalCount: result.totalCount,
    hasNextPage: offset + result.rows.length < result.totalCount,
  };
}
