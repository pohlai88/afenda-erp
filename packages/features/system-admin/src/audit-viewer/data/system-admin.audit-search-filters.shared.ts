import type { TenantAuditLogSearchFilters } from "@afenda/db";

import type { SystemAdminAuditSearchParams } from "../schemas/system-admin.audit-filter.schema";

export function parseAuditFilterDate(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function normalizeAuditDateRange(
  createdAfter: Date | undefined,
  createdBefore: Date | undefined,
) {
  if (
    createdAfter &&
    createdBefore &&
    createdAfter.getTime() > createdBefore.getTime()
  ) {
    return {
      createdAfter: createdBefore,
      createdBefore: createdAfter,
    };
  }

  return { createdAfter, createdBefore };
}

export function buildSystemAdminAuditSearchFilters(
  params: SystemAdminAuditSearchParams,
): TenantAuditLogSearchFilters {
  const createdAfter = parseAuditFilterDate(params.auditFrom);
  const createdBefore = parseAuditFilterDate(params.auditTo);
  const normalizedDates = normalizeAuditDateRange(createdAfter, createdBefore);

  return {
    actorAuthUserId: params.auditActor,
    action: params.auditAction,
    entityType: params.auditTargetType,
    entityId: params.auditTargetId,
    moduleKey: params.auditModule,
    query: params.auditQ,
    createdAfter: normalizedDates.createdAfter,
    createdBefore: normalizedDates.createdBefore,
    sortDirection: params.auditSort ?? "desc",
  };
}
