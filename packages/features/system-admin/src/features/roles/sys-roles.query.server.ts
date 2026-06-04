import {
  assignTenantMembershipRole,
  listTenantRoleCatalog,
  removeTenantMembershipRole,
} from "@afenda/db";
import { listTenantMembers } from "../users/sys-identity.repository.server";
import type { OrganizationRole } from "@afenda/kernel";
import {
  systemAdminSeedRoles,
  type SystemAdminRoleRow,
} from "./sys-roles.contract";

function mergeRoleCatalog(
  role: (typeof systemAdminSeedRoles)[number],
  catalogByRole: Map<
    OrganizationRole,
    Awaited<ReturnType<typeof listTenantRoleCatalog>>[number]
  >,
) {
  const catalogEntry = catalogByRole.get(role.key);

  return {
    ...role,
    name: catalogEntry?.displayName?.trim() || role.name,
    description: catalogEntry?.description?.trim() || role.description,
    status: catalogEntry?.deprecated ? ("deprecated" as const) : role.status,
  };
}

export async function listSystemAdminRoles(input: {
  organizationId: string;
}): Promise<SystemAdminRoleRow[]> {
  const [roleRows, catalogRows] = await Promise.all([
    listTenantMembers({
      organizationId: input.organizationId,
      limit: 200,
    }),
    listTenantRoleCatalog({ organizationId: input.organizationId }),
  ]);

  const catalogByRole = new Map(
    catalogRows.map((entry) => [entry.role, entry]),
  );

  return systemAdminSeedRoles.map((role) => {
    const merged = mergeRoleCatalog(role, catalogByRole);

    return {
      ...merged,
      assignedMembers: roleRows.filter(
        (row) => row.role === merged.key && row.status === "active",
      ).length,
    };
  });
}

function assertRoleIsAssignable(
  role: OrganizationRole,
  roles: readonly SystemAdminRoleRow[],
) {
  const roleDefinition = roles.find((item) => item.key === role);

  if (!roleDefinition) {
    throw new Error("Role is not available in the System Admin role catalog.");
  }

  if (roleDefinition.status !== "active") {
    throw new Error("Deprecated roles cannot be assigned.");
  }
}

export async function assignRoleToMembership(input: {
  organizationId: string;
  actorId: string;
  membershipId: string;
  role: OrganizationRole;
}) {
  const roles = await listSystemAdminRoles({
    organizationId: input.organizationId,
  });
  assertRoleIsAssignable(input.role, roles);
  await assignTenantMembershipRole({
    organizationId: input.organizationId,
    membershipId: input.membershipId,
    role: input.role,
    actorAuthUserId: input.actorId,
  });
}

export async function removeRoleFromMembership(input: {
  organizationId: string;
  actorId: string;
  membershipId: string;
  role: OrganizationRole;
}) {
  await removeTenantMembershipRole({
    organizationId: input.organizationId,
    membershipId: input.membershipId,
    role: input.role,
    actorAuthUserId: input.actorId,
  });
}
