import type {
  TenantCapabilitySettingRow,
  TenantModuleSettingRow,
} from "@afenda/db";
import type { SystemAdminCapabilityAvailability } from "./sys-capabilities.contract";

export function resolveSystemAdminCapabilityOrgAvailability(
  capabilityKey: string,
  settingsByCapability: Map<string, TenantCapabilitySettingRow>,
): SystemAdminCapabilityAvailability {
  return settingsByCapability.get(capabilityKey)?.availability ?? "enabled";
}

export function isSystemAdminModuleDisabledForOrg(
  moduleKey: string,
  settingsByModule: Map<string, TenantModuleSettingRow>,
): boolean {
  const setting = settingsByModule.get(moduleKey);

  if (!setting) {
    return false;
  }

  return (
    setting.enabled === false ||
    setting.visible === false ||
    setting.readiness === "blocked" ||
    setting.readiness === "deprecated"
  );
}

export function buildSystemAdminCapabilitySettingsMap(
  capabilitySettings: readonly TenantCapabilitySettingRow[],
): Map<string, TenantCapabilitySettingRow> {
  return new Map(
    capabilitySettings.map((setting) => [setting.capabilityKey, setting]),
  );
}

export function buildSystemAdminModuleSettingsMap(
  moduleSettings: readonly TenantModuleSettingRow[],
): Map<string, TenantModuleSettingRow> {
  return new Map(moduleSettings.map((setting) => [setting.moduleKey, setting]));
}
