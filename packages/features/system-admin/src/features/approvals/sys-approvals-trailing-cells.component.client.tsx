"use client";

import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui";
import { ArrowUpRightIcon, BanIcon, PowerIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { SystemAdminDestructiveConfirmButton } from "../overview/sys-destructive-confirm-button.component.client";
import { SystemAdminTrailingActionStack } from "../overview/sys-trailing-action-stack.component.client";
import type { SystemAdminActionResult } from "../tenant-execution/sys-action-result.contract";
import { setSystemAdminApprovalRuleEnabledAction } from "./sys-approval-rules.actions.server";
import { systemAdminApprovalsUiCopy } from "./sys-approvals-ui.copy.shared";

export function SystemAdminApprovalTrailingCell({
  row,
  context: _context,
}: GovernedListTrailingCellProps) {
  const [result, setResult] = useState<SystemAdminActionResult>();
  const [isPending, startTransition] = useTransition();
  const listCopy = systemAdminApprovalsUiCopy.list;
  const trailingAction = row.trailingAction;
  const enabled = row.cells["enabled"] === "true";
  const reviewHref =
    typeof row.rowHref === "string" && row.rowHref.length > 0
      ? row.rowHref
      : undefined;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return reviewHref ? (
      <Button
        variant="outline"
        size="sm"
        asChild
        data-testid={`system-admin-approval-trailing-review:${row.id}`}
      >
        <Link href={reviewHref}>
          <ArrowUpRightIcon data-icon="inline-start" />
          {listCopy.reviewActionLabel}
        </Link>
      </Button>
    ) : null;
  }

  const disabled = trailingAction.state === "disabled" || isPending;
  const nextEnabled = !enabled;
  const mutationLabel =
    trailingAction.descriptor?.label ??
    (nextEnabled ? listCopy.enableActionLabel : listCopy.disableActionLabel);
  const confirm = trailingAction.descriptor?.confirm;
  const mutationVariant = nextEnabled ? "outline" : "destructive";
  const mutationIcon = nextEnabled ? (
    <PowerIcon data-icon="inline-start" />
  ) : (
    <BanIcon data-icon="inline-start" />
  );

  function runMutation() {
    startTransition(async () => {
      setResult(
        await setSystemAdminApprovalRuleEnabledAction({
          approvalKey: row.id,
          enabled: nextEnabled,
        }),
      );
    });
  }

  const mutationControl = confirm ? (
    <SystemAdminDestructiveConfirmButton
      confirm={confirm}
      disabled={disabled}
      variant={mutationVariant}
      onConfirm={runMutation}
    >
      {mutationIcon}
      {mutationLabel}
    </SystemAdminDestructiveConfirmButton>
  ) : (
    <Button
      type="button"
      size="sm"
      variant={mutationVariant}
      disabled={disabled}
      aria-busy={isPending}
      data-testid={`system-admin-approval-trailing-toggle:${row.id}`}
      onClick={runMutation}
    >
      {mutationIcon}
      {mutationLabel}
    </Button>
  );

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div
        className="@container min-w-40"
        data-testid={`system-admin-approval-trailing:${row.id}`}
      >
        <SystemAdminTrailingActionStack footer={<ActionFormErrors result={result} />}>
          {reviewHref ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={reviewHref}>
                <ArrowUpRightIcon data-icon="inline-start" />
                {listCopy.reviewActionLabel}
              </Link>
            </Button>
          ) : null}
          {mutationControl}
        </SystemAdminTrailingActionStack>
      </div>
    </GovernedTrailingActionSlot>
  );
}
