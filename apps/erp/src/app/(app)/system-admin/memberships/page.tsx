import {
  listSystemAdminMemberships,
  removeSystemAdminRoleAssignmentForm,
  requireSystemAdminMembershipsRead,
  SystemAdminMembershipsTable,
  updateSystemAdminMembershipStatusForm,
} from "@afenda/feature-system-admin/server";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memberships — System admin",
  description: "Organization membership and role assignment review.",
};

export default async function SystemAdminMembershipsPage() {
  const { organization } = await requireSystemAdminMembershipsRead();
  const canUpdateMemberships =
    organization.capabilities.includes("system-admin.memberships.manage") ||
    organization.capabilities.includes("system-admin.identity.write");
  const canManageRoles =
    organization.capabilities.includes("system-admin.roles.manage") ||
    organization.capabilities.includes("system-admin.identity.write");
  const memberships = await listSystemAdminMemberships({
    organizationId: organization.id,
    limit: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Memberships"
        description="Tenant membership state protected by execution-kernel permission checks."
      />

      <SystemAdminMembershipsTable
        memberships={memberships}
        updateStatusAction={
          canUpdateMemberships ? updateSystemAdminMembershipStatusForm : undefined
        }
        removeRoleAction={canManageRoles ? removeSystemAdminRoleAssignmentForm : undefined}
      />
    </div>
  );
}
