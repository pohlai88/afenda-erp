import { searchTenantAuditLogs } from "@afenda/db";
import { formatErpDateTime } from "@afenda/kernel";
import { buildSystemAdminAuditEventDetailHref } from "../audit-viewer/sys-audit-pagination.shared";
import { systemAdminWebhookEvents } from "./sys-integrations-catalog.contract";
import type { SystemAdminIntegrationsRecentChangeRow } from "./sys-integrations-list.contract";

const INTEGRATION_AUDIT_PREFIXES = [
  "tenant.api-credential",
  "tenant.webhook",
  "tenant.sso",
  "system-admin.integration",
  "system-admin.integrations",
] as const;

const RECENT_INTEGRATION_CHANGE_LIMIT = 12;
const AUDIT_SCAN_LIMIT = 80;

const integrationAuditLabelByAction = new Map<string, string>(
  systemAdminWebhookEvents.map((entry) => [entry.value, entry.label]),
);

export function isIntegrationConfigurationAuditAction(action: string) {
  return INTEGRATION_AUDIT_PREFIXES.some((prefix) => action.startsWith(prefix));
}

function integrationAuditActionLabel(action: string) {
  return integrationAuditLabelByAction.get(action) ?? action;
}

export async function listSystemAdminIntegrationsRecentChanges(input: {
  organizationId: string;
}): Promise<readonly SystemAdminIntegrationsRecentChangeRow[]> {
  const [systemAdminAudit, tenantAudit] = await Promise.all([
    searchTenantAuditLogs({
      organizationId: input.organizationId,
      limit: AUDIT_SCAN_LIMIT,
      offset: 0,
      filters: { moduleKey: "system-admin" },
    }),
    searchTenantAuditLogs({
      organizationId: input.organizationId,
      limit: 40,
      offset: 0,
      filters: { moduleKey: "tenant" },
    }),
  ]);

  return [...systemAdminAudit.rows, ...tenantAudit.rows]
    .filter((row) => isIntegrationConfigurationAuditAction(row.action))
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, RECENT_INTEGRATION_CHANGE_LIMIT)
    .map((row) => ({
      id: row.id,
      occurredAt: formatErpDateTime(row.createdAt),
      action: row.action,
      actionLabel: integrationAuditActionLabel(row.action),
      actorId: row.actorAuthUserId,
      target: `${row.entityType}:${row.entityId}`,
      summary: row.summary,
      href: buildSystemAdminAuditEventDetailHref(
        { auditPage: 1, auditPageSize: 25 },
        row.id,
      ),
    }));
}
