"use client";

import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { CheckIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { decideApprovalWorkItemAction } from "../actions/approvals.decision.actions.server";
import { approvalsUiCopy } from "../surface/approvals-ui.copy.shared";

export function ApprovalsQueueTrailingCell({
  row,
  context: _context,
}: GovernedListTrailingCellProps) {
  const [result, setResult] = useState<ActionResult>();
  const [isPending, startTransition] = useTransition();
  const copy = approvalsUiCopy.queue;
  const trailingAction = row.trailingAction;
  const workItemHref =
    typeof row.rowHref === "string" && row.rowHref.length > 0
      ? row.rowHref
      : undefined;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return workItemHref ? (
      <Button variant="outline" size="sm" asChild>
        <Link href={workItemHref}>{copy.openActionLabel}</Link>
      </Button>
    ) : null;
  }

  const disabled = trailingAction.state === "disabled" || isPending;

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-wrap items-center gap-2">
        {workItemHref ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={workItemHref}>{copy.openActionLabel}</Link>
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() =>
            startTransition(async () => {
              setResult(
                await decideApprovalWorkItemAction({
                  workItemId: row.id,
                  decision: "approve",
                }),
              );
            })
          }
        >
          <CheckIcon data-icon="inline-start" />
          {copy.approveActionLabel}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={disabled}
          onClick={() => {
            const rejectionReason = window.prompt(
              "Rejection reason (required)",
            );
            if (!rejectionReason?.trim()) {
              return;
            }

            startTransition(async () => {
              setResult(
                await decideApprovalWorkItemAction({
                  workItemId: row.id,
                  decision: "reject",
                  rejectionReason: rejectionReason.trim(),
                }),
              );
            });
          }}
        >
          <XIcon data-icon="inline-start" />
          {copy.rejectActionLabel}
        </Button>
        <ActionFormErrors result={result} />
      </div>
    </GovernedTrailingActionSlot>
  );
}
