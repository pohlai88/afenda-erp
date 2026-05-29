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
import { systemAdminApprovalsUiCopy } from "../surface/system-admin.approvals-ui.copy.shared";
import { setSystemAdminApprovalRuleEnabledAction } from "../actions/system-admin.approval-rules.actions.server";

export function SystemAdminApprovalTrailingCell({
  row,
  context: _context,
}: GovernedListTrailingCellProps) {
  const [result, setResult] = useState<SystemAdminActionResult>();
  const [isPending, startTransition] = useTransition();
  const trailingAction = row.trailingAction;
  const reviewLabel = systemAdminApprovalsUiCopy.list.reviewActionLabel;
  const enabled = row.cells["enabled"] === "true";
  const reviewHref =
    typeof row.rowHref === "string" && row.rowHref.length > 0
      ? row.rowHref
      : undefined;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return reviewHref ? (
      <Button variant="outline" size="sm" asChild>
        <Link href={reviewHref}>{reviewLabel}</Link>
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
            <Link href={reviewHref}>{reviewLabel}</Link>
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
                await setSystemAdminApprovalRuleEnabledAction({
                  approvalKey: row.id,
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
          {trailingAction.descriptor?.label ?? (nextEnabled ? "Enable" : "Disable")}
        </Button>
        <ActionFormErrors result={result} />
      </div>
    </GovernedTrailingActionSlot>
  );
}
