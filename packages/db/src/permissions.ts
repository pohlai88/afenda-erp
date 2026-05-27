import { asc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "./client";
import { permissions, rolePermissions } from "./schema";

export type PermissionCatalogItem = {
  key: string;
  module: string;
  label: string;
  description: string;
};

export type RolePermissionSeed = {
  role:
    | "owner"
    | "admin"
    | "finance-manager"
    | "operations-manager"
    | "staff"
    | "viewer";
  permissionKey: string;
};

export type PermissionRole = RolePermissionSeed["role"];

/** Global permission catalog reads — not tenant-scoped by design. */
export async function listPermissionCatalog() {
  const db = getDb();

  return db
    .select({
      key: permissions.key,
      module: permissions.module,
      label: permissions.label,
      description: permissions.description,
    })
    .from(permissions)
    .orderBy(asc(permissions.module), asc(permissions.key));
}

export async function listPermissionKeysForRole(role: PermissionRole) {
  const db = getDb();

  const rows = await db
    .select({
      permissionKey: rolePermissions.permissionKey,
    })
    .from(rolePermissions)
    .where(eq(rolePermissions.role, role))
    .orderBy(asc(rolePermissions.permissionKey));

  return rows.map((row) => row.permissionKey);
}

export async function listPermissionKeysByRole(roles: readonly PermissionRole[]) {
  const uniqueRoles = [...new Set(roles)];

  if (uniqueRoles.length === 0) {
    return new Map<PermissionRole, string[]>();
  }

  const db = getDb();
  const rows = await db
    .select({
      role: rolePermissions.role,
      permissionKey: rolePermissions.permissionKey,
    })
    .from(rolePermissions)
    .where(inArray(rolePermissions.role, uniqueRoles))
    .orderBy(asc(rolePermissions.role), asc(rolePermissions.permissionKey));

  const permissionsByRole = new Map<PermissionRole, string[]>();

  for (const row of rows) {
    const permissionKeys = permissionsByRole.get(row.role) ?? [];
    permissionKeys.push(row.permissionKey);
    permissionsByRole.set(row.role, permissionKeys);
  }

  return permissionsByRole;
}

export async function seedPermissionCatalog(input: {
  permissions: readonly PermissionCatalogItem[];
  rolePermissions: readonly RolePermissionSeed[];
}) {
  const db = getDb();

  if (input.permissions.length > 0) {
    await db
      .insert(permissions)
      .values([...input.permissions])
      .onConflictDoUpdate({
        target: permissions.key,
        set: {
          module: sql`excluded.module`,
          label: sql`excluded.label`,
          description: sql`excluded.description`,
          updatedAt: new Date(),
        },
      });
  }

  const permissionKeys = input.permissions.map((permission) => permission.key);

  if (permissionKeys.length > 0) {
    await db
      .delete(rolePermissions)
      .where(inArray(rolePermissions.permissionKey, permissionKeys));
  }

  if (input.rolePermissions.length > 0) {
    await db.insert(rolePermissions).values([...input.rolePermissions]);
  }
}
