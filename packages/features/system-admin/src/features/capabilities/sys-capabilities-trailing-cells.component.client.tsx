"use client";

import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { BanIcon, PowerIcon } from "lucide-react";
import { useState, useTransition } from "react";
import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";
import { setSystemAdminCapabilityAvailabilityAction } from "./sys-capability-settings.actions.server";

export function SystemAdminCapabilityTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const [result, setResult] = useState<SystemAdminActionResult>();
  const [isPending, startTransition] = useTransition();
  const trailingAction = row.trailingAction;
  const availability = String(row.cells["availability"] ?? "");
  const nextAvailability = availability === "disabled" ? "enabled" : "disabled";

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
          variant={nextAvailability === "enabled" ? "outline" : "destructive"}
          disabled={disabled}
          onClick={() =>
            startTransition(async () => {
              setResult(
                await setSystemAdminCapabilityAvailabilityAction({
                  capabilityKey: row.id,
                  availability: nextAvailability,
                }),
              );
            })
          }
        >
          {nextAvailability === "enabled" ? (
            <PowerIcon data-icon="inline-start" />
          ) : (
            <BanIcon data-icon="inline-start" />
          )}
          {nextAvailability === "enabled" ? "Enable" : "Disable"}
        </Button>
        <ActionFormErrors result={result} />
      </div>
    </GovernedTrailingActionSlot>
  );
}
