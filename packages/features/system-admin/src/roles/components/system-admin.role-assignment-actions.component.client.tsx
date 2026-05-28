"use client";

import { Button } from "@afenda/ui/button";
import { useState, useTransition } from "react";
import type { OrganizationRole } from "@afenda/auth";
import type { SystemAdminActionResult } from "../../contracts";

type RoleRemovalAction = (
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function SystemAdminRoleAssignmentActions({
  membershipId,
  role,
  removeRoleAction,
}: {
  membershipId: string;
  role: OrganizationRole;
  removeRoleAction: RoleRemovalAction;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SystemAdminActionResult>();

  if (role === "viewer") {
    return <span className="text-xs text-muted-foreground">Base role</span>;
  }

  function submit() {
    if (!window.confirm("Remove this role assignment and demote to viewer?")) {
      return;
    }

    const payload = new FormData();
    payload.set("membershipId", membershipId);
    payload.set("role", role);
    startTransition(async () => {
      setResult(await removeRoleAction(payload));
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={submit}
      >
        Remove role
      </Button>
      {result?.ok === false ? (
        <span className="max-w-56 text-xs text-destructive">
          {result.error}
        </span>
      ) : null}
    </div>
  );
}
