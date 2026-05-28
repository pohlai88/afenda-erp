import { moduleIds } from "@afenda/config/module-ids";
import { getErpModuleById } from "@afenda/kernel";
import { listTenantModuleSettings } from "../../data/repositories/system-admin.execution-settings.repository.server";
import { resolveSystemAdminListSearch } from "../../contracts/system-admin.list-search.shared";
import { buildSystemAdminModuleCatalogRows } from "./system-admin.modules.query.server";

export async function buildSystemAdminModulesPageModel(input: {
  organizationId: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const searchValue = resolveSystemAdminListSearch(input.searchParams, "modules");
  const settings = await listTenantModuleSettings({
    organizationId: input.organizationId,
    limit: 100,
  });
  const modules = buildSystemAdminModuleCatalogRows({ settings });
  const moduleOptions = moduleIds
    .map((id) => getErpModuleById(id))
    .filter((module) => module !== null)
    .map((module) => ({
      value: module.id,
      label: module.label,
    }));

  return {
    searchValue,
    modules,
    moduleOptions,
  };
}
