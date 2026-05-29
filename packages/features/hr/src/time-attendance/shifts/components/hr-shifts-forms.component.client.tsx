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
import { hrShiftsUiCopy } from "../surface/hr-shifts-ui.copy.shared";

export function HrShiftCreateTemplateForm({
  createAction,
}: {
  createAction: (formData: FormData) => Promise<ActionResult<{ templateId: string }>>;
}) {
  const copy = hrShiftsUiCopy.createTemplate;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ templateId: string }> | undefined,
      formData: FormData,
    ) => createAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="shift-code">{copy.codeLabel}</FieldLabel>
          <Input id="shift-code" name="code" required maxLength={32} />
        </Field>
        <Field>
          <FieldLabel htmlFor="shift-name">{copy.nameLabel}</FieldLabel>
          <Input id="shift-name" name="name" required maxLength={120} />
        </Field>
        <Field>
          <FieldLabel htmlFor="shift-startTime">{copy.startLabel}</FieldLabel>
          <Input
            id="shift-startTime"
            name="startTime"
            type="time"
            required
            defaultValue="09:00"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="shift-endTime">{copy.endLabel}</FieldLabel>
          <Input
            id="shift-endTime"
            name="endTime"
            type="time"
            required
            defaultValue="17:00"
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

export function HrShiftArchiveTemplateForm({
  templates,
  archiveAction,
}: {
  templates: ReadonlyArray<{ id: string; label: string }>;
  archiveAction: (formData: FormData) => Promise<ActionResult<{ templateId: string }>>;
}) {
  const copy = hrShiftsUiCopy.archiveTemplate;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ templateId: string }> | undefined,
      formData: FormData,
    ) => archiveAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="shift-archive-templateId">{copy.templateLabel}</FieldLabel>
          <NativeSelect
            id="shift-archive-templateId"
            name="templateId"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select template
            </option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
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

export function HrShiftScheduleForm({
  employees,
  templates,
  scheduleAction,
}: {
  employees: ReadonlyArray<{ id: string; label: string }>;
  templates: ReadonlyArray<{ id: string; label: string }>;
  scheduleAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ assignmentId: string }>>;
}) {
  const copy = hrShiftsUiCopy.schedule;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ assignmentId: string }> | undefined,
      formData: FormData,
    ) => scheduleAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="shift-schedule-employeeId">{copy.employeeLabel}</FieldLabel>
          <NativeSelect
            id="shift-schedule-employeeId"
            name="employeeId"
            required
            defaultValue=""
          >
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
          <FieldLabel htmlFor="shift-schedule-templateId">{copy.templateLabel}</FieldLabel>
          <NativeSelect
            id="shift-schedule-templateId"
            name="templateId"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select template
            </option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="shift-schedule-shiftDate">{copy.dateLabel}</FieldLabel>
          <Input id="shift-schedule-shiftDate" name="shiftDate" type="date" required />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="shift-schedule-notes">{copy.notesLabel}</FieldLabel>
          <Textarea id="shift-schedule-notes" name="notes" rows={2} />
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

function HrShiftAssignmentActionForm({
  assignments,
  copy,
  action,
}: {
  assignments: ReadonlyArray<{ id: string; label: string }>;
  copy: {
    assignmentLabel: string;
    submitLabel: string;
  };
  action: (formData: FormData) => Promise<ActionResult<{ assignmentId: string }>>;
}) {
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ assignmentId: string }> | undefined,
      formData: FormData,
    ) => action(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`shift-${copy.submitLabel}-assignmentId`}>
            {copy.assignmentLabel}
          </FieldLabel>
          <NativeSelect
            id={`shift-${copy.submitLabel}-assignmentId`}
            name="assignmentId"
            required
            defaultValue=""
          >
            <option value="" disabled>
              Select assignment
            </option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.label}
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

export function HrShiftPublishForm({
  scheduledAssignments,
  publishAction,
}: {
  scheduledAssignments: ReadonlyArray<{ id: string; label: string }>;
  publishAction: (formData: FormData) => Promise<ActionResult<{ assignmentId: string }>>;
}) {
  return (
    <HrShiftAssignmentActionForm
      assignments={scheduledAssignments}
      copy={hrShiftsUiCopy.publish}
      action={publishAction}
    />
  );
}

export function HrShiftCancelForm({
  cancellableAssignments,
  cancelAction,
}: {
  cancellableAssignments: ReadonlyArray<{ id: string; label: string }>;
  cancelAction: (formData: FormData) => Promise<ActionResult<{ assignmentId: string }>>;
}) {
  return (
    <HrShiftAssignmentActionForm
      assignments={cancellableAssignments}
      copy={hrShiftsUiCopy.cancel}
      action={cancelAction}
    />
  );
}
