"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { NativeSelect } from "@afenda/ui/native-select";
import { SendIcon } from "lucide-react";
import { useActionState } from "react";
import type { SystemAdminActionResult } from "../../contracts";
import type { SystemAdminInviteUserResult } from "../contracts";
import { systemAdminSeedRoles } from "../../roles/contracts";
import { SystemAdminOneTimeSecretPanel } from "../../components/system-admin.one-time-secret.component.client";

type InviteAction = (
  state: SystemAdminActionResult<SystemAdminInviteUserResult> | undefined,
  payload: FormData,
) => Promise<SystemAdminActionResult<SystemAdminInviteUserResult>>;

export function SystemAdminInviteUserDialog({
  inviteAction,
}: {
  inviteAction: InviteAction;
}) {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult<SystemAdminInviteUserResult> | undefined,
    FormData
  >(inviteAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Email</span>
        <Input name="email" type="email" required />
      </label>
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Initial role</span>
        <NativeSelect name="role" defaultValue="staff">
          {systemAdminSeedRoles.map((role) => (
            <option key={role.key} value={role.key}>
              {role.name}
            </option>
          ))}
        </NativeSelect>
      </label>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          <SendIcon data-icon="inline-start" />
          Invite
        </Button>
      </div>
      <div className="md:col-span-3">
        <ActionFormErrors result={state} />
        {state?.ok && state.data ? (
          <SystemAdminOneTimeSecretPanel
            title="One-time invitation token"
            secret={state.data.token}
          />
        ) : null}
      </div>
    </form>
  );
}
