"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import {
  SystemAdminOneTimeSecretPanel,
} from "../overview/sys-one-time-secret.component.client";
import {
  systemAdminEmailRoleActionFormFooterClass,
  systemAdminEmailRoleActionFormGridClass,
} from "../overview/sys-form-layout.shared";
import { systemAdminRoutePaths } from "../overview/sys-route-paths.contract";
import { Button, Field, FieldGroup, FieldLabel, Input, NativeSelect } from "@afenda/ui";
import { SendIcon } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";
import { systemAdminSeedRoles } from "../roles/sys-roles.contract";
import type { InviteMemberActionData } from "./sys-memberships-action-dtos.contract";

type InviteMemberAction = (
  state: SystemAdminActionResult<InviteMemberActionData> | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult<InviteMemberActionData> | undefined>;

export function InviteMemberForm({
  inviteMemberAction,
}: {
  inviteMemberAction: InviteMemberAction;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult<InviteMemberActionData> | undefined,
    FormData
  >(inviteMemberAction, undefined);

  return (
    <form action={formAction} className="@container">
      <FieldGroup className={systemAdminEmailRoleActionFormGridClass}>
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input name="email" type="email" required autoComplete="email" />
        </Field>
        <Field>
          <FieldLabel>Initial role</FieldLabel>
          <NativeSelect name="role" defaultValue="staff">
            {systemAdminSeedRoles.map((role) => (
              <option key={role.key} value={role.key}>
                {role.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <div className="flex items-end">
          <Button type="submit" disabled={pending}>
            <SendIcon data-icon="inline-start" />
            Invite
          </Button>
        </div>
        <div className={systemAdminEmailRoleActionFormFooterClass}>
          <p className="type-muted">
            Full user lifecycle (resend, suspend, inspect access) lives on the{" "}
            <Link href={systemAdminRoutePaths.users} className="font-medium underline">
              Users
            </Link>{" "}
            surface when you have system-admin.users.manage.
          </p>
          <ActionFormErrors result={state} />
          {state?.ok && state.data ? (
            <SystemAdminOneTimeSecretPanel secret={state.data.token} />
          ) : null}
        </div>
      </FieldGroup>
    </form>
  );
}
