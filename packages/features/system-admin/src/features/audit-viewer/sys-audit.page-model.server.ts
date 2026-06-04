import type { SystemAdminRetentionPolicyListRow } from "./sys-retention-policy.contract";
import { parseSystemAdminAuditSearchParams } from "./sys-audit-search-params.parse.shared";
import { listRetentionPolicies } from "./sys-audit.repository.server";
import { SYSTEM_ADMIN_AUDIT_RETENTION_LIST_LIMIT } from "./sys-audit-viewer.limits.shared";
import { listSystemAdminAuditCoverageGaps } from "./sys-audit-coverage.query.server";
import { recordSystemAdminAuditViewerViewEvent } from "./sys-audit-view-event.server";
import {
  getSystemAdminAuditEventDetail,
  searchSystemAdminAuditEvents,
} from "./sys-audit.query.server";

function mapRetentionPolicyRow(
  policy: Awaited<ReturnType<typeof listRetentionPolicies>>[number],
): SystemAdminRetentionPolicyListRow {
  return {
    id: policy.entityType,
    entityType: policy.entityType,
    retentionDays: String(policy.retentionDays),
    legalHold: policy.legalHold ? "On hold" : "Standard",
  };
}

export async function buildSystemAdminAuditPageModel(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const params = parseSystemAdminAuditSearchParams(input.searchParams);

  const [window, retentionRows, coverageGaps] = await Promise.all([
    searchSystemAdminAuditEvents({
      organizationId: input.organizationId,
      params,
    }),
    listRetentionPolicies({
      organizationId: input.organizationId,
      limit: SYSTEM_ADMIN_AUDIT_RETENTION_LIST_LIMIT,
    }),
    listSystemAdminAuditCoverageGaps({
      organizationId: input.organizationId,
    }),
  ]);

  const selected =
    params.auditId && params.auditId.length > 0
      ? await getSystemAdminAuditEventDetail({
          organizationId: input.organizationId,
          auditLogId: params.auditId,
        })
      : null;

  await recordSystemAdminAuditViewerViewEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    params,
    selected,
    resultCount: window.rows.length,
  });

  return {
    params,
    searchValue: params.auditQ,
    rows: window.rows,
    totalCount: window.totalCount,
    pageSize: window.pageSize,
    hasNextPage: window.hasNextPage,
    page: window.page,
    selected,
    retentionPolicies: retentionRows.map(mapRetentionPolicyRow),
    coverageGaps,
  };
}
