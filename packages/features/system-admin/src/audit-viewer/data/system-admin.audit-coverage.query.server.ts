import {
  listTenantCapabilitySettings,
  listTenantModuleSettings,
} from "../../tenant-execution/data/system-admin.execution-settings.repository.server";
import { buildSystemAdminCapabilityCoverageRows } from "../../capabilities/data/system-admin.capabilities.coverage.server";
import type { SystemAdminAuditCoverageGapRow } from "../contracts/system-admin.audit-coverage.contract";

export async function listSystemAdminAuditCoverageGaps(input: {
  organizationId: string;
}): Promise<readonly SystemAdminAuditCoverageGapRow[]> {
  const [moduleSettings, capabilitySettings] = await Promise.all([
    listTenantModuleSettings({ organizationId: input.organizationId, limit: 200 }),
    listTenantCapabilitySettings({
      organizationId: input.organizationId,
      limit: 500,
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
