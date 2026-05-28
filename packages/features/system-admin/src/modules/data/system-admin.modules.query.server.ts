import type { TenantModuleSettingRow } from "@afenda/db";
import { getErpModuleById } from "@afenda/kernel";
import { moduleIds } from "@afenda/config/module-ids";
import {
  capabilitiesForRole,
  organizationRoles,
  type AppCapability,
  type OrganizationRole,
} from "@afenda/auth";
import { listExecutionCapabilitiesForModule } from "@afenda/kernel/execution-capabilities";
import type { SystemAdminModuleCatalogRow, SystemAdminModuleStatus } from "../contracts";

function formatModuleStatus(setting: TenantModuleSettingRow | undefined): SystemAdminModuleStatus {
  if (!setting || setting.enabled === false) {
    return "disabled";
  }

  if (setting.readiness === "deprecated") {
    return "deprecated";
  }

  if (setting.readiness === "preview") {
    return "preview";
  }

  return "active";
}

function countRolesWithModuleAccess(moduleRequiredCapability: AppCapability) {
  const roles: OrganizationRole[] = [];

  for (const role of organizationRoles) {
    if (capabilitiesForRole(role).includes(moduleRequiredCapability)) {
      roles.push(role);
    }
  }

  return roles;
}

export function buildSystemAdminModuleCatalogRows(input: {
  settings: readonly TenantModuleSettingRow[];
}): SystemAdminModuleCatalogRow[] {
  const settingsByModule = new Map(
    input.settings.map((setting) => [setting.moduleKey, setting]),
  );

  return moduleIds
    .map((moduleId) => getErpModuleById(moduleId))
    .filter((module) => module !== null)
    .map((module) => {
      const setting = settingsByModule.get(module.id);
      const capabilityCount = listExecutionCapabilitiesForModule(module.id).length;
      const enabledRoles = countRolesWithModuleAccess(module.requiredCapability);

      return {
        id: module.id,
        module: module.label,
        status: formatModuleStatus(setting),
        capabilities: String(capabilityCount),
        enabledRoles:
          enabledRoles.length > 0 ? enabledRoles.join(", ") : "None",
        readiness: setting?.readiness ?? "active",
        permission: module.requiredCapability,
        lastChanged: setting ? "Configured" : "Default",
        href: module.href,
      };
    });
}
