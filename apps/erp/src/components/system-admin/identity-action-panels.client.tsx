"use client";

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
  ActionFormErrors,
} from "@afenda/governed-surface/client";
import {
  systemAdminPermissionCatalog,
  type InviteMemberActionData,
  type SystemAdminActionResult,
} from "@afenda/feature-system-admin/client";
import { organizationRoles, type OrganizationRole } from "@afenda/auth";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
import { NativeSelect } from "@afenda/ui/native-select";
import { BanIcon, SaveIcon, SendIcon, UserCogIcon } from "lucide-react";
import { useActionState, useState, useTransition } from "react";

import {
  changeMemberRoleByInput,
  inviteMemberAction,
  revokeInvitation,
  setRoleOverrideAction,
} from "@/app/(app)/system-admin/identity/actions";

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
          <div className="mt-3 rounded-md border border-border bg-muted/50 p-3 text-sm">
            <p className="font-medium text-foreground">One-time invitation token</p>
            <code className="mt-2 block overflow-x-auto rounded bg-background px-3 py-2 text-xs">
              {state.data.token}
            </code>
          </div>
        ) : null}
      </div>
    </form>
  );
}

export function RoleOverrideForm() {
  const [state, formAction, pending] = useActionState<
    SystemAdminActionResult | undefined,
    FormData
  >(setRoleOverrideAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-[160px_1fr_160px_auto]">
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
        <NativeSelect name="permissionKey" defaultValue="system-admin.audit.read">
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
      </div>
    </form>
  );
}

export function MemberRoleTrailingCell({ row }: GovernedListTrailingCellProps) {
  const [role, setRole] = useState(String(row.cells["role"] ?? "staff"));
  const [result, setResult] = useState<SystemAdminActionResult>();
  const [isPending, startTransition] = useTransition();
  const trailingAction = row.trailingAction;
  const authUserId = String(row.cells["authUserId"] ?? "");

  if (!isListSurfaceTrailingActionRenderable(trailingAction) || !authUserId) {
    return null;
  }

  const disabled = trailingAction.state === "disabled" || isPending;

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect
          size="sm"
          value={role}
          onChange={(event) => setRole(event.currentTarget.value)}
          disabled={disabled}
          aria-label="Role"
        >
          {organizationRoles.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </NativeSelect>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() =>
            startTransition(async () => {
              setResult(
                await changeMemberRoleByInput({
                  authUserId,
                  role: role as OrganizationRole,
                }),
              );
            })
          }
        >
          <UserCogIcon data-icon="inline-start" />
          Save
        </Button>
        <ActionFormErrors result={result} />
      </div>
    </GovernedTrailingActionSlot>
  );
}

export function InvitationTrailingCell({ row }: GovernedListTrailingCellProps) {
  const [result, setResult] = useState<SystemAdminActionResult>();
  const [isPending, startTransition] = useTransition();
  const trailingAction = row.trailingAction;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const disabled = trailingAction.state === "disabled" || isPending;

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={disabled}
          onClick={() =>
            startTransition(async () => {
              setResult(await revokeInvitation(row.id));
            })
          }
        >
          <BanIcon data-icon="inline-start" />
          Revoke
        </Button>
        <ActionFormErrors result={result} />
      </div>
    </GovernedTrailingActionSlot>
  );
}
