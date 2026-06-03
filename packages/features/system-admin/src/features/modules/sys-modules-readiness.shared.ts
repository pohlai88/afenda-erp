import type { ModuleId } from "@afenda/config/module-ids";
import type { TenantModuleSettingRow } from "@afenda/db";
import { listDisabledModuleDependencyKeys } from "./system-admin.module-dependencies.contract";

export type SystemAdminModuleReadinessVerdict = "ready" | "warning" | "blocked";

export function resolveSystemAdminModuleAvailability(
  setting: TenantModuleSettingRow | undefined,
): "enabled" | "disabled" | "preview" {
  if (!setting || setting.enabled === false) {
    return "disabled";
  }

  if (setting.readiness === "preview") {
    return "preview";
  }

  return "enabled";
}

export function resolveSystemAdminModuleReadinessVerdict(input: {
  moduleKey: ModuleId;
  setting: TenantModuleSettingRow | undefined;
  settings: readonly TenantModuleSettingRow[];
  capabilityCount: number;
  enabledRoleCount: number;
}): SystemAdminModuleReadinessVerdict {
  const { setting, capabilityCount, enabledRoleCount } = input;

  if (setting?.readiness === "blocked") {
    return "blocked";
  }

  const disabledDependencies = listDisabledModuleDependencyKeys({
    moduleKey: input.moduleKey,
    settings: input.settings,
  });
  if (
    disabledDependencies.length > 0 &&
    resolveSystemAdminModuleAvailability(setting) !== "disabled"
  ) {
    return "blocked";
  }

  if (!setting || setting.enabled === false) {
    return "warning";
  }

  if (
    setting.readiness === "deprecated" ||
    setting.readiness === "preview" ||
    capabilityCount === 0 ||
    enabledRoleCount === 0
  ) {
    return "warning";
  }

  return "ready";
}
