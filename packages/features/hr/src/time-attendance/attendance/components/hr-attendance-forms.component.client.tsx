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
import { hrAttendanceUiCopy } from "../surface/hr-attendance-ui.copy.shared";

function formatDateTimeLocalValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function HrAttendanceRecordPunchForm({
  employees,
  recordAction,
}: {
  employees: ReadonlyArray<{ id: string; label: string }>;
  recordAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ recordId: string; created: boolean }>>;
}) {
  const copy = hrAttendanceUiCopy.record;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ recordId: string; created: boolean }> | undefined,
      formData: FormData,
    ) => recordAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="att-employeeId">{copy.employeeLabel}</FieldLabel>
          <NativeSelect id="att-employeeId" name="employeeId" required defaultValue="">
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
          <FieldLabel htmlFor="att-punchType">{copy.typeLabel}</FieldLabel>
          <NativeSelect id="att-punchType" name="punchType" defaultValue="clock_in">
            <option value="clock_in">Clock in</option>
            <option value="clock_out">Clock out</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="att-punchedAt">{copy.punchedAtLabel}</FieldLabel>
          <Input
            id="att-punchedAt"
            name="punchedAt"
            type="datetime-local"
            defaultValue={formatDateTimeLocalValue(new Date())}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="att-idempotencyKey">{copy.idempotencyLabel}</FieldLabel>
          <Input id="att-idempotencyKey" name="idempotencyKey" maxLength={128} />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="att-notes">{copy.notesLabel}</FieldLabel>
          <Textarea id="att-notes" name="notes" rows={2} />
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

export function HrAttendanceVoidPunchForm({
  activeRecords,
  voidAction,
}: {
  activeRecords: ReadonlyArray<{ id: string; label: string }>;
  voidAction: (formData: FormData) => Promise<ActionResult<{ recordId: string }>>;
}) {
  const copy = hrAttendanceUiCopy.void;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ recordId: string }> | undefined,
      formData: FormData,
    ) => voidAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="att-void-recordId">{copy.recordLabel}</FieldLabel>
          <NativeSelect id="att-void-recordId" name="recordId" required defaultValue="">
            <option value="" disabled>
              Select punch
            </option>
            {activeRecords.map((record) => (
              <option key={record.id} value={record.id}>
                {record.label}
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
