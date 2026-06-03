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

function resolveAuditOccurredAt(log: TenantAuditLog) {
  return log.occurredAt ?? log.createdAt;
}

function resolveAuditTargetLabel(log: TenantAuditLog) {
  if (log.targetDisplayName) {
    return log.targetDisplayName;
  }

  if (log.targetType && log.targetId) {
    return `${log.targetType}:${log.targetId}`;
  }

  return `${log.entityType}:${log.entityId}`;
}

function resolveAuditModuleKeyForLog(log: TenantAuditLog) {
  return log.module ?? resolveAuditModuleKey(log.action);
}

export function mapTenantAuditLogToRow(log: TenantAuditLog): SystemAdminAuditEventRow {
  return {
    id: log.id,
    occurredAt: formatErpDateTime(resolveAuditOccurredAt(log)),
    actorId: log.actorAuthUserId,
    actorType: log.actorType ?? undefined,
    action: log.action,
    target: resolveAuditTargetLabel(log),
    targetType: log.targetType ?? log.entityType,
    targetId: log.targetId ?? log.entityId,
    targetDisplayName: log.targetDisplayName ?? undefined,
    outcome: log.outcome ?? undefined,
    moduleKey: resolveAuditModuleKeyForLog(log),
    result: log.outcome ?? "recorded",
    summary: log.summary,
  };
}

export function mapTenantAuditLogToDetail(
  log: TenantAuditLog,
  timeline: readonly SystemAdminAuditEventRow[] = [],
): SystemAdminAuditEventDetail {
  const metadata = redactAuditMetadata(log.metadata) as Record<string, unknown>;
  const beforeJson = log.beforeJson
    ? (redactAuditMetadata(log.beforeJson) as Record<string, unknown>)
    : null;
  const afterJson = log.afterJson
    ? (redactAuditMetadata(log.afterJson) as Record<string, unknown>)
    : null;
  const diffJson = log.diffJson
    ? (redactAuditMetadata(log.diffJson) as readonly Record<string, unknown>[])
    : null;
  const { policyKeys, approvalKeys } = extractAuditCorrelationRefs(metadata);

  return {
    id: log.id,
    occurredAt: formatErpDateTime(resolveAuditOccurredAt(log)),
    actorId: log.actorAuthUserId,
    actorType: log.actorType ?? undefined,
    actorRole: log.actorRole ?? undefined,
    subjectType: log.subjectType ?? undefined,
    subjectId: log.subjectId ?? undefined,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    targetType: log.targetType ?? log.entityType,
    targetId: log.targetId ?? log.entityId,
    targetDisplayName: log.targetDisplayName ?? undefined,
    moduleKey: resolveAuditModuleKeyForLog(log),
    surface: log.surface ?? undefined,
    route: log.route ?? undefined,
    channel: log.channel ?? undefined,
    outcome: log.outcome ?? undefined,
    reason: log.reason ?? undefined,
    policyReference: log.policyReference ?? undefined,
    approvalId: log.approvalId ?? undefined,
    requestId: log.requestId ?? undefined,
    operationId: log.operationId ?? undefined,
    beforeJson,
    afterJson,
    diffJson,
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
  targetType?: string;
  targetId?: string;
  entityType?: string;
  entityId?: string;
  limit?: number;
}) {
  const targetType = input.targetType ?? input.entityType;
  const targetId = input.targetId ?? input.entityId;

  if (!targetType || !targetId) {
    return [];
  }

  const { rows } = await searchTenantAuditLogs({
    organizationId: input.organizationId,
    limit: input.limit ?? SYSTEM_ADMIN_AUDIT_TARGET_TIMELINE_DEFAULT_LIMIT,
    offset: 0,
    filters: {
      targetType,
      targetId,
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
    targetType: log.targetType ?? log.entityType,
    targetId: log.targetId ?? log.entityId,
  });

  return {
    ...mapTenantAuditLogToDetail(log),
    timeline,
  };
}
