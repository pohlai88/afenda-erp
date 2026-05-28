import {
  assignSystemAdminRole,
  listSystemAdminRoles,
  requireSystemAdminRolesRead,
  SystemAdminRolesTable,
} from "@afenda/feature-system-admin/server";
import { SystemAdminAssignRoleDialog } from "@afenda/feature-system-admin/client";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles — System admin",
  description: "Role catalog overrides and role control evidence.",
};

export default async function SystemAdminRolesPage() {
  const { organization } = await requireSystemAdminRolesRead();
  const canMutate =
    organization.capabilities.includes("system-admin.roles.manage") ||
    organization.capabilities.includes("system-admin.identity.write");
  const roles = await listSystemAdminRoles({
    organizationId: organization.id,
  });

  return (
    <div className="flex flex-col gap-6">
      <SectionPanel
        headingLevel={1}
        title="Roles"
        description="Role overrides remain tenant scoped and are enforced by session capability resolution."
      />

      <SystemAdminRolesTable roles={roles} />

      {canMutate ? (
        <SectionPanel
          title="Assign role"
          description="Phase 1 uses the existing single-role membership model."
        >
          <SystemAdminAssignRoleDialog assignRoleAction={assignSystemAdminRole} />
        </SectionPanel>
      ) : null}
    </div>
  );
}
