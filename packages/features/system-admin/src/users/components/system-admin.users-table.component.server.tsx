import { formatErpDateTime } from "@afenda/kernel";
import { SectionPanel } from "@afenda/ui";
import type { SystemAdminActionResult } from "../../contracts";
import { SystemAdminUserStatusActions } from "./system-admin.user-status-actions.component.client";
import type { SystemAdminUserRow } from "../contracts";

type UserStatusAction = (
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function SystemAdminUsersTable({
  users,
  suspendAction,
  reactivateAction,
}: {
  users: readonly SystemAdminUserRow[];
  suspendAction?: UserStatusAction;
  reactivateAction?: UserStatusAction;
}) {
  const canMutate = Boolean(suspendAction && reactivateAction);

  return (
    <SectionPanel
      title="Users"
      description="Users and pending invitations scoped to the active organization."
    >
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No users or pending invitations were found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-line">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Membership</th>
                <th className="py-2 pr-4">Roles</th>
                <th className="py-2 pr-4">Last active</th>
                <th className="py-2 pr-4">Created</th>
                {canMutate ? <th className="py-2 pr-4">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-line/70">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {user.name}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{user.email}</td>
                  <td className="py-3 pr-4">{user.status}</td>
                  <td className="py-3 pr-4">{user.membership}</td>
                  <td className="py-3 pr-4">{user.roles.join(", ")}</td>
                  <td className="py-3 pr-4">{user.lastActive}</td>
                  <td className="py-3 pr-4">
                    {formatErpDateTime(user.createdAt)}
                  </td>
                  {suspendAction && reactivateAction ? (
                    <td className="py-3 pr-4">
                      <SystemAdminUserStatusActions
                        membershipId={user.membershipId ?? undefined}
                        status={user.status}
                        suspendAction={suspendAction}
                        reactivateAction={reactivateAction}
                      />
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
