"use client";

import { useActionState } from "react";

import {
  applyLegalHoldToTenantDocumentAction,
  deleteTenantDocumentAction,
  releaseLegalHoldToTenantDocumentAction,
  releaseTenantDocumentScanQuarantineAction,
} from "@afenda/feature-system-admin/server";
import {
  ActionFormErrors,
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { type ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";

type DocumentRegistryTrailingContext = {
  moduleId?: string;
  organizationLegalHoldActive?: boolean;
};

function DocumentLifecycleForm({
  action,
  submitLabel,
  documentId,
  moduleId,
  buttonVariant = "outline",
  disabled = false,
}: {
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  submitLabel: string;
  documentId: string;
  moduleId: string;
  buttonVariant?: "default" | "secondary" | "outline" | "destructive";
  disabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-surface-sm">
      <input type="hidden" name="documentId" value={documentId} />
      <input type="hidden" name="moduleId" value={moduleId} />
      <Button
        type="submit"
        size="sm"
        variant={buttonVariant}
        className="w-fit"
        disabled={pending || disabled}
      >
        {submitLabel}
      </Button>
      <ActionFormErrors result={state} />
    </form>
  );
}

export function SystemAdminDocumentRegistryTrailingCell({
  row,
  context,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const trailingContext = context as DocumentRegistryTrailingContext | undefined;
  const moduleId = trailingContext?.moduleId;
  const organizationLegalHoldActive =
    trailingContext?.organizationLegalHoldActive === true;

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

  const onLegalHold = row.cells.retentionClassValue === "legal-hold";
  const scanStatus = row.cells.scanStatusValue;
  const scanQuarantined =
    scanStatus === "failed" || scanStatus === "quarantined";
  const orgHoldBlocksMutation =
    organizationLegalHoldActive && !onLegalHold && !scanQuarantined;

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="flex flex-col gap-surface-sm">
        {organizationLegalHoldActive && !onLegalHold ? (
          <span className="type-muted">Organization legal hold is active.</span>
        ) : null}
        {onLegalHold ? (
          <DocumentLifecycleForm
            action={releaseLegalHoldToTenantDocumentAction}
            submitLabel="Release hold"
            documentId={row.id}
            moduleId={moduleId}
            buttonVariant="secondary"
          />
        ) : (
          <>
            <DocumentLifecycleForm
              action={applyLegalHoldToTenantDocumentAction}
              submitLabel="Legal hold"
              documentId={row.id}
              moduleId={moduleId}
              buttonVariant="secondary"
              disabled={organizationLegalHoldActive}
            />
            {!scanQuarantined ? (
              <DocumentLifecycleForm
                action={deleteTenantDocumentAction}
                submitLabel="Delete"
                documentId={row.id}
                moduleId={moduleId}
                buttonVariant="destructive"
                disabled={organizationLegalHoldActive}
              />
            ) : null}
          </>
        )}
        {scanQuarantined ? (
          <DocumentLifecycleForm
            action={releaseTenantDocumentScanQuarantineAction}
            submitLabel="Approve release"
            documentId={row.id}
            moduleId={moduleId}
            buttonVariant="default"
            disabled={orgHoldBlocksMutation}
          />
        ) : null}
      </div>
    </GovernedTrailingActionSlot>
  );
}
