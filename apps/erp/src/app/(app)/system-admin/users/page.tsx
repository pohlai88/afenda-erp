import {
  inviteSystemAdminUser,
  listSystemAdminUsers,
  reactivateSystemAdminUserForm,
  requireSystemAdminUsersRead,
  suspendSystemAdminUserForm,
  SystemAdminUsersTable,
} from "@afenda/feature-system-admin/server";
import { SystemAdminInviteUserDialog } from "@afenda/feature-system-admin/client";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users — System admin",
  description: "User invitation and access review for the active tenant.",
};

export default async function SystemAdminUsersPage() {
  const { organization } = await requireSystemAdminUsersRead();
  const canMutate =
    organization.capabilities.includes("system-admin.users.manage") ||
    organization.capabilities.includes("system-admin.identity.write");

  const users = await listSystemAdminUsers({
    organizationId: organization.id,
    limit: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Users"
        description="Invite users and inspect active tenant access without changing the execution-kernel boundary."
      />

      {canMutate ? (
        <SectionPanel title="Invite user">
          <SystemAdminInviteUserDialog inviteAction={inviteSystemAdminUser} />
        </SectionPanel>
      ) : null}

      <SystemAdminUsersTable
        users={users}
        suspendAction={canMutate ? suspendSystemAdminUserForm : undefined}
        reactivateAction={canMutate ? reactivateSystemAdminUserForm : undefined}
      />
    </div>
  );
}
