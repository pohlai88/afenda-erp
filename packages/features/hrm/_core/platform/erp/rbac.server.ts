import "server-only"

import { getDb } from "@afenda/db"
import { organizationMemberships, rolePermissions } from "@afenda/db"
import { eq, and, inArray } from "drizzle-orm"

/**
 * ERP RBAC server-side permission helpers.
 *
 * Resolves effective permission keys for a user + org by combining the role's
 * global permissions (via `rolePermissions`) with any org-level overrides.
 */

async function getEffectivePermissionKeysForUser(
  organizationId: string,
  userId: string,
): Promise<string[]> {
  const db = getDb()
  const { listPermissionKeysByRole, listRoleOverridesForOrganization } =
    await import("@afenda/db")

  const [member] = await db
    .select({ role: organizationMemberships.role })
    .from(organizationMemberships)
    .where(
      and(
        eq(organizationMemberships.organizationId, organizationId),
        eq(organizationMemberships.authUserId, userId),
      ),
    )
    .limit(1)

  if (!member) return []

  const baseKeys = await listPermissionKeysByRole([member.role])
  const overrides = await listRoleOverridesForOrganization({ organizationId })

  const keys = new Set(baseKeys.get(member.role) ?? [])
  for (const override of overrides) {
    if (override.role !== member.role) continue
    if (override.enabled) keys.add(override.permissionKey)
    else keys.delete(override.permissionKey)
  }

  return [...keys]
}

/**
 * Returns true when the given user holds the specified ERP permission key
 * within the organization.
 */
export async function canUseErpPermission({
  organizationId,
  userId,
  permissionKey,
}: {
  organizationId: string
  userId: string
  permissionKey: string
}): Promise<boolean> {
  const keys = await getEffectivePermissionKeysForUser(organizationId, userId)
  return keys.includes(permissionKey)
}

/**
 * Returns all effective ERP permission keys for the given user in the org.
 */
export async function listEffectiveErpPermissionsForUser({
  organizationId,
  userId,
}: {
  organizationId: string
  userId: string
}): Promise<string[]> {
  return getEffectivePermissionKeysForUser(organizationId, userId)
}

/**
 * Returns the list of user IDs within the organization that hold the given
 * permission key — used for audience-filtering (e.g. leave approver list).
 */
export async function listUserIdsWithErpPermission({
  organizationId,
  permissionKey,
}: {
  organizationId: string
  permissionKey: string
}): Promise<string[]> {
  const db = getDb()

  // Find all roles that carry this permission key
  const rolesWithPerm = await db
    .select({ role: rolePermissions.role })
    .from(rolePermissions)
    .where(eq(rolePermissions.permissionKey, permissionKey))

  if (rolesWithPerm.length === 0) return []

  const roles = rolesWithPerm.map((r) => r.role)

  // Return member user IDs in those roles for this org
  const members = await db
    .select({ userId: organizationMemberships.authUserId })
    .from(organizationMemberships)
    .where(
      and(
        eq(organizationMemberships.organizationId, organizationId),
        inArray(organizationMemberships.role, roles),
      ),
    )

  return members.map((m) => m.userId)
}
