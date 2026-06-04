import { listSystemAdminDiagnosticsRecentChanges } from "../diagnostics/sys-diagnostics.recent-changes.server";
import type { SystemAdminDiagnosticsRecentChangeRow } from "../diagnostics/sys-diagnostics-coverage.contract";
import { systemAdminSecurityAuditActions } from "./sys-security.event";

const SECURITY_AUDIT_PREFIX = "system-admin.security";
const SECURITY_CONFIGURATION_AUDIT_ACTIONS = new Set<string>(
  Object.values(systemAdminSecurityAuditActions),
);

export function isSecurityConfigurationAuditAction(action: string) {
  if (SECURITY_CONFIGURATION_AUDIT_ACTIONS.has(action)) {
    return true;
  }

  return action.startsWith(SECURITY_AUDIT_PREFIX);
}

export async function listSystemAdminSecurityRecentChanges(input: {
  organizationId: string;
}): Promise<readonly SystemAdminDiagnosticsRecentChangeRow[]> {
  const rows = await listSystemAdminDiagnosticsRecentChanges(input);

  return rows.filter((row) => isSecurityConfigurationAuditAction(row.action));
}
