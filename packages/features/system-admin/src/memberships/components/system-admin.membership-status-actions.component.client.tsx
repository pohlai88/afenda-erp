"use client";

import { Button } from "@afenda/ui/button";
import { NativeSelect } from "@afenda/ui/native-select";
import { useState, useTransition, type FormEvent } from "react";
import type { SystemAdminActionResult } from "../../contracts";
import type { SystemAdminMembershipStatus } from "../contracts";

type MembershipStatusAction = (
  payload: FormData,
) => Promise<SystemAdminActionResult | undefined>;

export function SystemAdminMembershipStatusActions({
  membershipId,
  status,
  updateStatusAction,
}: {
  membershipId: string;
  status: SystemAdminMembershipStatus;
  updateStatusAction: MembershipStatusAction;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SystemAdminActionResult>();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = new FormData(event.currentTarget);
    const nextStatus = payload.get("status");

    if (nextStatus === status) {
      return;
    }

    if (
      nextStatus !== "active" &&
      !window.confirm("Apply this membership status change?")
    ) {
      return;
    }

    startTransition(async () => {
      setResult(await updateStatusAction(payload));
    });
  }

  return (
    <form className="flex min-w-44 flex-col gap-1" onSubmit={submit}>
      <input type="hidden" name="membershipId" value={membershipId} />
      <div className="flex items-center gap-2">
        <NativeSelect
          name="status"
          defaultValue={status}
          disabled={pending}
        >
          <option value="active">active</option>
          <option value="suspended">suspended</option>
          <option value="removed">removed</option>
        </NativeSelect>
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          disabled={pending}
        >
          Save
        </Button>
      </div>
      {result?.ok === false ? (
        <span className="max-w-56 text-xs text-destructive">
          {result.error}
        </span>
      ) : null}
    </form>
  );
}
