import type { OrganizationRole } from "@afenda/kernel";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { resolveSystemAdminListSearch } from "../overview/sys-list-search.shared";
import { listRoleOverridesForOrganization } from "../users/sys-identity.repository.server";
import { resolveEffectivePermissionsForRole } from "../permissions/sys-permissions.query.server";
import { listSystemAdminRoles } from "./sys-roles.query.server";

function matchesRoleSearch(
  query: string,
  role: {
    name: string;
    key: string;
    description: string;
  },
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return (
    role.name.toLowerCase().includes(normalized) ||
    role.key.toLowerCase().includes(normalized) ||
    role.description.toLowerCase().includes(normalized)
  );
}

export async function buildSystemAdminRolesPageModel(input: {
  organizationId: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const searchValue = resolveSystemAdminListSearch(input.searchParams, "roles");

  const [roleOverrides, roles] = await Promise.all([
    listRoleOverridesForOrganization({
      organizationId: input.organizationId,
      limit: 500,
    }),
    listSystemAdminRoles({
      organizationId: input.organizationId,
    }),
  ]);

  const permissionCountByRole = new Map<OrganizationRole, number>();
  for (const role of roles) {
    permissionCountByRole.set(
      role.key,
      resolveEffectivePermissionsForRole(role.key, roleOverrides).length,
    );
  }

  const filteredRoles = searchValue
    ? roles.filter((role) => matchesRoleSearch(searchValue, role))
    : roles;

  await writeExecutionAuditEvent({
    organizationId: input.organizationId,
    actorId: input.actorId,
    actorType: input.actorType,
    action: "system-admin.role_catalog.view",
    targetType: "organization",
    targetId: input.organizationId,
    metadata: {
      roleCount: filteredRoles.length,
      search: searchValue ?? null,
    },
  });

  return {
    searchValue,
    roles: filteredRoles.map((role) => ({
      ...role,
      permissionCount: permissionCountByRole.get(role.key) ?? 0,
    })),
  };
}
