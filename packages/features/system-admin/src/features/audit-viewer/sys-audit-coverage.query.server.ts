import {
  listTenantCapabilitySettings,
  listTenantModuleSettings,
} from "../../tenant-execution/data/system-admin.execution-settings.repository.server";
import { buildSystemAdminCapabilityCoverageRows } from "../../capabilities/data/system-admin.capabilities.coverage.server";
import type { SystemAdminAuditCoverageGapRow } from "../contracts/system-admin.audit-coverage.contract";
import {
  SYSTEM_ADMIN_AUDIT_COVERAGE_CAPABILITY_LIMIT,
  SYSTEM_ADMIN_AUDIT_COVERAGE_MODULE_LIMIT,
} from "../contracts/system-admin.audit-viewer.limits.shared";

export async function listSystemAdminAuditCoverageGaps(input: {
  organizationId: string;
}): Promise<readonly SystemAdminAuditCoverageGapRow[]> {
  const [moduleSettings, capabilitySettings] = await Promise.all([
    listTenantModuleSettings({ organizationId: input.organizationId, limit: SYSTEM_ADMIN_AUDIT_COVERAGE_MODULE_LIMIT }),
    listTenantCapabilitySettings({
      organizationId: input.organizationId,
      limit: SYSTEM_ADMIN_AUDIT_COVERAGE_CAPABILITY_LIMIT,
    }),
  ]);

  return buildSystemAdminCapabilityCoverageRows({
    moduleSettings,
    capabilitySettings,
  })
    .filter((row) => row.coverageVerdict === "missing_audit")
    .map((row) => ({
      capabilityKey: row.capability,
      moduleKey: row.module,
      requiredPermission: row.requiredPermission,
      summary: row.issues[0] ?? "Sensitive capability has no declared audit area.",
    }));
}
