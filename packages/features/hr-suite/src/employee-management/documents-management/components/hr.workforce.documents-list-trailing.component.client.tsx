"use client";

import { useActionState } from "react";

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { ActionFormErrors } from "@afenda/governed-surface/client";
import { type ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { Field, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import {
  rejectHrEmployeeDocumentAction,
  replaceHrEmployeeDocumentAction,
  verifyHrEmployeeDocumentAction,
} from "../actions/hr.workforce.documents.actions.server";
import { hrDocumentsUiCopy } from "../surface/hr.workforce.documents-ui.copy.shared";

function DocumentsTrailingForm({
  action,
  submitLabel,
  rowId,
  children,
  buttonVariant = "outline",
}: {
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  submitLabel: string;
  rowId: string;
  children?: React.ReactNode;
  buttonVariant?: "default" | "secondary" | "outline";
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-surface-sm"
    >
      <input type="hidden" name="documentId" value={rowId} />
      {children}
      <Button
        type="submit"
        size="sm"
        variant={buttonVariant}
        className="w-fit"
        disabled={pending}
      >
        {submitLabel}
      </Button>
      <ActionFormErrors result={state} />
    </form>
  );
}

export function HrDocumentsRepositoryTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrDocumentsUiCopy.repository;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const descriptorId = trailingAction.descriptor?.id;

  if (descriptorId === "replace-document") {
    return (
      <GovernedTrailingActionSlot>
        <DocumentsTrailingForm
          action={replaceHrEmployeeDocumentAction}
          submitLabel={copy.trailingReplaceLabel}
          rowId={row.id}
        >
          <Field>
            <FieldLabel htmlFor={`replace-title-${row.id}`}>
              {copy.formFieldTitle}
            </FieldLabel>
            <Input
              id={`replace-title-${row.id}`}
              name="title"
              defaultValue={String(row.cells.titleValue ?? "")}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`replace-blob-${row.id}`}>
              {copy.formFieldBlobUrl}
            </FieldLabel>
            <Input
              id={`replace-blob-${row.id}`}
              name="blobUrl"
              required
            />
          </Field>
          <input
            type="hidden"
            name="mimeType"
            value={String(row.cells.mimeTypeValue ?? "application/pdf")}
          />
          <input
            type="hidden"
            name="sizeBytes"
            value={String(row.cells.sizeBytesValue ?? "1")}
          />
        </DocumentsTrailingForm>
      </GovernedTrailingActionSlot>
    );
  }

  const effectiveStatus = String(row.cells.effectiveVerificationValue ?? "");

  return (
    <GovernedTrailingActionSlot>
      <div className="flex flex-col gap-surface-sm">
        {effectiveStatus !== "verified" ? (
          <DocumentsTrailingForm
            action={verifyHrEmployeeDocumentAction}
            submitLabel={copy.trailingVerifyLabel}
            rowId={row.id}
            buttonVariant="secondary"
          />
        ) : null}
        {effectiveStatus !== "rejected" ? (
          <DocumentsTrailingForm
            action={rejectHrEmployeeDocumentAction}
            submitLabel={copy.trailingRejectLabel}
            rowId={row.id}
          >
            <Field>
              <FieldLabel htmlFor={`reject-reason-${row.id}`}>
                {copy.trailingRejectReasonLabel}
              </FieldLabel>
              <Input
                id={`reject-reason-${row.id}`}
                name="rejectionReason"
                defaultValue={String(row.cells.rejectionReasonValue ?? "")}
                required
              />
            </Field>
          </DocumentsTrailingForm>
        ) : null}
      </div>
    </GovernedTrailingActionSlot>
  );
}
