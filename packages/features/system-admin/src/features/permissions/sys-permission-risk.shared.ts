import type { AppCapability } from "@afenda/auth";
import type { SystemAdminPermissionRiskLevel } from "./system-admin.permissions.contract";

/** Permissions that must not be stripped from owner/admin roles via overrides. */
export const systemAdminProtectedAdminPermissions = [
  "system-admin.permissions.manage",
  "system-admin.identity.write",
  "system-admin.roles.manage",
] as const satisfies readonly AppCapability[];

/** Catalog keys that remain visible but cannot be newly assigned to roles. */
export const systemAdminDeprecatedPermissionKeys = [] as const satisfies readonly AppCapability[];

export function isSystemAdminDeprecatedPermissionKey(
  permissionKey: string,
): permissionKey is AppCapability {
  return (systemAdminDeprecatedPermissionKeys as readonly string[]).includes(
    permissionKey,
  );
}

export function isSystemAdminProtectedAdminPermission(
  permissionKey: string,
): permissionKey is (typeof systemAdminProtectedAdminPermissions)[number] {
  return (systemAdminProtectedAdminPermissions as readonly string[]).includes(
    permissionKey,
  );
}

export function resolveSystemAdminPermissionRiskLevel(
  permission: string,
): SystemAdminPermissionRiskLevel {
  if (
    permission === "system-admin.data-management.manage" ||
    permission === "system-admin.data-management.run" ||
    permission === "system-admin.data-management.cancel"
  ) {
    return "critical";
  }

  if (
    permission.startsWith("system-admin.") &&
    (permission.endsWith(".manage") ||
      permission.includes(".security.") ||
      permission.includes(".permissions."))
  ) {
    return "critical";
  }

  if (
    permission.endsWith(".manage") ||
    permission.endsWith(".approve") ||
    permission.includes(".compensation.") ||
    permission.includes(".billing.")
  ) {
    return "high";
  }

  if (
    permission.endsWith(".write") ||
    permission.endsWith(".export") ||
    permission.endsWith(".update")
  ) {
    return "medium";
  }

  return "low";
}

export function requiresHighRiskPermissionConfirmation(
  permissionKey: string,
  enabled: boolean,
): boolean {
  if (!enabled) {
    return false;
  }

  const riskLevel = resolveSystemAdminPermissionRiskLevel(permissionKey);
  return riskLevel === "high" || riskLevel === "critical";
}

export function requiresElevatedPermissionConfirmation(
  permissionKey: string,
  enabled: boolean,
): boolean {
  if (!enabled) {
    return false;
  }

  return resolveSystemAdminPermissionRiskLevel(permissionKey) === "critical";
}
