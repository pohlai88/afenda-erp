import type { ErpModuleDefinition } from "../shared/module-types";

export type TenantModuleAvailabilitySetting = {
  moduleKey: string;
  enabled: boolean;
  visible: boolean;
  readiness: "preview" | "active" | "blocked" | "deprecated";
};

export function applyTenantModuleAvailability(
  modules: readonly ErpModuleDefinition[],
  settings: readonly TenantModuleAvailabilitySetting[],
) {
  const settingsByModule = new Map(
    settings.map((setting) => [setting.moduleKey, setting]),
  );

  return modules.filter((module) => {
    const setting = settingsByModule.get(module.id);

    if (!setting) {
      return true;
    }

    if (module.id === "system-admin" || module.id === "dashboard") {
      return true;
    }

    if (!setting.enabled || !setting.visible) {
      return false;
    }

    return setting.readiness !== "blocked" && setting.readiness !== "deprecated";
  });
}
