"use client";

import { Button } from "@afenda/ui/button";
import { useState, useTransition } from "react";
import type { SystemAdminActionResult } from "../../contracts";
import type { SystemAdminUserStatus } from "../contracts";

type UserStatusAction = (
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function SystemAdminUserStatusActions({
  membershipId,
  status,
  suspendAction,
  reactivateAction,
}: {
  membershipId?: string;
  status: SystemAdminUserStatus;
  suspendAction: UserStatusAction;
  reactivateAction: UserStatusAction;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SystemAdminActionResult>();

  if (!membershipId || status === "invited" || status === "removed") {
    return <span className="text-xs text-muted-foreground">No action</span>;
  }

  const nextAction = status === "suspended" ? reactivateAction : suspendAction;
  const label = status === "suspended" ? "Reactivate" : "Suspend";
  const isDangerous = status !== "suspended";

  function submit() {
    if (
      isDangerous &&
      !window.confirm("Suspend this user membership for the active organization?")
    ) {
      return;
    }

    const payload = new FormData();
    payload.set("membershipId", membershipId ?? "");
    startTransition(async () => {
      setResult(await nextAction(payload));
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        size="sm"
        variant={isDangerous ? "destructive" : "secondary"}
        disabled={pending}
        onClick={submit}
      >
        {label}
      </Button>
      {result?.ok === false ? (
        <span className="max-w-48 text-xs text-destructive">
          {result.error}
        </span>
      ) : null}
    </div>
  );
}
