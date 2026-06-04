import type { ErpModuleDefinition } from "./ker-module-types";
import {
  applyTenantModuleAvailability,
  type TenantModuleAvailabilitySetting,
} from "./ker-tenant-module-availability";

export type TenantCapabilityAvailabilitySetting = {
  capabilityKey: string;
  availability: "enabled" | "disabled" | "preview";
};

const PROTECTED_MODULE_IDS = new Set(["system-admin", "dashboard"]);

export function applyTenantCapabilityAvailability(
  modules: readonly ErpModuleDefinition[],
  capabilitySettings: readonly TenantCapabilityAvailabilitySetting[],
) {
  const disabledCapabilities = new Set(
    capabilitySettings
      .filter((setting) => setting.availability === "disabled")
      .map((setting) => setting.capabilityKey),
  );

  if (disabledCapabilities.size === 0) {
    return [...modules];
  }

  return modules.filter((module) => {
    if (PROTECTED_MODULE_IDS.has(module.id)) {
      return true;
    }

    return !disabledCapabilities.has(module.requiredCapability);
  });
}

export function applyTenantNavigationAvailability(
  modules: readonly ErpModuleDefinition[],
  input: {
    moduleSettings: readonly TenantModuleAvailabilitySetting[];
    capabilitySettings: readonly TenantCapabilityAvailabilitySetting[];
  },
) {
  return applyTenantCapabilityAvailability(
    applyTenantModuleAvailability(modules, input.moduleSettings),
    input.capabilitySettings,
  );
}
