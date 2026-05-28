"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { NativeSelect } from "@afenda/ui/native-select";
import { UserCogIcon } from "lucide-react";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../contracts";
import { systemAdminSeedRoles } from "../contracts";

type RoleAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult>;

export function SystemAdminAssignRoleDialog({
  assignRoleAction,
}: {
  assignRoleAction: RoleAction;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(assignRoleAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Membership ID</span>
        <Input name="membershipId" required />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Role</span>
        <NativeSelect name="role" defaultValue="viewer">
          {systemAdminSeedRoles.map((role) => (
            <option key={role.key} value={role.key}>
              {role.name}
            </option>
          ))}
        </NativeSelect>
      </label>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          <UserCogIcon data-icon="inline-start" />
          Assign
        </Button>
      </div>
      <div className="md:col-span-3">
        <ActionFormErrors result={state} />
      </div>
    </form>
  );
}
