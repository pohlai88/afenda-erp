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
import { hrLeaveUiCopy } from "../surface/hr-leave-ui.copy.shared";

export function HrLeaveSubmitForm({
  employees,
  submitAction,
}: {
  employees: ReadonlyArray<{ id: string; label: string }>;
  submitAction: (formData: FormData) => Promise<ActionResult<{ requestId: string }>>;
}) {
  const copy = hrLeaveUiCopy.submit;
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
          <FieldLabel htmlFor="leave-employeeId">{copy.employeeLabel}</FieldLabel>
          <NativeSelect id="leave-employeeId" name="employeeId" required defaultValue="">
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
          <FieldLabel htmlFor="leave-leaveType">{copy.typeLabel}</FieldLabel>
          <NativeSelect id="leave-leaveType" name="leaveType" defaultValue="annual">
            <option value="annual">Annual</option>
            <option value="sick">Sick</option>
            <option value="unpaid">Unpaid</option>
            <option value="compassionate">Compassionate</option>
            <option value="other">Other</option>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="leave-startAt">{copy.startLabel}</FieldLabel>
          <Input id="leave-startAt" name="startAt" type="date" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="leave-endAt">{copy.endLabel}</FieldLabel>
          <Input id="leave-endAt" name="endAt" type="date" required />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="leave-reason">{copy.reasonLabel}</FieldLabel>
          <Textarea id="leave-reason" name="reason" rows={2} />
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

function HrLeaveDecisionForm({
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
          <FieldLabel htmlFor={`leave-${copy.submitLabel}-requestId`}>
            {copy.requestLabel}
          </FieldLabel>
          <NativeSelect
            id={`leave-${copy.submitLabel}-requestId`}
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
          <FieldLabel htmlFor={`leave-${copy.submitLabel}-note`}>
            {copy.noteLabel}
          </FieldLabel>
          <Textarea
            id={`leave-${copy.submitLabel}-note`}
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

export function HrLeaveApproveForm({
  pendingRequests,
  approveAction,
}: {
  pendingRequests: ReadonlyArray<{ id: string; label: string }>;
  approveAction: (formData: FormData) => Promise<ActionResult<{ requestId: string }>>;
}) {
  return (
    <HrLeaveDecisionForm
      pendingRequests={pendingRequests}
      copy={hrLeaveUiCopy.approve}
      action={approveAction}
    />
  );
}

export function HrLeaveRejectForm({
  pendingRequests,
  rejectAction,
}: {
  pendingRequests: ReadonlyArray<{ id: string; label: string }>;
  rejectAction: (formData: FormData) => Promise<ActionResult<{ requestId: string }>>;
}) {
  return (
    <HrLeaveDecisionForm
      pendingRequests={pendingRequests}
      copy={hrLeaveUiCopy.reject}
      action={rejectAction}
    />
  );
}

export function HrLeaveCancelForm({
  pendingRequests,
  cancelAction,
}: {
  pendingRequests: ReadonlyArray<{ id: string; label: string }>;
  cancelAction: (formData: FormData) => Promise<ActionResult<{ requestId: string }>>;
}) {
  const copy = hrLeaveUiCopy.cancel;
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
          <FieldLabel htmlFor="leave-cancel-requestId">{copy.requestLabel}</FieldLabel>
          <NativeSelect
            id="leave-cancel-requestId"
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
