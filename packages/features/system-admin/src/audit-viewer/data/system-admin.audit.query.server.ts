import type { TenantAuditLog } from "@afenda/db";
import {
  getTenantAuditLogById,
  searchTenantAuditLogs,
} from "@afenda/db";
import { formatErpDateTime } from "@afenda/kernel";
import type {
  SystemAdminAuditEventDetail,
  SystemAdminAuditEventRow,
} from "../contracts/system-admin.audit-event.contract";
import {
  SYSTEM_ADMIN_AUDIT_DEFAULT_PAGE_SIZE,
  SYSTEM_ADMIN_AUDIT_TARGET_TIMELINE_DEFAULT_LIMIT,
} from "../contracts/system-admin.audit-viewer.limits.shared";
import { redactAuditMetadata } from "./system-admin.audit-metadata.redact.shared";
import { extractAuditCorrelationRefs } from "./system-admin.audit-correlation.shared";
import { buildSystemAdminAuditSearchFilters } from "./system-admin.audit-search-filters.shared";
import type { SystemAdminAuditSearchParams } from "../schemas/system-admin.audit-filter.schema";

export { parseAuditFilterDate, buildSystemAdminAuditSearchFilters } from "./system-admin.audit-search-filters.shared";

export function resolveAuditModuleKey(action: string) {
  const [moduleKey] = action.split(".");
  return moduleKey && moduleKey.length > 0 ? moduleKey : "system";
}

export function mapTenantAuditLogToRow(log: TenantAuditLog): SystemAdminAuditEventRow {
  return {
    id: log.id,
    occurredAt: formatErpDateTime(log.createdAt),
    actorId: log.actorAuthUserId,
    action: log.action,
    target: `${log.entityType}:${log.entityId}`,
    moduleKey: resolveAuditModuleKey(log.action),
    result: "recorded",
    summary: log.summary,
  };
}

export function mapTenantAuditLogToDetail(
  log: TenantAuditLog,
  timeline: readonly SystemAdminAuditEventRow[] = [],
): SystemAdminAuditEventDetail {
  const metadata = redactAuditMetadata(log.metadata) as Record<string, unknown>;
  const { policyKeys, approvalKeys } = extractAuditCorrelationRefs(metadata);

  return {
    id: log.id,
    occurredAt: formatErpDateTime(log.createdAt),
    actorId: log.actorAuthUserId,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    moduleKey: resolveAuditModuleKey(log.action),
    summary: log.summary,
    metadata,
    policyKeys,
    approvalKeys,
    timeline,
  };
}

export async function searchSystemAdminAuditEvents(input: {
  organizationId: string;
  params: SystemAdminAuditSearchParams;
}) {
  const pageSize = input.params.auditPageSize ?? SYSTEM_ADMIN_AUDIT_DEFAULT_PAGE_SIZE;
  const page = input.params.auditPage ?? 1;
  const offset = (page - 1) * pageSize;

  const { rows, totalCount } = await searchTenantAuditLogs({
    organizationId: input.organizationId,
    limit: pageSize,
    offset,
    filters: buildSystemAdminAuditSearchFilters(input.params),
  });

  return {
    rows: rows.map(mapTenantAuditLogToRow),
    totalCount,
    page,
    pageSize,
    hasNextPage: offset + rows.length < totalCount,
  };
}

export async function listSystemAdminAuditTargetTimeline(input: {
  organizationId: string;
  entityType: string;
  entityId: string;
  limit?: number;
}) {
  const { rows } = await searchTenantAuditLogs({
    organizationId: input.organizationId,
    limit: input.limit ?? SYSTEM_ADMIN_AUDIT_TARGET_TIMELINE_DEFAULT_LIMIT,
    offset: 0,
    filters: {
      entityType: input.entityType as TenantAuditLog["entityType"],
      entityId: input.entityId,
      sortDirection: "asc",
    },
  });

  return rows.map(mapTenantAuditLogToRow);
}

export async function getSystemAdminAuditEventDetail(input: {
  organizationId: string;
  auditLogId: string;
}) {
  const log = await getTenantAuditLogById({
    organizationId: input.organizationId,
    auditLogId: input.auditLogId,
  });

  if (!log) {
    return null;
  }

  const timeline = await listSystemAdminAuditTargetTimeline({
    organizationId: input.organizationId,
    entityType: log.entityType,
    entityId: log.entityId,
  });

  return {
    ...mapTenantAuditLogToDetail(log),
    timeline,
  };
}
