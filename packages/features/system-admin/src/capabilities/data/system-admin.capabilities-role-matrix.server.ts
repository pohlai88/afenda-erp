import {
  isAppCapability,
  organizationRoles,
  type AppCapability,
  type OrganizationRole,
} from "@afenda/auth";
import type {
  TenantCapabilitySettingRow,
  TenantModuleSettingRow,
} from "@afenda/db";
import { listExecutionCapabilities } from "@afenda/kernel/execution-capabilities";
import { listRoleOverridesForOrganization } from "../../users/data/system-admin.identity.repository.server";
import { resolveEffectivePermissionsForRole } from "../../permissions/data/system-admin.permissions.query.server";
import { systemAdminSeedRoles } from "../../roles/contracts";

export type SystemAdminCapabilityRoleAccess = "granted" | "denied" | "blocked";

export type SystemAdminCapabilityRoleMatrixRow = {
  id: string;
  role: OrganizationRole;
  roleLabel: string;
  capabilityKey: string;
  capabilityLabel: string;
  moduleKey: string;
  requiredPermission: string;
  access: SystemAdminCapabilityRoleAccess;
  orgAvailability: string;
};

function moduleIsDisabled(
  moduleKey: string,
  settingsByModule: Map<string, TenantModuleSettingRow>,
) {
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

function resolveOrgAvailability(
  capabilityKey: string,
  settingsByCapability: Map<string, TenantCapabilitySettingRow>,
) {
  return settingsByCapability.get(capabilityKey)?.availability ?? "enabled";
}

export async function buildSystemAdminCapabilityRoleMatrix(input: {
  organizationId: string;
  moduleSettings: readonly TenantModuleSettingRow[];
  capabilitySettings: readonly TenantCapabilitySettingRow[];
  roleFilter?: OrganizationRole;
}): Promise<SystemAdminCapabilityRoleMatrixRow[]> {
  const roleOverrides = await listRoleOverridesForOrganization({
    organizationId: input.organizationId,
    limit: 500,
  });

  const settingsByModule = new Map(
    input.moduleSettings.map((setting) => [setting.moduleKey, setting]),
  );
  const settingsByCapability = new Map(
    input.capabilitySettings.map((setting) => [
      setting.capabilityKey,
      setting,
    ]),
  );

  const roles = input.roleFilter
    ? [input.roleFilter]
    : [...organizationRoles];

  const rows: SystemAdminCapabilityRoleMatrixRow[] = [];

  for (const role of roles) {
    const permissions = new Set(
      resolveEffectivePermissionsForRole(role, roleOverrides),
    );
    const roleLabel =
      systemAdminSeedRoles.find((entry) => entry.key === role)?.name ?? role;

    for (const capability of listExecutionCapabilities()) {
      const orgAvailability = resolveOrgAvailability(
        capability.key,
        settingsByCapability,
      );
      const moduleBlocked = moduleIsDisabled(
        capability.moduleKey,
        settingsByModule,
      );
      const requiredPermission = capability.requiredPermission;
      const hasPermission =
        isAppCapability(requiredPermission) &&
        permissions.has(requiredPermission as AppCapability);

      let access: SystemAdminCapabilityRoleAccess = "denied";

      if (
        orgAvailability === "disabled" ||
        moduleBlocked ||
        capability.status === "deprecated"
      ) {
        access = "blocked";
      } else if (hasPermission) {
        access = "granted";
      }

      rows.push({
        id: `${role}:${capability.key}`,
        role,
        roleLabel,
        capabilityKey: capability.key,
        capabilityLabel: capability.label,
        moduleKey: capability.moduleKey,
        requiredPermission,
        access,
        orgAvailability,
      });
    }
  }

  return rows.sort((left, right) =>
    `${left.roleLabel}:${left.capabilityLabel}`.localeCompare(
      `${right.roleLabel}:${right.capabilityLabel}`,
    ),
  );
}
