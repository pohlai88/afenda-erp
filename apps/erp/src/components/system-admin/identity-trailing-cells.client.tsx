"use client";

import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import type { SystemAdminActionResult } from "@afenda/feature-system-admin/client";
import { organizationRoles, type OrganizationRole } from "@afenda/auth";
import { Button } from "@afenda/ui/button";
import { NativeSelect } from "@afenda/ui/native-select";
import { BanIcon, UserCogIcon } from "lucide-react";
import { useState, useTransition } from "react";

import {
  changeMemberRoleByInput,
  revokeInvitation,
} from "@/app/(app)/system-admin/identity/actions";

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
