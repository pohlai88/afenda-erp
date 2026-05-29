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
import { hrOvertimeUiCopy } from "../surface/hr-overtime-ui.copy.shared";

export function HrOvertimeSubmitForm({
  employees,
  submitAction,
}: {
  employees: ReadonlyArray<{ id: string; label: string }>;
  submitAction: (formData: FormData) => Promise<ActionResult<{ requestId: string }>>;
}) {
  const copy = hrOvertimeUiCopy.submit;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ requestId: string }> | undefined,
      formData: FormData,
    ) => submitAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="overtime-employeeId">{copy.employeeLabel}</FieldLabel>
          <NativeSelect id="overtime-employeeId" name="employeeId" required defaultValue="">
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
          <FieldLabel htmlFor="overtime-overtimeType">{copy.typeLabel}</FieldLabel>
          <NativeSelect id="overtime-overtimeType" name="overtimeType" defaultValue="regular">
            <option value="regular">Regular</option>
            <option value="weekend">Weekend</option>
            <option value="holiday">Holiday</option>
            <option value="public_holiday">Public holiday</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="overtime-workDate">{copy.workDateLabel}</FieldLabel>
          <Input id="overtime-workDate" name="workDate" type="date" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="overtime-hours">{copy.hoursLabel}</FieldLabel>
          <Input
            id="overtime-hours"
            name="hours"
            type="number"
            min={0.01}
            max={24}
            step={0.25}
            required
          />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="overtime-reason">{copy.reasonLabel}</FieldLabel>
          <Textarea id="overtime-reason" name="reason" rows={2} />
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

function HrOvertimeDecisionForm({
  pendingRequests,
  copy,
  action,
}: {
  pendingRequests: ReadonlyArray<{ id: string; label: string }>;
  copy: {
    title: string;
    description: string;
    requestLabel: string;
    noteLabel: string;
    submitLabel: string;
  };
  action: (formData: FormData) => Promise<ActionResult<{ requestId: string }>>;
}) {
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ requestId: string }> | undefined,
      formData: FormData,
    ) => action(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md">
        <Field>
          <FieldLabel htmlFor={`overtime-${copy.submitLabel}-requestId`}>
            {copy.requestLabel}
          </FieldLabel>
          <NativeSelect
            id={`overtime-${copy.submitLabel}-requestId`}
            name="requestId"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select request
            </option>
            {pendingRequests.map((request) => (
              <option key={request.id} value={request.id}>
                {request.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor={`overtime-${copy.submitLabel}-note`}>
            {copy.noteLabel}
          </FieldLabel>
          <Textarea
            id={`overtime-${copy.submitLabel}-note`}
            name="decisionNote"
            rows={2}
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

export function HrOvertimeApproveForm({
  pendingRequests,
  approveAction,
}: {
  pendingRequests: ReadonlyArray<{ id: string; label: string }>;
  approveAction: (formData: FormData) => Promise<ActionResult<{ requestId: string }>>;
}) {
  return (
    <HrOvertimeDecisionForm
      pendingRequests={pendingRequests}
      copy={hrOvertimeUiCopy.approve}
      action={approveAction}
    />
  );
}

export function HrOvertimeRejectForm({
  pendingRequests,
  rejectAction,
}: {
  pendingRequests: ReadonlyArray<{ id: string; label: string }>;
  rejectAction: (formData: FormData) => Promise<ActionResult<{ requestId: string }>>;
}) {
  return (
    <HrOvertimeDecisionForm
      pendingRequests={pendingRequests}
      copy={hrOvertimeUiCopy.reject}
      action={rejectAction}
    />
  );
}

export function HrOvertimeCancelForm({
  pendingRequests,
  cancelAction,
}: {
  pendingRequests: ReadonlyArray<{ id: string; label: string }>;
  cancelAction: (formData: FormData) => Promise<ActionResult<{ requestId: string }>>;
}) {
  const copy = hrOvertimeUiCopy.cancel;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ requestId: string }> | undefined,
      formData: FormData,
    ) => cancelAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="overtime-cancel-requestId">{copy.requestLabel}</FieldLabel>
          <NativeSelect
            id="overtime-cancel-requestId"
            name="requestId"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select request
            </option>
            {pendingRequests.map((request) => (
              <option key={request.id} value={request.id}>
                {request.label}
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
