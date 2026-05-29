import { listExecutionCapabilities } from "@afenda/kernel/execution-capabilities";
import {
  listTenantCapabilitySettings,
  listTenantModuleSettings,
} from "../../tenant-execution/data/system-admin.execution-settings.repository.server";
import { resolveSystemAdminListSearch } from "../../overview/contracts/system-admin.list-search.shared";
import { buildSystemAdminCapabilityCoverageRows } from "./system-admin.capabilities.coverage.server";

export async function buildSystemAdminCapabilitiesPageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const searchValue = resolveSystemAdminListSearch(
    input.searchParams,
    "capabilities",
  );
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

  return {
    searchValue,
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
  };
}
