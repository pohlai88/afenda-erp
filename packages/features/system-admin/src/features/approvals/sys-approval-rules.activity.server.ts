import { searchTenantAuditLogs } from "@afenda/db";
import { formatErpDateTime } from "@afenda/kernel";
import type { SystemAdminApprovalActivityRow } from "./sys-approval-rule.contract";
import {
  APPROVAL_ACTIVITY_DEFAULT_LIMIT,
  SYSTEM_ADMIN_APPROVAL_AUDIT_ACTION_PREFIX,
} from "./sys-approval-rules.shared";

export async function listSystemAdminApprovalRuleActivity(input: {
  organizationId: string;
  approvalKey: string;
  limit?: number;
}): Promise<readonly SystemAdminApprovalActivityRow[]> {
  const { rows } = await searchTenantAuditLogs({
    organizationId: input.organizationId,
    limit: input.limit ?? APPROVAL_ACTIVITY_DEFAULT_LIMIT,
    offset: 0,
    filters: {
      entityId: input.approvalKey,
      action: SYSTEM_ADMIN_APPROVAL_AUDIT_ACTION_PREFIX,
      sortDirection: "desc",
    },
  });

  return rows.map((row) => ({
    id: row.id,
    occurredAt: formatErpDateTime(row.createdAt),
    actorId: row.actorAuthUserId,
    action: row.action,
    summary: row.summary,
  }));
}
