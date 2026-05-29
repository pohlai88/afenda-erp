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
import { hrOnboardingUiCopy } from "../surface/hr-onboarding-ui.copy.shared";

export function HrOnboardingStartForm({
  employees,
  startAction,
}: {
  employees: ReadonlyArray<{ id: string; label: string }>;
  startAction: (formData: FormData) => Promise<ActionResult<{ caseId: string }>>;
}) {
  const copy = hrOnboardingUiCopy.start;
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
          <FieldLabel htmlFor="Onboard-employeeId">{copy.employeeLabel}</FieldLabel>
          <NativeSelect id="Onboard-employeeId" name="employeeId" required defaultValue="">
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
          <FieldLabel htmlFor="onboard-targetStatus">
            {copy.targetStatusLabel}
          </FieldLabel>
          <NativeSelect id="onboard-targetStatus" name="targetStatus" defaultValue="active">
            <option value="active">Active</option>
            <option value="probation">Probation</option>
            <option value="confirmed">Confirmed</option>
          </NativeSelect>
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="Onboard-reason">{copy.reasonLabel}</FieldLabel>
          <Textarea id="Onboard-reason" name="reason" rows={2} maxLength={2000} />
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

export function HrOnboardingChecklistForm({
  items,
  completeAction,
}: {
  items: ReadonlyArray<{ id: string; label: string }>;
  completeAction: (formData: FormData) => Promise<ActionResult<{ itemId: string }>>;
}) {
  const copy = hrOnboardingUiCopy.checklist;
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
          <FieldLabel htmlFor="onboard-itemId">{copy.itemLabel}</FieldLabel>
          <NativeSelect id="onboard-itemId" name="itemId" required defaultValue="">
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

export function HrOnboardingCompleteForm({
  inProgressCases,
  completeAction,
}: {
  inProgressCases: ReadonlyArray<{ id: string; label: string }>;
  completeAction: (formData: FormData) => Promise<ActionResult<{ caseId: string }>>;
}) {
  const copy = hrOnboardingUiCopy.complete;
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
          <FieldLabel htmlFor="Onboard-caseId">{copy.caseLabel}</FieldLabel>
          <NativeSelect id="Onboard-caseId" name="caseId" required defaultValue="">
            <option value="" disabled>
              Select case
            </option>
            {inProgressCases.map((onboardingCase) => (
              <option key={onboardingCase.id} value={onboardingCase.id}>
                {onboardingCase.label}
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
