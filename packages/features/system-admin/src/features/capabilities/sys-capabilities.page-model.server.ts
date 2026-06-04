import { listUniqueExecutionCapabilities } from "./sys-capabilities-catalog.shared";
import {
  listTenantCapabilitySettings,
  listTenantModuleSettings,
} from "../tenant-execution/sys-execution-settings.repository.server";
import { resolveSystemAdminListSearch } from "../overview/sys-list-search.shared";
import {
  SYSTEM_ADMIN_CAPABILITY_SETTINGS_QUERY_LIMIT,
  SYSTEM_ADMIN_MODULE_SETTINGS_QUERY_LIMIT,
} from "./sys-capabilities.limits.shared";
import { buildSystemAdminCapabilityCoverageRows } from "./sys-capabilities.coverage.server";
import { buildSystemAdminCapabilityRoleMatrix } from "./sys-capabilities-role-matrix.server";
import { parseSystemAdminCapabilityMatrixRole } from "./sys-capabilities-matrix-role.shared";

export async function buildSystemAdminCapabilitiesPageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const searchValue = resolveSystemAdminListSearch(
    input.searchParams,
    "capabilities",
  );
  const matrixRole = parseSystemAdminCapabilityMatrixRole(
    input.searchParams?.matrixRole,
  );

  const [moduleSettings, capabilitySettings] = await Promise.all([
    listTenantModuleSettings({
      organizationId: input.organizationId,
      limit: SYSTEM_ADMIN_MODULE_SETTINGS_QUERY_LIMIT,
    }),
    listTenantCapabilitySettings({
      organizationId: input.organizationId,
      limit: SYSTEM_ADMIN_CAPABILITY_SETTINGS_QUERY_LIMIT,
    }),
  ]);
  const capabilities = buildSystemAdminCapabilityCoverageRows({
    moduleSettings,
    capabilitySettings,
  });
  const capabilityOptions = listUniqueExecutionCapabilities().map((capability) => ({
    value: capability.key,
    label: capability.label,
  }));
  const roleMatrix = await buildSystemAdminCapabilityRoleMatrix({
    organizationId: input.organizationId,
    moduleSettings,
    capabilitySettings,
    roleFilter: matrixRole,
  });

  return {
    searchValue,
    matrixRole,
    capabilities: capabilities.map((capability) => ({
      id: capability.id,
      capability: capability.capability,
      module: capability.module,
      route: capability.route,
      routeHref: capability.routeHref,
      requiredPermission: capability.requiredPermission,
      availability: capability.availability,
      accessCoverage: capability.accessCoverage,
      auditCoverage: capability.auditCoverage,
      docsCoverage: capability.docsCoverage,
      coverageVerdict: capability.coverageVerdict,
      readinessVerdict: capability.readinessVerdict,
      issues:
        capability.issues.length > 0
          ? capability.issues.join("; ")
          : "None",
    })),
    capabilityOptions,
    roleMatrix,
  };
}
