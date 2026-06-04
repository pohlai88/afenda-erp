"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { SystemAdminOneTimeSecretPanel } from "../overview/sys-one-time-secret.component.client";
import {
  systemAdminEmailRoleActionFormFooterClass,
  systemAdminEmailRoleActionFormGridClass,
  systemAdminInlineFormMaxWidthClass,
} from "../overview/sys-form-layout.shared";
import { Button, Field, FieldGroup, FieldLabel, Input, NativeSelect } from "@afenda/ui";
import { SendIcon } from "lucide-react";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";
import type { SystemAdminInviteUserResult } from "./sys-users.contract";
import { systemAdminSeedRoles } from "../roles/sys-roles.contract";
import { systemAdminUsersUiCopy } from "./sys-users-ui.copy.shared";

type InviteAction = (
  state: SystemAdminActionResult<SystemAdminInviteUserResult> | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult<SystemAdminInviteUserResult>>;

export function SystemAdminInviteUserDialog({
  inviteAction,
}: {
  inviteAction: InviteAction;
}) {
  const copy = systemAdminUsersUiCopy.invite;
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult<SystemAdminInviteUserResult> | undefined,
    FormData
  >(inviteAction, undefined);

  return (
    <form action={formAction} className={systemAdminInlineFormMaxWidthClass}>
      <FieldGroup className={systemAdminEmailRoleActionFormGridClass}>
        <Field>
          <FieldLabel>{copy.emailLabel}</FieldLabel>
          <Input name="email" type="email" required autoComplete="email" />
        </Field>
        <Field>
          <FieldLabel>{copy.roleLabel}</FieldLabel>
          <NativeSelect name="role" defaultValue="staff">
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
            <SendIcon data-icon="inline-start" />
            {copy.submitLabel}
          </Button>
        </div>
        <div className={systemAdminEmailRoleActionFormFooterClass}>
          <ActionFormErrors result={state} />
          {state?.ok && state.data ? (
            <SystemAdminOneTimeSecretPanel secret={state.data.token} />
          ) : null}
        </div>
      </FieldGroup>
    </form>
  );
}
