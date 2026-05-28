import { formatErpDateTime } from "@afenda/kernel";
import { SectionPanel } from "@afenda/ui";
import type { SystemAdminActionResult } from "../../contracts";
import { SystemAdminMembershipStatusActions } from "./system-admin.membership-status-actions.component.client";
import { SystemAdminRoleAssignmentActions } from "../../roles/components/system-admin.role-assignment-actions.component.client";
import type { SystemAdminMembershipRow } from "../contracts";

type TableAction = (
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function SystemAdminMembershipsTable({
  memberships,
  updateStatusAction,
  removeRoleAction,
}: {
  memberships: readonly SystemAdminMembershipRow[];
  updateStatusAction?: TableAction;
  removeRoleAction?: TableAction;
}) {
  const canMutate = Boolean(updateStatusAction || removeRoleAction);

  return (
    <SectionPanel
      title="Memberships"
      description="Membership state and role coverage for the active organization."
    >
      {memberships.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No memberships were found for this organization.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-line">
                <th className="py-2 pr-4">Member</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Role count</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Updated</th>
                {canMutate ? <th className="py-2 pr-4">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {memberships.map((membership) => (
                <tr key={membership.membershipId} className="border-b border-line/70">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {membership.name}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {membership.email}
                  </td>
                  <td className="py-3 pr-4">{membership.status}</td>
                  <td className="py-3 pr-4">{membership.role}</td>
                  <td className="py-3 pr-4">{membership.roleCount}</td>
                  <td className="py-3 pr-4">
                    {formatErpDateTime(membership.createdAt)}
                  </td>
                  <td className="py-3 pr-4">
                    {formatErpDateTime(membership.updatedAt)}
                  </td>
                  {canMutate ? (
                    <td className="flex flex-col gap-2 py-3 pr-4">
                      {updateStatusAction ? (
                        <SystemAdminMembershipStatusActions
                          membershipId={membership.membershipId}
                          status={membership.status}
                          updateStatusAction={updateStatusAction}
                        />
                      ) : null}
                      {removeRoleAction ? (
                        <SystemAdminRoleAssignmentActions
                          membershipId={membership.membershipId}
                          role={membership.role}
                          removeRoleAction={removeRoleAction}
                        />
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionPanel>
  );
}
