import {
  appCapabilities,
  capabilitiesForRole,
  organizationRoles,
  type AppCapability,
  type OrganizationRole,
} from "@afenda/auth";
import type { RoleOverrideRow } from "@afenda/db";
import { listExecutionCapabilities } from "@afenda/kernel/execution-capabilities";
import { systemAdminPermissionCatalog } from "../../contracts/system-admin.catalog.contract";
import type {
  SystemAdminPermissionCatalogRow,
  SystemAdminPermissionRiskLevel,
} from "../contracts";

function permissionModuleDomain(permission: AppCapability) {
  return permission.split(".")[0] ?? permission;
}

function permissionRiskLevel(permission: AppCapability): SystemAdminPermissionRiskLevel {
  if (
    permission.endsWith(".manage") ||
    permission.endsWith(".write") ||
    permission.endsWith(".export") ||
    permission.endsWith(".approve")
  ) {
    return "elevated";
  }

  if (permission.endsWith(".read") || permission.includes(".documents.")) {
    return "standard";
  }

  return "low";
}

function buildRolePermissionSets(overrides: readonly RoleOverrideRow[]) {
  const sets = new Map<OrganizationRole, Set<AppCapability>>();

  for (const role of organizationRoles) {
    sets.set(role, new Set(capabilitiesForRole(role)));
  }

  for (const override of overrides) {
    const roleSet = sets.get(override.role);
    if (!roleSet) {
      continue;
    }

    if (override.enabled) {
      if (appCapabilities.includes(override.permissionKey as AppCapability)) {
        roleSet.add(override.permissionKey as AppCapability);
      }
    } else {
      roleSet.delete(override.permissionKey as AppCapability);
    }
  }

  return sets;
}

function countRolesWithPermission(
  permission: AppCapability,
  roleSets: Map<OrganizationRole, Set<AppCapability>>,
) {
  let count = 0;

  for (const capabilities of roleSets.values()) {
    if (capabilities.has(permission)) {
      count += 1;
    }
  }

  return count;
}

export function buildSystemAdminPermissionCatalogRows(
  input: {
    roleOverrides?: readonly RoleOverrideRow[];
  } = {},
): SystemAdminPermissionCatalogRow[] {
  const capabilitiesByPermission = new Map<string, number>();

  for (const capability of listExecutionCapabilities()) {
    const current = capabilitiesByPermission.get(capability.requiredPermission) ?? 0;
    capabilitiesByPermission.set(capability.requiredPermission, current + 1);
  }

  const roleSets = buildRolePermissionSets(input.roleOverrides ?? []);

  return systemAdminPermissionCatalog.map((permission) => {
    const capabilityCount =
      capabilitiesByPermission.get(permission.value) ?? 0;
    const roleCount = countRolesWithPermission(permission.value, roleSets);
    const status =
      capabilityCount === 0
        ? "orphan"
        : roleCount === 0
          ? "unused"
          : "active";

    return {
      id: permission.value,
      permission: permission.value,
      module: permissionModuleDomain(permission.value),
      label: permission.label,
      description: permission.description,
      capabilityCount,
      roleCount,
      status,
      riskLevel: permissionRiskLevel(permission.value),
    };
  });
}

export async function listSystemAdminPermissionCatalog(input: {
  organizationId: string;
  roleOverrides?: readonly RoleOverrideRow[];
}) {
  void input.organizationId;
  return buildSystemAdminPermissionCatalogRows({
    roleOverrides: input.roleOverrides,
  });
}
