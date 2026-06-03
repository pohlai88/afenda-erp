import { moduleIds } from "@afenda/config/module-ids";
import { getErpModuleById } from "@afenda/kernel";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import {
  listTenantModuleSettings,
  listTenantPolicySettings,
} from "../../tenant-execution/data/system-admin.execution-settings.repository.server";
import { filterSystemAdminListRows } from "../../overview/contracts/system-admin.list-filter.shared";
import { resolveSystemAdminListSearch } from "../../overview/contracts/system-admin.list-search.shared";
import { buildSystemAdminModuleCatalogRows } from "./system-admin.modules.query.server";

const MODULE_LIST_SEARCH_FIELDS = ["module", "id", "category"] as const;

export async function buildSystemAdminModulesPageModel(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const searchValue = resolveSystemAdminListSearch(input.searchParams, "modules");
  const [settings, policySettings] = await Promise.all([
    listTenantModuleSettings({
      organizationId: input.organizationId,
      limit: 100,
    }),
    listTenantPolicySettings({
      organizationId: input.organizationId,
      limit: 200,
    }),
  ]);
  const allModules = buildSystemAdminModuleCatalogRows({ settings, policySettings });
  const modules = filterSystemAdminListRows(
    allModules,
    searchValue,
    MODULE_LIST_SEARCH_FIELDS,
  );
  const moduleOptions = moduleIds
    .map((id) => getErpModuleById(id))
    .filter((module) => module !== null)
    .map((module) => ({
      value: module.id,
      label: module.label,
    }));

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: "system-admin.module_catalog.view",
    targetType: "organization",
    targetId: input.organizationId,
    metadata: {
      moduleCount: modules.length,
      totalCount: allModules.length,
      search: searchValue ?? null,
    },
  });

  return {
    searchValue,
    modules,
    moduleOptions,
  };
}
