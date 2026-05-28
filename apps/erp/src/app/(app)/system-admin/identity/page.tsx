import {
  buildInvitationsListSurface,
  buildMembersListSurface,
  buildRoleOverridesListSurface,
  inviteMemberAction,
  listOrganizationInvitations,
  listRoleOverridesForOrganization,
  listTenantMembers,
  requireSystemAdminUsersRead,
  setRoleOverrideAction,
  systemAdminInvitationsSurfaceKey,
  systemAdminMembersSurfaceKey,
  systemAdminRoleOverridesSurfaceKey,
} from "@afenda/feature-system-admin/server";
import {
  InvitationTrailingCell,
  InviteMemberForm,
  MemberRoleTrailingCell,
  RoleOverrideForm,
} from "@afenda/feature-system-admin/client";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Identity — System admin",
  description: "Members, invitations, roles, and tenant permission overrides.",
};

export default async function SystemAdminIdentityPage() {
  const { organization } = await requireSystemAdminUsersRead();
  const canWrite =
    organization.capabilities.includes("system-admin.identity.write") ||
    organization.capabilities.includes("system-admin.users.manage") ||
    organization.capabilities.includes("system-admin.roles.manage");

  const [members, invitations, overrides] = await Promise.all([
    listTenantMembers({ organizationId: organization.id, limit: 100 }),
    listOrganizationInvitations({
      organizationId: organization.id,
      limit: 100,
    }),
    listRoleOverridesForOrganization({
      organizationId: organization.id,
      limit: 200,
    }),
  ]);

  const membersSurface = buildMembersListSurface({
    members,
    canMutate: canWrite,
  });
  const invitationsSurface = buildInvitationsListSurface({
    invitations,
    canMutate: canWrite,
  });
  const overridesSurface = buildRoleOverridesListSurface({ overrides });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Identity & access"
        description="Organization members, pending invitations, and per-tenant role overrides."
      />

      {canWrite ? (
        <SectionPanel
          title="Invite member"
          description="Invitations expire after seven days. The token is displayed once for manual delivery until outbound delivery is activated."
        >
          <InviteMemberForm inviteMemberAction={inviteMemberAction} />
        </SectionPanel>
      ) : null}

      <GovernedPatternCListSection
        title="Members"
        surfaceKey={systemAdminMembersSurfaceKey}
        listConfiguration={membersSurface}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={{
          header: "Actions",
          Cell: MemberRoleTrailingCell,
        }}
      />

      <GovernedPatternCListSection
        title="Invitations"
        surfaceKey={systemAdminInvitationsSurfaceKey}
        listConfiguration={invitationsSurface}
        parentAccessAllowed
        layout="embedded"
        trailingColumn={{
          header: "Actions",
          Cell: InvitationTrailingCell,
        }}
      />

      <GovernedPatternCListSection
        title="Role overrides"
        description="Overrides apply on top of the static role catalog when the session is refreshed."
        surfaceKey={systemAdminRoleOverridesSurfaceKey}
        listConfiguration={overridesSurface}
        parentAccessAllowed
        layout="embedded"
      />

      {canWrite ? (
        <SectionPanel title="Set role override">
          <RoleOverrideForm setRoleOverrideAction={setRoleOverrideAction} />
        </SectionPanel>
      ) : null}
    </div>
  );
}
