"use client";

import { useActionState } from "react";

import { type ActionResult } from "@afenda/governed-surface/schemas";
import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Field, FieldGroup, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import {
  registerHrEmployeeDocumentAction,
  recordHrDocumentAcknowledgmentAction,
  upsertHrDocumentRequirementAction,
  upsertHrDocumentRetentionPolicyAction,
} from "../actions/hr.workforce.documents.actions.server";
import { hrDocumentsUiCopy } from "../surface/hr.workforce.documents-ui.copy.shared";

function DocumentsFormShell({
  action,
  children,
  submitLabel,
}: {
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  children: React.ReactNode;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-surface-md">
      <FieldGroup className="grid gap-surface-md @md/field-group:grid-cols-2">
        {children}
        <Field className="@md/field-group:col-span-2">
          <Button type="submit" size="sm" disabled={pending}>
            {submitLabel}
          </Button>
        </Field>
      </FieldGroup>
      <ActionFormErrors result={state} />
    </form>
  );
}

export function HrDocumentsRegisterForm({
  employeeOptions,
}: {
  employeeOptions: readonly { value: string; label: string }[];
}) {
  const copy = hrDocumentsUiCopy.repository;

  return (
    <DocumentsFormShell
      action={registerHrEmployeeDocumentAction}
      submitLabel={copy.formSubmitLabel}
    >
      <Field>
        <FieldLabel htmlFor="documents-register-employee">
          {copy.formFieldEmployee}
        </FieldLabel>
        <select
          id="documents-register-employee"
          name="employeeId"
          className="w-full rounded-control border border-input bg-background px-3 py-2 type-control"
          required
          defaultValue=""
        >
          <option value="" disabled>
            {copy.formFieldEmployeePlaceholder}
          </option>
          {employeeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-register-type">
          {copy.formFieldType}
        </FieldLabel>
        <Input id="documents-register-type" name="documentType" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-register-title">
          {copy.formFieldTitle}
        </FieldLabel>
        <Input id="documents-register-title" name="title" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-register-classification">
          {copy.formFieldClassification}
        </FieldLabel>
        <select
          id="documents-register-classification"
          name="classification"
          className="w-full rounded-control border border-input bg-background px-3 py-2 type-control"
          defaultValue="internal"
        >
          <option value="internal">Internal</option>
          <option value="confidential">Confidential</option>
          <option value="restricted">Restricted</option>
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-register-blob">
          {copy.formFieldBlobUrl}
        </FieldLabel>
        <Input id="documents-register-blob" name="blobUrl" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-register-mime">
          {copy.formFieldMimeType}
        </FieldLabel>
        <Input
          id="documents-register-mime"
          name="mimeType"
          defaultValue="application/pdf"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-register-size">
          {copy.formFieldSizeBytes}
        </FieldLabel>
        <Input
          id="documents-register-size"
          name="sizeBytes"
          type="number"
          defaultValue="1024"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-register-effective-from">
          {copy.formFieldEffectiveFrom}
        </FieldLabel>
        <Input
          id="documents-register-effective-from"
          name="effectiveFrom"
          type="datetime-local"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-register-effective-to">
          {copy.formFieldEffectiveTo}
        </FieldLabel>
        <Input
          id="documents-register-effective-to"
          name="effectiveTo"
          type="datetime-local"
        />
      </Field>
    </DocumentsFormShell>
  );
}

export function HrDocumentsRequirementUpsertForm() {
  const copy = hrDocumentsUiCopy.requirements;

  return (
    <DocumentsFormShell
      action={upsertHrDocumentRequirementAction}
      submitLabel={copy.formSubmitLabel}
    >
      <Field>
        <FieldLabel htmlFor="documents-req-type">{copy.colType}</FieldLabel>
        <Input id="documents-req-type" name="documentType" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-req-title">{copy.colTitle}</FieldLabel>
        <Input id="documents-req-title" name="title" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-req-status">{copy.colStatus}</FieldLabel>
        <select
          id="documents-req-status"
          name="requiredForStatus"
          className="w-full rounded-control border border-input bg-background px-3 py-2 type-control"
          defaultValue="active"
        >
          <option value="onboarding">Onboarding</option>
          <option value="active">Active</option>
          <option value="probation">Probation</option>
          <option value="confirmed">Confirmed</option>
          <option value="suspended">Suspended</option>
          <option value="notice_period">Notice period</option>
          <option value="offboarding">Offboarding</option>
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-req-grace">{copy.colGraceDays}</FieldLabel>
        <Input
          id="documents-req-grace"
          name="graceDaysBeforeDue"
          type="number"
          defaultValue="0"
        />
      </Field>
    </DocumentsFormShell>
  );
}

export function HrDocumentsRetentionPolicyForm() {
  const copy = hrDocumentsUiCopy.retention;

  return (
    <DocumentsFormShell
      action={upsertHrDocumentRetentionPolicyAction}
      submitLabel={copy.formSubmitLabel}
    >
      <Field>
        <FieldLabel htmlFor="documents-retention-type">{copy.colType}</FieldLabel>
        <Input id="documents-retention-type" name="documentType" />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-retention-group">{copy.colGroup}</FieldLabel>
        <Input id="documents-retention-group" name="documentGroup" />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-retention-days">
          {copy.colRetentionDays}
        </FieldLabel>
        <Input
          id="documents-retention-days"
          name="retentionDays"
          type="number"
          defaultValue="365"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-retention-archive">
          {copy.colArchiveOnSeparation}
        </FieldLabel>
        <select
          id="documents-retention-archive"
          name="archiveOnSeparation"
          className="w-full rounded-control border border-input bg-background px-3 py-2 type-control"
          defaultValue="true"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </Field>
    </DocumentsFormShell>
  );
}

export function HrDocumentsAcknowledgmentForm({
  employeeOptions,
}: {
  employeeOptions: readonly { value: string; label: string }[];
}) {
  const copy = hrDocumentsUiCopy.acknowledgments;

  return (
    <DocumentsFormShell
      action={recordHrDocumentAcknowledgmentAction}
      submitLabel={copy.formSubmitLabel}
    >
      <Field>
        <FieldLabel htmlFor="documents-ack-employee">
          {copy.formFieldEmployee}
        </FieldLabel>
        <select
          id="documents-ack-employee"
          name="employeeId"
          className="w-full rounded-control border border-input bg-background px-3 py-2 type-control"
          required
          defaultValue=""
        >
          <option value="" disabled>
            {copy.formFieldEmployeePlaceholder}
          </option>
          {employeeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-ack-policy">
          {copy.formFieldPolicyKey}
        </FieldLabel>
        <Input id="documents-ack-policy" name="policyKey" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-ack-version">
          {copy.formFieldPolicyVersion}
        </FieldLabel>
        <Input id="documents-ack-version" name="policyVersion" required />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-ack-method">
          {copy.formFieldMethod}
        </FieldLabel>
        <Input
          id="documents-ack-method"
          name="acknowledgmentMethod"
          defaultValue="hr_workbench"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="documents-ack-document">
          {copy.formFieldLinkedDocument}
        </FieldLabel>
        <Input id="documents-ack-document" name="employeeDocumentId" />
      </Field>
    </DocumentsFormShell>
  );
}
