import { listExecutionCapabilities } from "@afenda/kernel/execution-capabilities";
import {
  listTenantCapabilitySettings,
  listTenantModuleSettings,
} from "../../tenant-execution/data/system-admin.execution-settings.repository.server";
import { resolveSystemAdminListSearch } from "../../overview/contracts/system-admin.list-search.shared";
import { buildSystemAdminCapabilityCoverageRows } from "./system-admin.capabilities.coverage.server";
import { buildSystemAdminCapabilityRoleMatrix } from "./system-admin.capabilities-role-matrix.server";
import type { OrganizationRole } from "@afenda/auth";
import { organizationRoles } from "@afenda/auth";

export async function buildSystemAdminCapabilitiesPageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const searchValue = resolveSystemAdminListSearch(
    input.searchParams,
    "capabilities",
  );
  const matrixRoleRaw = input.searchParams?.matrixRole;
  const matrixRole =
    typeof matrixRoleRaw === "string" &&
    (organizationRoles as readonly string[]).includes(matrixRoleRaw)
      ? (matrixRoleRaw as OrganizationRole)
      : undefined;

  const [moduleSettings, capabilitySettings] = await Promise.all([
    listTenantModuleSettings({
      organizationId: input.organizationId,
      limit: 100,
    }),
    listTenantCapabilitySettings({
      organizationId: input.organizationId,
      limit: 500,
    }),
  ]);
  const capabilities = buildSystemAdminCapabilityCoverageRows({
    moduleSettings,
    capabilitySettings,
  });
  const capabilityOptions = listExecutionCapabilities().map((capability) => ({
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
