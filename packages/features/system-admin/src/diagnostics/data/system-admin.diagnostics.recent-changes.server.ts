import { searchTenantAuditLogs } from "@afenda/db";
import { formatErpDateTime } from "@afenda/kernel";
import { systemAdminWebhookEvents } from "../../contracts/system-admin.catalog.contract";
import type { SystemAdminDiagnosticsRecentChangeRow } from "../contracts/system-admin.diagnostics-coverage.contract";
import { buildSystemAdminAuditEventDetailHref } from "../../audit-viewer/data/system-admin.audit-pagination.shared";

const CONFIGURATION_AUDIT_ACTION_EXCLUDED = new Set([
  "system-admin.audit.view",
  "system-admin.audit.export",
]);

const CONFIGURATION_AUDIT_ACTION_PREFIXES = [
  "system-admin.module-settings",
  "system-admin.capability-settings",
  "system-admin.policy",
  "system-admin.approval",
  "system-admin.security",
  "system-admin.organization",
  "tenant.role-override",
  "tenant.settings",
] as const;

const RECENT_CONFIGURATION_CHANGE_LIMIT = 12;
const AUDIT_SCAN_LIMIT = 80;

const configurationAuditLabelByAction = new Map<string, string>(
  systemAdminWebhookEvents.map((entry) => [entry.value, entry.label]),
);

export function isConfigurationAuditAction(action: string) {
  if (CONFIGURATION_AUDIT_ACTION_EXCLUDED.has(action)) {
    return false;
  }

  return CONFIGURATION_AUDIT_ACTION_PREFIXES.some((prefix) =>
    action.startsWith(prefix),
  );
}

function configurationAuditActionLabel(action: string) {
  return configurationAuditLabelByAction.get(action) ?? action;
}

export async function listSystemAdminDiagnosticsRecentChanges(input: {
  organizationId: string;
}): Promise<readonly SystemAdminDiagnosticsRecentChangeRow[]> {
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

  const rows = [...systemAdminAudit.rows, ...tenantAudit.rows]
    .filter((row) => isConfigurationAuditAction(row.action))
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, RECENT_CONFIGURATION_CHANGE_LIMIT);

  return rows
    .map((row) => ({
      id: row.id,
      occurredAt: formatErpDateTime(row.createdAt),
      action: row.action,
      actionLabel: configurationAuditActionLabel(row.action),
      actorId: row.actorAuthUserId,
      target: `${row.entityType}:${row.entityId}`,
      summary: row.summary,
      href: buildSystemAdminAuditEventDetailHref(
        { auditPage: 1, auditPageSize: 25 },
        row.id,
      ),
    }));
}
