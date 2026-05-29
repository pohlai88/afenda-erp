"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import {
  systemAdminEmailRoleActionFormFooterClass,
  systemAdminEmailRoleActionFormGridClass,
} from "../../overview/surfaces/system-admin.form-layout.shared";
import { Button, Field, FieldGroup, FieldLabel, Input, NativeSelect } from "@afenda/ui";
import { UserCogIcon } from "lucide-react";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
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
    <form action={formAction} className="@container">
      <FieldGroup className={systemAdminEmailRoleActionFormGridClass}>
        <Field>
          <FieldLabel>Membership ID</FieldLabel>
          <Input name="membershipId" required />
        </Field>
        <Field>
          <FieldLabel>Role</FieldLabel>
          <NativeSelect name="role" defaultValue="viewer">
            {systemAdminSeedRoles
              .filter((role) => role.status === "active")
              .map((role) => (
                <option key={role.key} value={role.key}>
                  {role.name}
                </option>
              ))}
          </NativeSelect>
        </Field>
        <div className="flex items-end">
          <Button type="submit" disabled={pending}>
            <UserCogIcon data-icon="inline-start" />
            Assign
          </Button>
        </div>
        <div className={systemAdminEmailRoleActionFormFooterClass}>
          <ActionFormErrors result={state} />
        </div>
      </FieldGroup>
    </form>
  );
}
