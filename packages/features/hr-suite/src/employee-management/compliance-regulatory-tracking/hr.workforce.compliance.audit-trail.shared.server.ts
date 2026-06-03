import { searchTenantAuditLogs } from "@afenda/db";

import {
  HR_COMPLIANCE_AUDIT_MODULE_KEY,
  maskComplianceAuditMetadata,
  resolveComplianceAuditCategory,
  type HrComplianceAuditTrailRow,
  type HrComplianceAuditTrailWindow,
} from "./hr.workforce.compliance.audit-trail.shared";

const DEFAULT_AUDIT_TRAIL_LIMIT = 50;

export async function listHrComplianceAuditTrailWindow(input: {
  organizationId: string;
  search?: string;
  limit?: number;
  canViewSensitive?: boolean;
}): Promise<HrComplianceAuditTrailWindow> {
  const limit = input.limit ?? DEFAULT_AUDIT_TRAIL_LIMIT;
  const pageSize = Math.min(limit, 25);

  const result = await searchTenantAuditLogs({
    organizationId: input.organizationId,
    limit,
    offset: 0,
    filters: {
      moduleKey: HR_COMPLIANCE_AUDIT_MODULE_KEY,
      ...(input.search ? { query: input.search } : {}),
      sortDirection: "desc",
    },
  });

  const rows: HrComplianceAuditTrailRow[] = result.rows.map((row) => {
    const metadata =
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : null;

    return {
      id: row.id,
      occurredAt: row.createdAt,
      action: row.action,
      category: resolveComplianceAuditCategory(row.action),
      actorAuthUserId: row.actorAuthUserId,
      targetId: row.entityId,
      summary: row.summary,
      metadata: maskComplianceAuditMetadata({
        action: row.action,
        metadata,
        canViewSensitive: input.canViewSensitive ?? false,
      }),
    };
  });

  return {
    rows,
    pageSize,
    totalCount: result.totalCount,
    hasNextPage: result.totalCount > limit,
  };
}
