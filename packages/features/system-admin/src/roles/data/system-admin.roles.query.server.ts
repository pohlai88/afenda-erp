import {
  assignTenantMembershipRole,
  listTenantMembers,
  removeTenantMembershipRole,
} from "@afenda/db";
import type { OrganizationRole } from "@afenda/auth";
import {
  systemAdminSeedRoles,
  type SystemAdminRoleRow,
} from "../contracts";

export async function listSystemAdminRoles(input: {
  organizationId: string;
}): Promise<SystemAdminRoleRow[]> {
  const roleRows = await listTenantMembers({
    organizationId: input.organizationId,
    limit: 200,
  });

  return systemAdminSeedRoles.map((role) => ({
    ...role,
    assignedMembers: roleRows.filter(
      (row) => row.role === role.key && row.status === "active",
    ).length,
  }));
}

function assertRoleIsAssignable(role: OrganizationRole) {
  const roleDefinition = systemAdminSeedRoles.find((item) => item.key === role);

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
  assertRoleIsAssignable(input.role);
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
