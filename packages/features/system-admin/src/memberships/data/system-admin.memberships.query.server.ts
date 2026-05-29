import { updateTenantMembershipStatus } from "@afenda/db";
import { listTenantMembers } from "../../users/data/system-admin.identity.repository.server";
import type {
  SystemAdminMembershipRow,
  SystemAdminMembershipStatus,
} from "../contracts";

export async function listSystemAdminMemberships(input: {
  organizationId: string;
  limit?: number;
}): Promise<SystemAdminMembershipRow[]> {
  const members = await listTenantMembers(input);

  return members.map((member) => ({
    membershipId: member.membershipId,
    authUserId: member.authUserId,
    name: member.name,
    email: member.email,
    status: member.status,
    role: member.role,
    roleCount: 1,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  }));
}

export async function updateMembershipStatus(input: {
  organizationId: string;
  actorId: string;
  membershipId: string;
  status: SystemAdminMembershipStatus;
}) {
  return updateTenantMembershipStatus({
    organizationId: input.organizationId,
    actorAuthUserId: input.actorId,
    membershipId: input.membershipId,
    status: input.status,
  });
}
