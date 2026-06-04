import type { TenantModuleSettingRow, TenantPolicySettingRow } from "@afenda/db";
import { getErpModuleById } from "@afenda/kernel";
import { moduleIds } from "@afenda/config/module-ids";
import {
  getCapabilitiesForOrganizationRole,
  organizationRoles,
  type AppCapability,
  type OrganizationRole,
} from "@afenda/kernel";
import { listExecutionCapabilitiesForModule } from "@afenda/kernel/execution-capabilities";
import { mapTenantPolicySettingToRule } from "../policies/system-admin.policy-rules.mapper";
import type { SystemAdminModuleCatalogRow, SystemAdminModuleStatus } from "./sys-modules.contract";
import { resolveSystemAdminModuleCategory } from "./sys-module-category.contract";
import {
  resolveSystemAdminModuleAvailability,
  resolveSystemAdminModuleReadinessVerdict,
} from "./sys-modules-readiness.shared";

function formatModuleLifecycleStatus(
  setting: TenantModuleSettingRow | undefined,
): SystemAdminModuleStatus {
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
    if (getCapabilitiesForOrganizationRole(role).includes(moduleRequiredCapability)) {
      roles.push(role);
    }
  }

  return roles.length;
}

function countPoliciesForModule(
  moduleKey: string,
  policySettings: readonly TenantPolicySettingRow[],
) {
  return policySettings.filter((row) => {
    const rule = mapTenantPolicySettingToRule(row);
    return rule.moduleKey === moduleKey || rule.moduleKey === "*";
  }).length;
}

function formatLastChanged(setting: TenantModuleSettingRow | undefined) {
  if (!setting) {
    return "Default";
  }

  return setting.updatedAt.toISOString().slice(0, 10);
}

export function buildSystemAdminModuleCatalogRows(input: {
  settings: readonly TenantModuleSettingRow[];
  policySettings?: readonly TenantPolicySettingRow[];
}): SystemAdminModuleCatalogRow[] {
  const settingsByModule = new Map(
    input.settings.map((setting) => [setting.moduleKey, setting]),
  );
  const policySettings = input.policySettings ?? [];

  return moduleIds
    .map((moduleId) => getErpModuleById(moduleId))
    .filter((module) => module !== null)
    .map((module) => {
      const setting = settingsByModule.get(module.id);
      const capabilityCount = listExecutionCapabilitiesForModule(module.id).length;
      const enabledRoleCount = countRolesWithModuleAccess(module.requiredCapability);
      const policyCount = countPoliciesForModule(module.id, policySettings);

      return {
        id: module.id,
        module: module.label,
        category: resolveSystemAdminModuleCategory(module.id),
        status: formatModuleLifecycleStatus(setting),
        availability: resolveSystemAdminModuleAvailability(setting),
        visibility: setting?.visible === false ? "hidden" : "visible",
        capabilities: String(capabilityCount),
        permissions: module.requiredCapability,
        policies: String(policyCount),
        readinessVerdict: resolveSystemAdminModuleReadinessVerdict({
          moduleKey: module.id,
          setting,
          settings: input.settings,
          capabilityCount,
          enabledRoleCount,
        }),
        readiness: setting?.readiness ?? "active",
        lastChanged: formatLastChanged(setting),
        href: module.href,
      };
    });
}
