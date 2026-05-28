"use client";

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { useTransition } from "react";

import {
  approveSandbox,
  discardSandbox,
  rejectSandbox,
} from "@/app/(app)/system-admin/machine-layer/sandbox-actions";

export function SandboxTrailingCell({ row }: GovernedListTrailingCellProps) {
  const [isPending, startTransition] = useTransition();
  const trailingAction = row.trailingAction;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const disabled =
    trailingAction.state === "disabled" || isPending;

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={() => startTransition(() => approveSandbox(row.id))}
        >
          Approve
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => startTransition(() => rejectSandbox(row.id))}
        >
          Reject
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() => startTransition(() => discardSandbox(row.id))}
        >
          Discard
        </Button>
      </div>
    </GovernedTrailingActionSlot>
  );
}
