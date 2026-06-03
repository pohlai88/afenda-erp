"use client";

import { useActionState } from "react";

import { releaseTenantDocumentScanQuarantineAction } from "@afenda/feature-system-admin/server";
import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { type ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";

type QuarantineTrailingContext = {
  organizationLegalHoldActive?: boolean;
};

function ApproveReleaseForm({
  documentId,
  moduleId,
  disabled,
}: {
  documentId: string;
  moduleId: string;
  disabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    releaseTenantDocumentScanQuarantineAction,
    undefined as ActionResult | undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-surface-sm">
      <input type="hidden" name="documentId" value={documentId} />
      <input type="hidden" name="moduleId" value={moduleId} />
      <Button
        type="submit"
        size="sm"
        variant="default"
        className="w-fit"
        disabled={pending || disabled}
      >
        Approve release
      </Button>
      <ActionFormErrors result={state} />
    </form>
  );
}

export function SystemAdminDocumentQuarantineTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const trailingContext = context as QuarantineTrailingContext | undefined;
  const organizationLegalHoldActive =
    trailingContext?.organizationLegalHoldActive === true;
  const moduleId =
    typeof row.cells.moduleIdValue === "string" ? row.cells.moduleIdValue : undefined;

  if (!moduleId || !isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  if (trailingAction.state === "disabled") {
    return (
      <GovernedTrailingActionSlot trailingAction={trailingAction}>
        <span className="type-muted">
          {trailingAction.disabledReason ?? "Not permitted"}
        </span>
      </GovernedTrailingActionSlot>
    );
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-col gap-surface-sm">
        {organizationLegalHoldActive ? (
          <span className="type-muted">Organization legal hold is active.</span>
        ) : null}
        <ApproveReleaseForm
          documentId={row.id}
          moduleId={moduleId}
          disabled={organizationLegalHoldActive}
        />
      </div>
    </GovernedTrailingActionSlot>
  );
}
