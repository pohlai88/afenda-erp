import { SectionPanel } from "@afenda/ui";
import type { SystemAdminRoleRow } from "../contracts";

export function SystemAdminRolesTable({
  roles,
}: {
  roles: readonly SystemAdminRoleRow[];
}) {
  return (
    <SectionPanel
      title="Roles"
      description="Seeded role catalog and active assignment counts."
    >
      {roles.length === 0 ? (
        <p className="text-sm text-muted-foreground">No roles are configured.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-line">
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Key</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4">Assigned members</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.key} className="border-b border-line/70">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {role.name}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{role.key}</td>
                  <td className="py-3 pr-4">{role.description}</td>
                  <td className="py-3 pr-4">{role.assignedMembers}</td>
                  <td className="py-3 pr-4">{role.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionPanel>
  );
}
