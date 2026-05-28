import {
  createOrganizationInvitation,
  hasOrganizationInvitationWithEmail,
  hasTenantMemberWithEmail,
  listOrganizationInvitations,
  listTenantMembers,
  type TenantMemberSummary,
} from "@afenda/db";
import type { OrganizationRole } from "@afenda/auth";
import type {
  SystemAdminInviteUserResult,
  SystemAdminUserRow,
} from "../contracts";

function mapMemberToUserRow(member: TenantMemberSummary): SystemAdminUserRow {
  return {
    id: member.membershipId,
    membershipId: member.membershipId,
    invitationId: null,
    authUserId: member.authUserId,
    name: member.name,
    email: member.email,
    status: member.status,
    membership: member.status,
    roles: [member.role],
    lastActive: "Not tracked",
    createdAt: member.createdAt,
  };
}

export async function listSystemAdminUsers(input: {
  organizationId: string;
  limit?: number;
}): Promise<SystemAdminUserRow[]> {
  const [members, invitations] = await Promise.all([
    listTenantMembers(input),
    listOrganizationInvitations(input),
  ]);

  const memberEmails = new Set(members.map((member) => member.email.toLowerCase()));
  const invitationRows = invitations
    .filter((invitation) => !memberEmails.has(invitation.email.toLowerCase()))
    .map<SystemAdminUserRow>((invitation) => ({
      id: invitation.id,
      membershipId: null,
      invitationId: invitation.id,
      authUserId: null,
      name: "Pending invite",
      email: invitation.email,
      status: "invited",
      membership: invitation.status,
      roles: [invitation.role as OrganizationRole],
      lastActive: "Not active",
      createdAt: invitation.createdAt,
    }));

  return [...members.map(mapMemberToUserRow), ...invitationRows];
}

export async function createSystemAdminUserInvitation(input: {
  organizationId: string;
  email: string;
  role: OrganizationRole;
  actorAuthUserId: string;
}): Promise<SystemAdminInviteUserResult> {
  return createOrganizationInvitation({
    organizationId: input.organizationId,
    email: input.email,
    role: input.role,
    invitedByAuthUserId: input.actorAuthUserId,
  });
}

export async function assertSystemAdminUserCanBeInvited(input: {
  organizationId: string;
  email: string;
}) {
  const [memberExists, invitationExists] = await Promise.all([
    hasTenantMemberWithEmail({
      organizationId: input.organizationId,
      email: input.email,
    }),
    hasOrganizationInvitationWithEmail({
      organizationId: input.organizationId,
      email: input.email,
    }),
  ]);

  if (memberExists || invitationExists) {
    throw new Error("This email is already invited or active in the organization.");
  }
}
