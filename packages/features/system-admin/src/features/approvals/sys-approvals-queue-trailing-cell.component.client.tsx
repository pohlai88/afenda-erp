"use client";

import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Separator,
  Textarea,
} from "@afenda/ui";
import { ArrowUpRightIcon, CheckIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, useTransition } from "react";

import { SystemAdminTrailingActionStack } from "../overview/sys-trailing-action-stack.component.client";
import { decideSystemAdminApprovalWorkItemAction } from "./sys-approvals-queue.actions.server";
import { systemAdminApprovalsUiCopy } from "./sys-approvals-ui.copy.shared";

export function SystemAdminApprovalQueueTrailingCell({
  row,
  context: _context,
}: GovernedListTrailingCellProps) {
  const copy = systemAdminApprovalsUiCopy.queue;
  const [approveResult, setApproveResult] = useState<ActionResult>();
  const [isApprovePending, startApproveTransition] = useTransition();
  const [rejectResult, rejectFormAction, isRejectPending] = useActionState(
    async (_previous: ActionResult | undefined, formData: FormData) =>
      decideSystemAdminApprovalWorkItemAction({
        workItemId: row.id,
        decision: "reject",
        rejectionReason: String(formData.get("rejectionReason") ?? ""),
      }),
    undefined,
  );

  const trailingAction = row.trailingAction;
  const workItemHref =
    typeof row.rowHref === "string" && row.rowHref.length > 0
      ? row.rowHref
      : undefined;
  const isMutating = isApprovePending || isRejectPending;
  const reasonFieldId = `approval-queue-reject-reason-${row.id}`;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return workItemHref ? (
      <Button
        variant="outline"
        size="sm"
        asChild
        data-testid={`system-admin-approval-queue-open:${row.id}`}
      >
        <Link href={workItemHref}>
          <ArrowUpRightIcon data-icon="inline-start" />
          {copy.openActionLabel}
        </Link>
      </Button>
    ) : null;
  }

  const disabled = trailingAction.state === "disabled" || isMutating;

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div
        className="@container flex min-w-48 flex-col gap-surface-sm"
        data-testid={`system-admin-approval-queue-trailing:${row.id}`}
      >
        <SystemAdminTrailingActionStack
          footer={
            <>
              <ActionFormErrors result={approveResult} />
              <ActionFormErrors result={rejectResult} />
            </>
          }
        >
          {workItemHref ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={workItemHref}>
                <ArrowUpRightIcon data-icon="inline-start" />
                {copy.openActionLabel}
              </Link>
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={disabled}
            aria-busy={isApprovePending}
            data-testid={`system-admin-approval-queue-approve:${row.id}`}
            onClick={() =>
              startApproveTransition(async () => {
                setApproveResult(
                  await decideSystemAdminApprovalWorkItemAction({
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
        </SystemAdminTrailingActionStack>

        <Separator />

        <form
          action={rejectFormAction}
          className="flex flex-col gap-surface-sm"
          data-testid={`system-admin-approval-queue-reject-form:${row.id}`}
        >
          <FieldSet disabled={disabled} className="gap-surface-sm border-0 p-0">
            <FieldLegend variant="label">{copy.rejectSectionLabel}</FieldLegend>
            <FieldDescription>{copy.rejectReasonDescription}</FieldDescription>
            <Field>
              <FieldLabel htmlFor={reasonFieldId}>
                {copy.rejectReasonLabel}
              </FieldLabel>
              <Textarea
                id={reasonFieldId}
                name="rejectionReason"
                placeholder={copy.rejectReasonPlaceholder}
                required
                disabled={disabled}
                rows={2}
                className="min-h-0 resize-y"
                data-testid={`system-admin-approval-queue-reject-reason:${row.id}`}
              />
            </Field>
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              className="w-fit"
              disabled={disabled}
              aria-busy={isRejectPending}
              data-testid={`system-admin-approval-queue-reject:${row.id}`}
            >
              <XIcon data-icon="inline-start" />
              {copy.rejectActionLabel}
            </Button>
          </FieldSet>
        </form>
      </div>
    </GovernedTrailingActionSlot>
  );
}
