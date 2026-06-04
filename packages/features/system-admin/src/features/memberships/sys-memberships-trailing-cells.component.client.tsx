"use client";

import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import Link from "next/link";
import { RotateCcwIcon, ShieldOffIcon, UserMinusIcon } from "lucide-react";
import { useState, useTransition } from "react";
import type { OrganizationRole } from "@afenda/kernel";
import { SystemAdminDestructiveConfirmButton } from "../overview/sys-destructive-confirm-button.component.client";
import { SystemAdminTrailingActionStack } from "../overview/sys-trailing-action-stack.component.client";
import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";
import { removeSystemAdminRoleAssignmentForm } from "../roles/sys-roles.actions.server";
import {
  reactivateSystemAdminMembership,
  removeSystemAdminMembership,
  suspendSystemAdminMembership,
} from "./sys-memberships.actions.server";
import { systemAdminMembershipTrailingConfirms } from "./sys-memberships-trailing-confirm.client.shared";

export function SystemAdminMembershipTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const membershipId = String(row.cells["membershipId"] ?? "");
  const membershipStatus = String(row.cells["membershipStatus"] ?? "");
  const role = String(row.cells["role"] ?? "") as OrganizationRole;
  const rolesHref = String(row.cells["rolesHref"] ?? "/system-admin/roles");
  const canManageRoles = String(row.cells["canManageRoles"] ?? "") === "true";
  const canMutateMemberships =
    String(row.cells["canMutateMemberships"] ?? "") === "true";
  const [result, setResult] = useState<SystemAdminActionResult<unknown>>();
  const [isPending, startTransition] = useTransition();

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const statusActionsDisabled =
    !canMutateMemberships || trailingAction.state === "disabled" || isPending;

  function run(action: () => Promise<SystemAdminActionResult<unknown> | undefined>) {
    startTransition(async () => {
      setResult(await action());
    });
  }

  function removeRole() {
    const payload = new FormData();
    payload.set("membershipId", membershipId);
    payload.set("role", role);
    run(() => removeSystemAdminRoleAssignmentForm(payload));
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <SystemAdminTrailingActionStack footer={<ActionFormErrors result={result} />}>
        {canMutateMemberships && membershipStatus === "active" ? (
          <SystemAdminDestructiveConfirmButton
            confirm={systemAdminMembershipTrailingConfirms.suspend}
            disabled={statusActionsDisabled}
            onConfirm={() => run(() => suspendSystemAdminMembership(membershipId))}
          >
            <ShieldOffIcon data-icon="inline-start" />
            Suspend
          </SystemAdminDestructiveConfirmButton>
        ) : null}
        {canMutateMemberships && membershipStatus === "suspended" ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={statusActionsDisabled}
            onClick={() => run(() => reactivateSystemAdminMembership(membershipId))}
          >
            <RotateCcwIcon data-icon="inline-start" />
            Reactivate
          </Button>
        ) : null}
        {canMutateMemberships &&
        (membershipStatus === "active" || membershipStatus === "suspended") ? (
          <SystemAdminDestructiveConfirmButton
            confirm={systemAdminMembershipTrailingConfirms.remove}
            disabled={statusActionsDisabled}
            variant="outline"
            onConfirm={() => run(() => removeSystemAdminMembership(membershipId))}
          >
            <UserMinusIcon data-icon="inline-start" />
            Remove
          </SystemAdminDestructiveConfirmButton>
        ) : null}
        {canManageRoles && role !== "viewer" ? (
          <SystemAdminDestructiveConfirmButton
            confirm={systemAdminMembershipTrailingConfirms.removeRole}
            disabled={isPending}
            variant="outline"
            onConfirm={removeRole}
          >
            Remove role
          </SystemAdminDestructiveConfirmButton>
        ) : null}
        {membershipStatus !== "removed" ? (
          <Button type="button" size="sm" variant="ghost" asChild>
            <Link href={rolesHref}>View roles</Link>
          </Button>
        ) : null}
      </SystemAdminTrailingActionStack>
    </GovernedTrailingActionSlot>
  );
}
