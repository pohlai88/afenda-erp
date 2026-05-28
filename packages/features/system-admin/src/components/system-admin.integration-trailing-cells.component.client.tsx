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

import type { SystemAdminActionResult } from "../contracts";
import {
  revokeApiCredentialAction,
  setWebhookEnabledAction,
} from "../actions/system-admin.integrations.actions.server";

export function WebhookTrailingCell({ row }: GovernedListTrailingCellProps) {
  const [result, setResult] = useState<SystemAdminActionResult>();
  const [isPending, startTransition] = useTransition();
  const trailingAction = row.trailingAction;
  const status = String(row.cells["status"] ?? "");
  const nextEnabled = status !== "enabled";

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
          variant={nextEnabled ? "outline" : "destructive"}
          disabled={disabled}
          onClick={() =>
            startTransition(async () => {
              setResult(
                await setWebhookEnabledAction({
                  webhookId: row.id,
                  enabled: nextEnabled,
                }),
              );
            })
          }
        >
          {nextEnabled ? (
            <PowerIcon data-icon="inline-start" />
          ) : (
            <BanIcon data-icon="inline-start" />
          )}
          {nextEnabled ? "Enable" : "Disable"}
        </Button>
        <ActionFormErrors result={result} />
      </div>
    </GovernedTrailingActionSlot>
  );
}

export function ApiCredentialTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
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
              setResult(await revokeApiCredentialAction(row.id));
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
