"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import {
  type InviteMemberActionData,
  type SystemAdminActionResult,
} from "@afenda/feature-system-admin/client";
import { organizationRoles } from "@afenda/auth";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { NativeSelect } from "@afenda/ui/native-select";
import { SendIcon } from "lucide-react";
import { useActionState } from "react";

import { inviteMemberAction } from "@/app/(app)/system-admin/identity/actions";
import { SystemAdminOneTimeSecretPanel } from "./system-admin-one-time-secret";

export function InviteMemberForm() {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult<InviteMemberActionData> | undefined,
    FormData
  >(inviteMemberAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
      <label className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Email</span>
        <Input name="email" type="email" required />
      </label>
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
