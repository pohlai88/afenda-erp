"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  NativeSelect,
} from "@afenda/ui";
import { useActionState } from "react";
import { HR_DOCUMENT_TYPES } from "../contracts/hr-document.contract";
import { hrDocumentsUiCopy } from "../surface/hr-documents-ui.copy.shared";

export function HrDocumentRegisterForm({
  employees,
  registerAction,
}: {
  employees: ReadonlyArray<{ id: string; label: string }>;
  registerAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ documentId: string }>>;
}) {
  const copy = hrDocumentsUiCopy.register;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ documentId: string }> | undefined,
      formData: FormData,
    ) => registerAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="employeeId">{copy.employeeLabel}</FieldLabel>
          <NativeSelect id="employeeId" name="employeeId" required defaultValue="">
            <option value="" disabled>
              Select employee
            </option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="documentType">{copy.documentTypeLabel}</FieldLabel>
          <NativeSelect id="documentType" name="documentType" required defaultValue="other">
            {HR_DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="title">{copy.titleLabel}</FieldLabel>
          <Input id="title" name="title" required maxLength={512} />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="blobUrl">{copy.blobUrlLabel}</FieldLabel>
          <Input id="blobUrl" name="blobUrl" type="url" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="mimeType">{copy.mimeTypeLabel}</FieldLabel>
          <Input
            id="mimeType"
            name="mimeType"
            required
            defaultValue="application/pdf"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="sizeBytes">{copy.sizeBytesLabel}</FieldLabel>
          <Input id="sizeBytes" name="sizeBytes" type="number" required min={1} />
        </Field>
        <Field>
          <FieldLabel htmlFor="classification">{copy.classificationLabel}</FieldLabel>
          <NativeSelect id="classification" name="classification" defaultValue="internal">
            <option value="internal">internal</option>
            <option value="confidential">confidential</option>
            <option value="restricted">restricted</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="effectiveFrom">{copy.effectiveFromLabel}</FieldLabel>
          <Input id="effectiveFrom" name="effectiveFrom" type="date" />
        </Field>
        <Field>
          <FieldLabel htmlFor="effectiveTo">{copy.effectiveToLabel}</FieldLabel>
          <Input id="effectiveTo" name="effectiveTo" type="date" />
        </Field>
        <div className="@md:col-span-2 flex flex-col gap-surface-sm">
          <Button type="submit" disabled={pending}>
            {pending ? copy.pendingLabel : copy.submitLabel}
          </Button>
          {state?.ok ? (
            <p className="type-caption text-muted">{copy.successLabel}</p>
          ) : null}
          <ActionFormErrors result={state} />
        </div>
      </FieldGroup>
    </form>
  );
}
