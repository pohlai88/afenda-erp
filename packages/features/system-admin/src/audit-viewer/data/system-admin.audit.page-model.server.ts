import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { systemAdminAuditActions } from "../contracts/system-admin.audit-actions.contract";
import { parseSystemAdminAuditSearchParams } from "./parse-audit-search-params";
import {
  getSystemAdminAuditEventDetail,
  searchSystemAdminAuditEvents,
} from "./system-admin.audit.query.server";

export async function buildSystemAdminAuditPageModel(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const params = parseSystemAdminAuditSearchParams(input.searchParams);
  const window = await searchSystemAdminAuditEvents({
    organizationId: input.organizationId,
    params,
  });

  if (!params.auditId) {
    await writeExecutionAuditEvent({
      organizationId: input.organizationId,
      actorId: input.actorId,
      actorType: input.actorType,
      action: systemAdminAuditActions.view,
      targetType: "organization",
      targetId: input.organizationId,
      metadata: {
        filters: {
          auditQ: params.auditQ ?? null,
          auditActor: params.auditActor ?? null,
          auditAction: params.auditAction ?? null,
          auditTargetType: params.auditTargetType ?? null,
          auditModule: params.auditModule ?? null,
        },
        resultCount: window.rows.length,
      },
    });
  }

  const selected =
    params.auditId && params.auditId.length > 0
      ? await getSystemAdminAuditEventDetail({
          organizationId: input.organizationId,
          auditLogId: params.auditId,
        })
      : null;

  return {
    params,
    searchValue: params.auditQ,
    rows: window.rows,
    totalCount: window.totalCount,
    pageSize: window.pageSize,
    hasNextPage: window.hasNextPage,
    page: window.page,
    selected,
  };
}
