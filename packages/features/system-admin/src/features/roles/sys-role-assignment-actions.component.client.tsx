"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { useState, useTransition } from "react";
import type { OrganizationRole } from "@afenda/auth";
import { SystemAdminDestructiveConfirmButton } from "../../overview/components/system-admin.destructive-confirm-button.component.client";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminMembershipTrailingConfirms } from "../../memberships/surface/system-admin.memberships-trailing-confirm.client.shared";

type RoleRemovalAction = (
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function SystemAdminRoleAssignmentActions({
  membershipId,
  role,
  removeRoleAction,
  disabled,
}: {
  membershipId: string;
  role: OrganizationRole;
  removeRoleAction: RoleRemovalAction;
  disabled?: boolean;
}) {
  const [result, setResult] = useState<SystemAdminActionResult>();
  const [isPending, startTransition] = useTransition();

  if (role === "viewer") {
    return <span className="type-caption">Base role</span>;
  }

  function removeRole() {
    const payload = new FormData();
    payload.set("membershipId", membershipId);
    payload.set("role", role);
    startTransition(async () => {
      setResult(await removeRoleAction(payload));
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <SystemAdminDestructiveConfirmButton
        confirm={systemAdminMembershipTrailingConfirms.removeRole}
        disabled={disabled || isPending}
        variant="outline"
        onConfirm={removeRole}
      >
        Remove role
      </SystemAdminDestructiveConfirmButton>
      <ActionFormErrors result={result} />
    </div>
  );
}
