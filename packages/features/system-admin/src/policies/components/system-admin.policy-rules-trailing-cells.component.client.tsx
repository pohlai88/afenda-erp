"use client";

import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { BanIcon, PowerIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { setSystemAdminPolicyRuleEnabledAction } from "../actions/system-admin.policy-rules.actions.server";

export function SystemAdminPolicyTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const [result, setResult] = useState<SystemAdminActionResult>();
  const [isPending, startTransition] = useTransition();
  const trailingAction = row.trailingAction;
  const enabled = row.cells["enabled"] === "true";
  const reviewHref =
    typeof row.rowHref === "string" && row.rowHref.length > 0
      ? row.rowHref
      : undefined;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return reviewHref ? (
      <Button variant="outline" size="sm" asChild>
        <Link href={reviewHref}>Review</Link>
      </Button>
    ) : null;
  }

  const disabled = trailingAction.state === "disabled" || isPending;
  const nextEnabled = !enabled;

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-wrap items-center gap-2">
        {reviewHref ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={reviewHref}>Review</Link>
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant={nextEnabled ? "outline" : "destructive"}
          disabled={disabled}
          onClick={() =>
            startTransition(async () => {
              setResult(
                await setSystemAdminPolicyRuleEnabledAction({
                  policyKey: row.id,
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
