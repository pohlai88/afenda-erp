import type { ModuleId } from "@afenda/config/module-ids";
import type { TenantModuleSettingRow } from "@afenda/db";
import { getErpModuleById } from "@afenda/kernel";
import { resolveSystemAdminModuleAvailability } from "./sys-modules-readiness.shared";

export const systemAdminModuleDependencies = {
  purchasing: ["inventory"],
  reports: ["finance", "inventory"],
} as const satisfies Partial<Record<ModuleId, readonly ModuleId[]>>;

export const systemAdminCriticalModuleKeys = [
  "dashboard",
  "finance",
  "hr",
  "system-admin",
] as const satisfies readonly ModuleId[];

function dependenciesForModule(moduleKey: ModuleId): readonly ModuleId[] {
  if (moduleKey in systemAdminModuleDependencies) {
    return systemAdminModuleDependencies[
      moduleKey as keyof typeof systemAdminModuleDependencies
    ];
  }

  return [];
}

export function listDisabledModuleDependencyKeys(input: {
  moduleKey: ModuleId;
  settings: readonly TenantModuleSettingRow[];
}): ModuleId[] {
  const dependencies = dependenciesForModule(input.moduleKey);
  if (dependencies.length === 0) {
    return [];
  }

  const settingsByModule = new Map(
    input.settings.map((setting) => [setting.moduleKey, setting]),
  );

  return dependencies.filter((dependencyKey: ModuleId) => {
    const dependencyModule = getErpModuleById(dependencyKey);
    if (!dependencyModule) {
      return false;
    }

    const setting = settingsByModule.get(dependencyKey);
    return resolveSystemAdminModuleAvailability(setting) === "disabled";
  });
}

export function formatModuleDependencyIssue(
  disabledDependencyKeys: readonly ModuleId[],
): string | null {
  if (disabledDependencyKeys.length === 0) {
    return null;
  }

  const labels = disabledDependencyKeys
    .map((moduleKey) => getErpModuleById(moduleKey)?.label ?? moduleKey)
    .join(", ");

  return `Required modules are disabled: ${labels}.`;
}
