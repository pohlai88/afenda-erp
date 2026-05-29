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
import { hrOffboardingUiCopy } from "../surface/hr-offboarding-ui.copy.shared";

function formatDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function HrOffboardingStartForm({
  employees,
  startAction,
}: {
  employees: ReadonlyArray<{ id: string; label: string }>;
  startAction: (formData: FormData) => Promise<ActionResult<{ caseId: string }>>;
}) {
  const copy = hrOffboardingUiCopy.start;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ caseId: string }> | undefined,
      formData: FormData,
    ) => startAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="offboard-employeeId">{copy.employeeLabel}</FieldLabel>
          <NativeSelect id="offboard-employeeId" name="employeeId" required defaultValue="">
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
          <FieldLabel htmlFor="offboard-lastWorkingDate">
            {copy.lastWorkingDateLabel}
          </FieldLabel>
          <Input
            id="offboard-lastWorkingDate"
            name="lastWorkingDate"
            type="date"
            defaultValue={formatDateInputValue(new Date())}
          />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="offboard-reason">{copy.reasonLabel}</FieldLabel>
          <Textarea id="offboard-reason" name="reason" rows={2} maxLength={2000} />
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

export function HrOffboardingClearanceForm({
  items,
  completeAction,
}: {
  items: ReadonlyArray<{ id: string; label: string }>;
  completeAction: (formData: FormData) => Promise<ActionResult<{ itemId: string }>>;
}) {
  const copy = hrOffboardingUiCopy.clearance;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ itemId: string }> | undefined,
      formData: FormData,
    ) => completeAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="offboard-clearance-itemId">{copy.itemLabel}</FieldLabel>
          <NativeSelect id="offboard-clearance-itemId" name="itemId" required defaultValue="">
            <option value="" disabled>
              Select item
            </option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </NativeSelect>
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

export function HrOffboardingCompleteForm({
  inProgressCases,
  completeAction,
}: {
  inProgressCases: ReadonlyArray<{ id: string; label: string }>;
  completeAction: (formData: FormData) => Promise<ActionResult<{ caseId: string }>>;
}) {
  const copy = hrOffboardingUiCopy.complete;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ caseId: string }> | undefined,
      formData: FormData,
    ) => completeAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="offboard-caseId">{copy.caseLabel}</FieldLabel>
          <NativeSelect id="offboard-caseId" name="caseId" required defaultValue="">
            <option value="" disabled>
              Select case
            </option>
            {inProgressCases.map((offboardingCase) => (
              <option key={offboardingCase.id} value={offboardingCase.id}>
                {offboardingCase.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <div className="@md:col-span-2 flex flex-col gap-surface-sm">
          <Button type="submit" disabled={pending || inProgressCases.length === 0}>
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
