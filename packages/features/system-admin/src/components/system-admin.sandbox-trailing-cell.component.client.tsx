"use client";

import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { useState, useTransition } from "react";

import type { SystemAdminActionResult } from "../contracts";
import {
  approveSandbox,
  discardSandbox,
  rejectSandbox,
} from "../actions/system-admin.machine-layer.actions.server";

function toActionFailure(error: unknown): SystemAdminActionResult {
  return {
    ok: false,
    error: error instanceof Error ? error.message : "Sandbox action failed.",
  };
}

export function SandboxTrailingCell({ row }: GovernedListTrailingCellProps) {
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
          variant="secondary"
          disabled={disabled}
          onClick={() =>
            startTransition(async () => {
              try {
                await approveSandbox(row.id);
                setResult(undefined);
              } catch (error) {
                setResult(toActionFailure(error));
              }
            })
          }
        >
          Approve
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() =>
            startTransition(async () => {
              try {
                await rejectSandbox(row.id);
                setResult(undefined);
              } catch (error) {
                setResult(toActionFailure(error));
              }
            })
          }
        >
          Reject
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={() =>
            startTransition(async () => {
              try {
                await discardSandbox(row.id);
                setResult(undefined);
              } catch (error) {
                setResult(toActionFailure(error));
              }
            })
          }
        >
          Discard
        </Button>
        <ActionFormErrors result={result} />
      </div>
    </GovernedTrailingActionSlot>
  );
}
