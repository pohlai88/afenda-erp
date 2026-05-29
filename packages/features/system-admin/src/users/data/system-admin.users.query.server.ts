import {
  createOrganizationInvitation,
  hasOrganizationInvitationWithEmail,
  hasTenantMemberWithEmail,
  listActorLastActivityAt,
  type TenantMemberSummary,
} from "@afenda/db";
import {
  listOrganizationInvitations,
  listTenantMembers,
} from "./system-admin.identity.repository.server";
import { formatSystemAdminUserLastActive } from "./system-admin.users-last-active.shared";
import type { OrganizationRole } from "@afenda/auth";
import type {
  SystemAdminInviteUserResult,
  SystemAdminUserRow,
  SystemAdminUserStatus,
} from "../contracts";

function mapMembershipStatusToUserStatus(
  status: TenantMemberSummary["status"],
): SystemAdminUserStatus {
  return status;
}

function mapMemberToUserRow(
  member: TenantMemberSummary,
  lastActivityByActor: ReadonlyMap<string, Date>,
): SystemAdminUserRow {
  const status = mapMembershipStatusToUserStatus(member.status);

  return {
    id: member.membershipId,
    membershipId: member.membershipId,
    invitationId: null,
    authUserId: member.authUserId,
    name: member.name,
    email: member.email,
    status,
    membership: member.status,
    roles: [member.role],
    lastActive: formatSystemAdminUserLastActive({
      status,
      lastAuditAt: lastActivityByActor.get(member.authUserId) ?? null,
      membershipUpdatedAt: member.updatedAt,
    }),
    invitedAt: null,
    joinedAt: status === "removed" ? null : member.createdAt,
    createdAt: member.createdAt,
  };
}

export async function listSystemAdminUsers(input: {
  organizationId: string;
  limit?: number;
}): Promise<SystemAdminUserRow[]> {
  const listInput = {
    organizationId: input.organizationId,
    limit: input.limit,
  };

  const [members, invitations] = await Promise.all([
    listTenantMembers(listInput),
    listOrganizationInvitations(listInput),
  ]);

  const lastActivityByActor = await listActorLastActivityAt({
    organizationId: input.organizationId,
    actorAuthUserIds: members.map((member) => member.authUserId),
  });

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
      lastActive: "Not joined",
      invitedAt: invitation.createdAt,
      joinedAt: null,
      createdAt: invitation.createdAt,
    }));

  return [
    ...members.map((member) => mapMemberToUserRow(member, lastActivityByActor)),
    ...invitationRows,
  ];
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
