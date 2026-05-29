import type { SystemAdminAuditSearchParams } from "../schemas/system-admin.audit-filter.schema";

export const SYSTEM_ADMIN_AUDIT_PATH = "/system-admin/audit";

function appendAuditSearchParams(
  search: URLSearchParams,
  params: SystemAdminAuditSearchParams,
) {
  if (params.auditQ) {
    search.set("auditQ", params.auditQ);
  }

  if (params.auditActor) {
    search.set("auditActor", params.auditActor);
  }

  if (params.auditAction) {
    search.set("auditAction", params.auditAction);
  }

  if (params.auditTargetType) {
    search.set("auditTargetType", params.auditTargetType);
  }

  if (params.auditTargetId) {
    search.set("auditTargetId", params.auditTargetId);
  }

  if (params.auditModule) {
    search.set("auditModule", params.auditModule);
  }

  if (params.auditFrom) {
    search.set("auditFrom", params.auditFrom);
  }

  if (params.auditTo) {
    search.set("auditTo", params.auditTo);
  }

  if (params.auditSort) {
    search.set("auditSort", params.auditSort);
  }

  if (params.auditId) {
    search.set("auditId", params.auditId);
  }
}

export function buildSystemAdminAuditPageHref(
  params: SystemAdminAuditSearchParams,
  page: number,
) {
  const search = new URLSearchParams();
  appendAuditSearchParams(search, params);

  if (page > 1) {
    search.set("auditPage", String(page));
  }

  if (params.auditPageSize && params.auditPageSize !== 25) {
    search.set("auditPageSize", String(params.auditPageSize));
  }

  const query = search.toString();
  return query ? `${SYSTEM_ADMIN_AUDIT_PATH}?${query}` : SYSTEM_ADMIN_AUDIT_PATH;
}

export function buildSystemAdminAuditEventDetailHref(
  params: SystemAdminAuditSearchParams,
  auditLogId: string,
) {
  return buildSystemAdminAuditPageHref(
    { ...params, auditId: auditLogId },
    params.auditPage ?? 1,
  );
}

export function buildSystemAdminAuditListHref(params: SystemAdminAuditSearchParams) {
  const { auditId: _detail, ...listParams } = params;
  return buildSystemAdminAuditPageHref(listParams, params.auditPage ?? 1);
}
