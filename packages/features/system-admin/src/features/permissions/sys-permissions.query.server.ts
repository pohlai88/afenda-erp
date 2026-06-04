import {
  appCapabilities,
  getCapabilitiesForOrganizationRole,
  organizationRoles,
  type AppCapability,
  type OrganizationRole,
} from "@afenda/kernel";
import type { RoleOverrideRow } from "@afenda/db";
import { listExecutionCapabilities } from "@afenda/kernel/execution-capabilities";
import { systemAdminPermissionCatalog } from "./sys-permission-catalog.contract";
import {
  isSystemAdminDeprecatedPermissionKey,
  resolveSystemAdminPermissionRiskLevel,
} from "./sys-permission-risk.shared";
import type { SystemAdminPermissionCatalogRow, SystemAdminPermissionCatalogStatus, SystemAdminPermissionCoverageVerdict, SystemAdminPermissionRiskLevel } from "./sys-permissions.contract";

function permissionModuleDomain(permission: string) {
  return permission.split(".")[0] ?? permission;
}

function permissionActionGroup(permission: string) {
  const action = permission.split(".").at(-1) ?? permission;

  if (action === "read" || action === "view") {
    return "Read";
  }
  if (action === "create") {
    return "Create";
  }
  if (action === "update" || action === "write" || action === "manage") {
    return action === "manage" ? "Configure" : "Update";
  }
  if (action === "approve") {
    return "Approve";
  }
  if (action === "delete" || action === "remove" || action === "revoke") {
    return "Delete / Remove";
  }
  if (action === "export") {
    return "Export";
  }
  if (action.includes("audit")) {
    return "Audit";
  }
  if (action.includes("security")) {
    return "Security";
  }
  if (permission.startsWith("system-admin.")) {
    return "Admin";
  }

  return "Operational";
}

function labelFromKey(key: string) {
  return key
    .split(/[.-]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isOverprivilegedPermission(input: {
  permission: string;
  riskLevel: SystemAdminPermissionRiskLevel;
  roleCount: number;
  roleSets: Map<OrganizationRole, Set<AppCapability>>;
}) {
  if (input.riskLevel !== "high" && input.riskLevel !== "critical") {
    return false;
  }

  if (input.roleCount >= 3) {
    return true;
  }

  const staffCapabilities = input.roleSets.get("staff");
  return staffCapabilities?.has(input.permission as AppCapability) ?? false;
}

function resolveCoverageVerdict(input: {
  status: SystemAdminPermissionCatalogRow["status"];
  riskLevel: SystemAdminPermissionRiskLevel;
  permission: string;
  roleCount: number;
  roleSets: Map<OrganizationRole, Set<AppCapability>>;
}): SystemAdminPermissionCoverageVerdict {
  if (input.status === "missing") {
    return "missing_capability";
  }

  if (input.status === "deprecated") {
    return "deprecated";
  }

  if (
    isOverprivilegedPermission({
      permission: input.permission,
      riskLevel: input.riskLevel,
      roleCount: input.roleCount,
      roleSets: input.roleSets,
    })
  ) {
    return "overprivileged";
  }

  if (input.status === "orphan") {
    return "orphan";
  }

  if (input.status === "unused") {
    return "unassigned";
  }

  return "covered";
}

export function buildRolePermissionSets(overrides: readonly RoleOverrideRow[]) {
  const sets = new Map<OrganizationRole, Set<AppCapability>>();

  for (const role of organizationRoles) {
    sets.set(role, new Set(getCapabilitiesForOrganizationRole(role)));
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

export function resolveEffectivePermissionsForRole(
  role: OrganizationRole,
  overrides: readonly RoleOverrideRow[] = [],
): AppCapability[] {
  const roleSets = buildRolePermissionSets(overrides);
  return [...(roleSets.get(role) ?? [])].sort();
}

function countRolesWithPermission(
  permission: string,
  roleSets: Map<OrganizationRole, Set<AppCapability>>,
) {
  let count = 0;

  for (const capabilities of roleSets.values()) {
    if (capabilities.has(permission as AppCapability)) {
      count += 1;
    }
  }

  return count;
}

export function listMissingCatalogPermissions() {
  const catalogKeys = new Set<string>(appCapabilities);

  return listExecutionCapabilities()
    .map((capability) => capability.requiredPermission)
    .filter((permission) => !catalogKeys.has(permission));
}

function buildMissingCatalogPermissionRow(
  permission: string,
  capabilitiesByPermission: Map<string, number>,
): SystemAdminPermissionCatalogRow {
  const capabilityCount = capabilitiesByPermission.get(permission) ?? 1;
  const riskLevel = resolveSystemAdminPermissionRiskLevel(permission);

  return {
    id: `missing:${permission}`,
    permission,
    module: permissionModuleDomain(permission),
    group: "Unresolved",
    label: labelFromKey(permission),
    description:
      "Referenced by an execution capability but missing from the declared permission catalog.",
    capabilityCount,
    roleCount: 0,
    status: "missing",
    coverageVerdict: "missing_capability",
    riskLevel,
  };
}

export function buildSystemAdminPermissionCatalogRows(
  input: {
    roleOverrides?: readonly RoleOverrideRow[];
  } = {},
): SystemAdminPermissionCatalogRow[] {
  const capabilitiesByPermission = new Map<string, number>();

  for (const capability of listExecutionCapabilities()) {
    const current =
      capabilitiesByPermission.get(capability.requiredPermission) ?? 0;
    capabilitiesByPermission.set(
      capability.requiredPermission,
      current + 1,
    );
  }

  const roleSets = buildRolePermissionSets(input.roleOverrides ?? []);

  const catalogRows = systemAdminPermissionCatalog.map((permission) => {
    const capabilityCount =
      capabilitiesByPermission.get(permission.value) ?? 0;
    const roleCount = countRolesWithPermission(permission.value, roleSets);
    const status: SystemAdminPermissionCatalogStatus =
      isSystemAdminDeprecatedPermissionKey(permission.value)
        ? "deprecated"
        : capabilityCount === 0
          ? "orphan"
          : roleCount === 0
            ? "unused"
            : "active";
    const riskLevel = resolveSystemAdminPermissionRiskLevel(permission.value);
    const coverageVerdict = resolveCoverageVerdict({
      permission: permission.value,
      status,
      riskLevel,
      roleCount,
      roleSets,
    });

    return {
      id: permission.value,
      permission: permission.value,
      module: permissionModuleDomain(permission.value),
      group: permissionActionGroup(permission.value),
      label: permission.label,
      description: permission.description,
      capabilityCount,
      roleCount,
      status,
      coverageVerdict,
      riskLevel,
    };
  });

  const missingRows = listMissingCatalogPermissions().map((permission) =>
    buildMissingCatalogPermissionRow(permission, capabilitiesByPermission),
  );

  return [...catalogRows, ...missingRows].sort((left, right) =>
    left.permission.localeCompare(right.permission),
  );
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

/** Architecture alias for catalog reads guarded at the route/policy layer. */
export const listSystemAdminPermissions = listSystemAdminPermissionCatalog;
