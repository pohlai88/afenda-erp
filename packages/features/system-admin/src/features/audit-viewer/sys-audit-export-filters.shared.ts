import type { SystemAdminAuditSearchParams } from "./sys-audit-filter.schema";

export function buildSystemAdminAuditExportFilterFields(
  params: SystemAdminAuditSearchParams,
): Record<string, string> {
  return {
    auditQ: params.auditQ ?? "",
    auditActor: params.auditActor ?? "",
    auditAction: params.auditAction ?? "",
    auditTargetType: params.auditTargetType ?? "",
    auditTargetId: params.auditTargetId ?? "",
    auditModule: params.auditModule ?? "",
    auditOutcome: params.auditOutcome ?? "",
    auditFrom: params.auditFrom ?? "",
    auditTo: params.auditTo ?? "",
    auditSort: params.auditSort ?? "",
  };
}
