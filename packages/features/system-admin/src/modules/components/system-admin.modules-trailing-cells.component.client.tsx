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
import { SystemAdminDestructiveConfirmButton } from "../../overview/components/system-admin.destructive-confirm-button.component.client";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { setSystemAdminModuleEnabledAction } from "../actions/system-admin.module-settings.actions.server";

export function SystemAdminModuleTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const [result, setResult] = useState<SystemAdminActionResult>();
  const [isPending, startTransition] = useTransition();
  const trailingAction = row.trailingAction;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const availability = String(row.cells["availability"] ?? "");
  const nextEnabled = availability === "disabled";
  const confirm = trailingAction.descriptor?.confirm;

  const disabled = trailingAction.state === "disabled" || isPending;

  function runMutation() {
    startTransition(async () => {
      setResult(
        await setSystemAdminModuleEnabledAction({
          moduleKey: row.id,
          enabled: nextEnabled,
        }),
      );
    });
  }

  const buttonLabel = nextEnabled ? "Enable" : "Disable";
  const buttonVariant = nextEnabled ? "outline" : "destructive";
  const buttonIcon = nextEnabled ? (
    <PowerIcon data-icon="inline-start" />
  ) : (
    <BanIcon data-icon="inline-start" />
  );

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-wrap items-center gap-2">
        {confirm ? (
          <SystemAdminDestructiveConfirmButton
            confirm={confirm}
            disabled={disabled}
            variant={buttonVariant}
            onConfirm={runMutation}
          >
            {buttonIcon}
            {buttonLabel}
          </SystemAdminDestructiveConfirmButton>
        ) : (
          <Button
            type="button"
            size="sm"
            variant={buttonVariant}
            disabled={disabled}
            onClick={runMutation}
          >
            {buttonIcon}
            {buttonLabel}
          </Button>
        )}
        <ActionFormErrors result={result} />
      </div>
    </GovernedTrailingActionSlot>
  );
}
