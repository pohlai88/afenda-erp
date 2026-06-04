import {
  isAppCapability,
  organizationRoles,
  type AppCapability,
  type OrganizationRole,
} from "@afenda/kernel";
import type {
  TenantCapabilitySettingRow,
  TenantModuleSettingRow,
} from "@afenda/db";
import { listUniqueExecutionCapabilities } from "./sys-capabilities-catalog.shared";
import { listRoleOverridesForOrganization } from "../users/sys-identity.repository.server";
import { resolveEffectivePermissionsForRole } from "../permissions/sys-permissions.query.server";
import { systemAdminSeedRoles } from "../roles/sys-roles.contract";
import { SYSTEM_ADMIN_CAPABILITY_SETTINGS_QUERY_LIMIT } from "./sys-capabilities.limits.shared";
import {
  buildSystemAdminCapabilitySettingsMap,
  buildSystemAdminModuleSettingsMap,
  isSystemAdminModuleDisabledForOrg,
  resolveSystemAdminCapabilityOrgAvailability,
} from "./sys-capabilities-org-settings.shared";

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

export async function buildSystemAdminCapabilityRoleMatrix(input: {
  organizationId: string;
  moduleSettings: readonly TenantModuleSettingRow[];
  capabilitySettings: readonly TenantCapabilitySettingRow[];
  roleFilter?: OrganizationRole;
}): Promise<SystemAdminCapabilityRoleMatrixRow[]> {
  const roleOverrides = await listRoleOverridesForOrganization({
    organizationId: input.organizationId,
    limit: SYSTEM_ADMIN_CAPABILITY_SETTINGS_QUERY_LIMIT,
  });

  const settingsByModule = buildSystemAdminModuleSettingsMap(input.moduleSettings);
  const settingsByCapability = buildSystemAdminCapabilitySettingsMap(
    input.capabilitySettings,
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

    for (const capability of listUniqueExecutionCapabilities()) {
      const orgAvailability = resolveSystemAdminCapabilityOrgAvailability(
        capability.key,
        settingsByCapability,
      );
      const moduleBlocked = isSystemAdminModuleDisabledForOrg(
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
