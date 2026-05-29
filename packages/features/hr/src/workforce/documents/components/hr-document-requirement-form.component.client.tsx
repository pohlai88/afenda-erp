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

const EMPLOYMENT_STATUSES = [
  "onboarding",
  "active",
  "probation",
  "confirmed",
  "suspended",
  "notice_period",
  "offboarding",
] as const;

export function HrDocumentRequirementUpsertForm({
  upsertAction,
}: {
  upsertAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ requirementId: string }>>;
}) {
  const copy = hrDocumentsUiCopy.requirements;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ requirementId: string }> | undefined,
      formData: FormData,
    ) => upsertAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="requirement-documentType">
            {copy.documentTypeLabel}
          </FieldLabel>
          <NativeSelect
            id="requirement-documentType"
            name="documentType"
            required
            defaultValue="identity"
          >
            {HR_DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="requirement-requiredForStatus">
            {copy.requiredForStatusLabel}
          </FieldLabel>
          <NativeSelect
            id="requirement-requiredForStatus"
            name="requiredForStatus"
            defaultValue=""
          >
            <option value="">Any status</option>
            {EMPLOYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="requirement-title">{copy.titleLabel}</FieldLabel>
          <Input id="requirement-title" name="title" required maxLength={256} />
        </Field>
        <Field>
          <FieldLabel htmlFor="graceDaysBeforeDue">{copy.graceDaysLabel}</FieldLabel>
          <Input
            id="graceDaysBeforeDue"
            name="graceDaysBeforeDue"
            type="number"
            min={0}
            max={365}
            defaultValue={0}
          />
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

export function HrDocumentRequirementsList({
  requirements,
}: {
  requirements: ReadonlyArray<{
    id: string;
    documentType: string;
    title: string;
    requiredForStatus: string | null;
    graceDaysBeforeDue: number;
  }>;
}) {
  const copy = hrDocumentsUiCopy.requirements;

  if (requirements.length === 0) {
    return <p className="type-muted">{copy.noneConfigured}</p>;
  }

  return (
    <ul className="flex flex-col gap-surface-sm">
      {requirements.map((requirement) => (
        <li key={requirement.id} className="type-body">
          <span className="font-medium">{requirement.title}</span>
          <span className="type-muted">
            {" "}
            — {requirement.documentType}
            {requirement.requiredForStatus
              ? ` (${requirement.requiredForStatus})`
              : ""}
            {requirement.graceDaysBeforeDue > 0
              ? ` · ${requirement.graceDaysBeforeDue}d grace`
              : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
