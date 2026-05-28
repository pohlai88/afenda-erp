"use client";

import { organizationRoles } from "@afenda/auth";
import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { NativeSelect } from "@afenda/ui/native-select";
import { SaveIcon } from "lucide-react";
import { useActionState } from "react";

import type { SystemAdminActionResult } from "../contracts";
import { systemAdminPermissionCatalog } from "../contracts";

type SetRoleOverrideAction = (
  state: SystemAdminActionResult | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function RoleOverrideForm({
  setRoleOverrideAction,
}: {
  setRoleOverrideAction: SetRoleOverrideAction;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(setRoleOverrideAction, undefined);

  return (
    <form
      action={formAction}
      className="grid gap-4 md:grid-cols-[160px_1fr_160px_auto]"
    >
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Role</span>
        <NativeSelect name="role" defaultValue="staff">
          {organizationRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </NativeSelect>
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Capability</span>
        <NativeSelect
          name="permissionKey"
          defaultValue="system-admin.audit.read"
        >
          {systemAdminPermissionCatalog.map((permission) => (
            <option key={permission.value} value={permission.value}>
              {permission.label}
            </option>
          ))}
        </NativeSelect>
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">State</span>
        <NativeSelect name="enabled" defaultValue="true">
          <option value="true">Enable</option>
          <option value="false">Disable</option>
        </NativeSelect>
      </label>
      <div className="flex items-end">
        <Button type="submit" variant="outline" disabled={pending}>
          <SaveIcon data-icon="inline-start" />
          Save
        </Button>
      </div>
      <div className="md:col-span-4">
        <ActionFormErrors result={state} />
        {state?.ok ? (
          <p className="text-sm text-muted-foreground" role="status">
            Role override saved.
          </p>
        ) : null}
      </div>
    </form>
  );
}
