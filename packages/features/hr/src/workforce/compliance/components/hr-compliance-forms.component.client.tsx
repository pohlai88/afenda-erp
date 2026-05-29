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
  Textarea,
} from "@afenda/ui";
import { useActionState } from "react";
import { hrComplianceUiCopy } from "../surface/hr-compliance-ui.copy.shared";

export function HrComplianceObligationUpsertForm({
  upsertAction,
}: {
  upsertAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ obligationId: string }>>;
}) {
  const copy = hrComplianceUiCopy.obligations.upsert;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ obligationId: string }> | undefined,
      formData: FormData,
    ) => upsertAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="cmp-code">{copy.codeLabel}</FieldLabel>
          <Input id="cmp-code" name="code" required maxLength={64} />
        </Field>
        <Field>
          <FieldLabel htmlFor="cmp-title">{copy.titleLabel}</FieldLabel>
          <Input id="cmp-title" name="title" required maxLength={500} />
        </Field>
        <Field>
          <FieldLabel htmlFor="cmp-area">{copy.areaLabel}</FieldLabel>
          <Input id="cmp-area" name="complianceArea" required maxLength={200} />
        </Field>
        <Field>
          <FieldLabel htmlFor="cmp-kind">{copy.kindLabel}</FieldLabel>
          <Input id="cmp-kind" name="requirementKind" required maxLength={200} />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="cmp-description">{copy.descriptionLabel}</FieldLabel>
          <Textarea id="cmp-description" name="description" rows={2} />
        </Field>
        <Field>
          <FieldLabel htmlFor="cmp-dueDate">{copy.dueDateLabel}</FieldLabel>
          <Input id="cmp-dueDate" name="dueDate" type="date" />
        </Field>
      </FieldGroup>
      <div className="mt-surface-md flex flex-col gap-surface-sm">
        <ActionFormErrors result={state} />
        <Button type="submit" disabled={pending}>
          {copy.submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function HrComplianceObligationArchiveForm({
  obligations,
  archiveAction,
}: {
  obligations: ReadonlyArray<{ id: string; label: string }>;
  archiveAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ obligationId: string }>>;
}) {
  const copy = hrComplianceUiCopy.obligations.archive;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ obligationId: string }> | undefined,
      formData: FormData,
    ) => archiveAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="cmp-archive-obligationId">
            {copy.obligationLabel}
          </FieldLabel>
          <NativeSelect
            id="cmp-archive-obligationId"
            name="obligationId"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select obligation
            </option>
            {obligations.map((obligation) => (
              <option key={obligation.id} value={obligation.id}>
                {obligation.label}
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

export function HrComplianceExceptionCreateForm({
  employees,
  createAction,
}: {
  employees: ReadonlyArray<{ id: string; label: string }>;
  createAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ exceptionId: string }>>;
}) {
  const copy = hrComplianceUiCopy.exceptions.create;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ exceptionId: string }> | undefined,
      formData: FormData,
    ) => createAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="cmp-exc-title">{copy.titleLabel}</FieldLabel>
          <Input id="cmp-exc-title" name="title" required maxLength={500} />
        </Field>
        <Field>
          <FieldLabel htmlFor="cmp-exc-area">{copy.areaLabel}</FieldLabel>
          <Input id="cmp-exc-area" name="complianceArea" required maxLength={200} />
        </Field>
        <Field>
          <FieldLabel htmlFor="cmp-exc-type">{copy.typeLabel}</FieldLabel>
          <Input id="cmp-exc-type" name="itemType" required maxLength={200} />
        </Field>
        <Field>
          <FieldLabel htmlFor="cmp-exc-severity">{copy.severityLabel}</FieldLabel>
          <NativeSelect id="cmp-exc-severity" name="severity" defaultValue="medium">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="cmp-exc-employeeId">{copy.employeeLabel}</FieldLabel>
          <NativeSelect id="cmp-exc-employeeId" name="employeeId" defaultValue="">
            <option value="">None</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="cmp-exc-correctiveDescription">
            {copy.correctiveDescriptionLabel}
          </FieldLabel>
          <Textarea
            id="cmp-exc-correctiveDescription"
            name="correctiveActionDescription"
            rows={2}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="cmp-exc-correctiveDueDate">
            {copy.correctiveDueDateLabel}
          </FieldLabel>
          <Input
            id="cmp-exc-correctiveDueDate"
            name="correctiveActionDueDate"
            type="date"
          />
        </Field>
      </FieldGroup>
      <div className="mt-surface-md flex flex-col gap-surface-sm">
        <ActionFormErrors result={state} />
        <Button type="submit" disabled={pending}>
          {copy.submitLabel}
        </Button>
      </div>
    </form>
  );
}

function HrComplianceExceptionPicker({
  id,
  name,
  label,
  exceptions,
}: {
  id: string;
  name: string;
  label: string;
  exceptions: ReadonlyArray<{ id: string; label: string }>;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <NativeSelect id={id} name={name} required defaultValue="">
        <option value="" disabled>
          Select exception
        </option>
        {exceptions.map((exception) => (
          <option key={exception.id} value={exception.id}>
            {exception.label}
          </option>
        ))}
      </NativeSelect>
    </Field>
  );
}

export function HrComplianceExceptionAssignCorrectiveForm({
  openExceptions,
  assignAction,
}: {
  openExceptions: ReadonlyArray<{ id: string; label: string }>;
  assignAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ exceptionId: string }>>;
}) {
  const copy = hrComplianceUiCopy.exceptions.assignCorrective;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ exceptionId: string }> | undefined,
      formData: FormData,
    ) => assignAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <HrComplianceExceptionPicker
          id="cmp-assign-exceptionId"
          name="exceptionId"
          label={copy.exceptionLabel}
          exceptions={openExceptions}
        />
        <Field>
          <FieldLabel htmlFor="cmp-assign-dueDate">{copy.dueDateLabel}</FieldLabel>
          <Input
            id="cmp-assign-dueDate"
            name="correctiveActionDueDate"
            type="date"
            required
          />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="cmp-assign-description">
            {copy.descriptionLabel}
          </FieldLabel>
          <Textarea
            id="cmp-assign-description"
            name="correctiveActionDescription"
            rows={2}
            required
          />
        </Field>
      </FieldGroup>
      <div className="mt-surface-md flex flex-col gap-surface-sm">
        <ActionFormErrors result={state} />
        <Button type="submit" disabled={pending}>
          {copy.submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function HrComplianceExceptionCorrectiveProgressForm({
  openExceptions,
  progressAction,
}: {
  openExceptions: ReadonlyArray<{ id: string; label: string }>;
  progressAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ exceptionId: string }>>;
}) {
  const copy = hrComplianceUiCopy.exceptions.correctiveProgress;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ exceptionId: string }> | undefined,
      formData: FormData,
    ) => progressAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md">
        <HrComplianceExceptionPicker
          id="cmp-progress-exceptionId"
          name="exceptionId"
          label={copy.exceptionLabel}
          exceptions={openExceptions}
        />
        <Field>
          <FieldLabel htmlFor="cmp-progress-note">{copy.progressNoteLabel}</FieldLabel>
          <Textarea id="cmp-progress-note" name="progressNote" rows={2} required />
        </Field>
      </FieldGroup>
      <div className="mt-surface-md flex flex-col gap-surface-sm">
        <ActionFormErrors result={state} />
        <Button type="submit" disabled={pending}>
          {copy.submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function HrComplianceExceptionResolveForm({
  openExceptions,
  resolveAction,
}: {
  openExceptions: ReadonlyArray<{ id: string; label: string }>;
  resolveAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ exceptionId: string }>>;
}) {
  const copy = hrComplianceUiCopy.exceptions.resolve;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ exceptionId: string }> | undefined,
      formData: FormData,
    ) => resolveAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md">
        <HrComplianceExceptionPicker
          id="cmp-resolve-exceptionId"
          name="exceptionId"
          label={copy.exceptionLabel}
          exceptions={openExceptions}
        />
        <Field>
          <FieldLabel htmlFor="cmp-resolve-note">{copy.noteLabel}</FieldLabel>
          <Textarea id="cmp-resolve-note" name="resolutionNote" rows={2} />
        </Field>
      </FieldGroup>
      <div className="mt-surface-md flex flex-col gap-surface-sm">
        <ActionFormErrors result={state} />
        <Button type="submit" disabled={pending}>
          {copy.submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function HrComplianceExceptionWaiveForm({
  openExceptions,
  waiveAction,
}: {
  openExceptions: ReadonlyArray<{ id: string; label: string }>;
  waiveAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ exceptionId: string }>>;
}) {
  const copy = hrComplianceUiCopy.exceptions.waive;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ exceptionId: string }> | undefined,
      formData: FormData,
    ) => waiveAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <HrComplianceExceptionPicker
          id="cmp-waive-exceptionId"
          name="exceptionId"
          label={copy.exceptionLabel}
          exceptions={openExceptions}
        />
        <Field>
          <FieldLabel htmlFor="cmp-waive-approvalReference">
            {copy.approvalReferenceLabel}
          </FieldLabel>
          <Input
            id="cmp-waive-approvalReference"
            name="approvalReference"
            required
            maxLength={500}
          />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="cmp-waive-reason">{copy.waiverReasonLabel}</FieldLabel>
          <Textarea id="cmp-waive-reason" name="waiverReason" rows={2} required />
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
