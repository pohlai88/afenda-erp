"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  NativeSelect,
  Textarea,
} from "@afenda/ui";
import { useActionState } from "react";
import { hrDocumentsUiCopy } from "../surface/hr-documents-ui.copy.shared";

function DocumentIdForm({
  copy,
  pendingDocuments,
  action,
}: {
  copy: {
    documentLabel: string;
    submitLabel: string;
  };
  pendingDocuments: ReadonlyArray<{ id: string; label: string }>;
  action: (formData: FormData) => Promise<ActionResult<{ documentId: string }>>;
}) {
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ documentId: string }> | undefined,
      formData: FormData,
    ) => action(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`doc-${copy.submitLabel}-id`}>{copy.documentLabel}</FieldLabel>
          <NativeSelect
            id={`doc-${copy.submitLabel}-id`}
            name="documentId"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select document
            </option>
            {pendingDocuments.map((document) => (
              <option key={document.id} value={document.id}>
                {document.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </FieldGroup>
      <div className="mt-surface-md flex flex-col gap-surface-sm">
        <ActionFormErrors result={state} />
        <Button type="submit" variant="secondary" disabled={pending}>
          {copy.submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function HrDocumentVerifyForm({
  pendingDocuments,
  verifyAction,
}: {
  pendingDocuments: ReadonlyArray<{ id: string; label: string }>;
  verifyAction: (formData: FormData) => Promise<ActionResult<{ documentId: string }>>;
}) {
  const copy = hrDocumentsUiCopy.verify;
  return (
    <DocumentIdForm
      copy={{ documentLabel: copy.documentLabel, submitLabel: copy.submitLabel }}
      pendingDocuments={pendingDocuments}
      action={verifyAction}
    />
  );
}

export function HrDocumentRejectForm({
  pendingDocuments,
  rejectAction,
}: {
  pendingDocuments: ReadonlyArray<{ id: string; label: string }>;
  rejectAction: (formData: FormData) => Promise<ActionResult<{ documentId: string }>>;
}) {
  const copy = hrDocumentsUiCopy.reject;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ documentId: string }> | undefined,
      formData: FormData,
    ) => rejectAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="reject-document-id">{copy.documentLabel}</FieldLabel>
          <NativeSelect
            id="reject-document-id"
            name="documentId"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select document
            </option>
            {pendingDocuments.map((document) => (
              <option key={document.id} value={document.id}>
                {document.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="rejectionReason">{copy.rejectionReasonLabel}</FieldLabel>
          <Textarea
            id="rejectionReason"
            name="rejectionReason"
            required
            maxLength={1000}
            rows={3}
          />
        </Field>
      </FieldGroup>
      <div className="mt-surface-md flex flex-col gap-surface-sm">
        <ActionFormErrors result={state} />
        <Button type="submit" variant="secondary" disabled={pending}>
          {copy.submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function HrDocumentArchiveForm({
  activeDocuments,
  archiveAction,
}: {
  activeDocuments: ReadonlyArray<{ id: string; label: string }>;
  archiveAction: (formData: FormData) => Promise<ActionResult<{ documentId: string }>>;
}) {
  const copy = hrDocumentsUiCopy.archiveForm;
  return (
    <DocumentIdForm
      copy={{ documentLabel: copy.documentLabel, submitLabel: copy.submitLabel }}
      pendingDocuments={activeDocuments}
      action={archiveAction}
    />
  );
}
