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
import { HR_EMPLOYMENT_STATUSES } from "../../employees/contracts/hr-employee.contract";
import {
  HR_MOVEMENT_KINDS,
  HR_PROBATION_OUTCOMES,
} from "../contracts/hr-lifecycle.contract";
import { hrLifecycleUiCopy } from "../surface/hr-lifecycle-ui.copy.shared";

function formatDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function HrLifecycleStatusChangeForm({
  employees,
  changeStatusAction,
}: {
  employees: ReadonlyArray<{ id: string; label: string }>;
  changeStatusAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ eventId: string }>>;
}) {
  const copy = hrLifecycleUiCopy.statusChange;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ eventId: string }> | undefined,
      formData: FormData,
    ) => changeStatusAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="lifecycle-employeeId">{copy.employeeLabel}</FieldLabel>
          <NativeSelect id="lifecycle-employeeId" name="employeeId" required defaultValue="">
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
          <FieldLabel htmlFor="lifecycle-toStatus">{copy.toStatusLabel}</FieldLabel>
          <NativeSelect id="lifecycle-toStatus" name="toStatus" required defaultValue="active">
            {HR_EMPLOYMENT_STATUSES.filter((status) => status !== "archived").map(
              (status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ),
            )}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="lifecycle-effectiveDate">
            {copy.effectiveDateLabel}
          </FieldLabel>
          <Input
            id="lifecycle-effectiveDate"
            name="effectiveDate"
            type="date"
            defaultValue={formatDateInputValue(new Date())}
          />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="lifecycle-reason">{copy.reasonLabel}</FieldLabel>
          <Textarea id="lifecycle-reason" name="reason" rows={2} maxLength={2000} />
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

export function HrLifecycleProbationOutcomeForm({
  employees,
  recordOutcomeAction,
}: {
  employees: ReadonlyArray<{ id: string; label: string }>;
  recordOutcomeAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ eventId: string }>>;
}) {
  const copy = hrLifecycleUiCopy.probation;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ eventId: string }> | undefined,
      formData: FormData,
    ) => recordOutcomeAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="probation-employeeId">{copy.employeeLabel}</FieldLabel>
          <NativeSelect id="probation-employeeId" name="employeeId" required defaultValue="">
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
          <FieldLabel htmlFor="probation-outcome">{copy.outcomeLabel}</FieldLabel>
          <NativeSelect id="probation-outcome" name="outcome" required defaultValue="confirmed">
            {HR_PROBATION_OUTCOMES.map((outcome) => (
              <option key={outcome} value={outcome}>
                {outcome}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="probation-effectiveDate">
            {copy.effectiveDateLabel}
          </FieldLabel>
          <Input
            id="probation-effectiveDate"
            name="effectiveDate"
            type="date"
            defaultValue={formatDateInputValue(new Date())}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="probation-probationEndDate">
            {copy.probationEndDateLabel}
          </FieldLabel>
          <Input id="probation-probationEndDate" name="probationEndDate" type="date" />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="probation-reason">{copy.reasonLabel}</FieldLabel>
          <Textarea id="probation-reason" name="reason" rows={2} maxLength={2000} />
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

export function HrLifecycleMovementForm({
  formOptions,
  recordMovementAction,
}: {
  formOptions: {
    employees: ReadonlyArray<{ id: string; label: string }>;
    departments: ReadonlyArray<{ id: string; label: string }>;
    positions: ReadonlyArray<{ id: string; label: string }>;
    managers: ReadonlyArray<{ id: string; label: string }>;
  };
  recordMovementAction: (
    formData: FormData,
  ) => Promise<ActionResult<{ eventId: string }>>;
}) {
  const copy = hrLifecycleUiCopy.movement;
  const [state, formAction, pending] = useActionState(
    async (
      _previous: ActionResult<{ eventId: string }> | undefined,
      formData: FormData,
    ) => recordMovementAction(formData),
    undefined,
  );

  return (
    <form action={formAction} className="@container">
      <FieldGroup className="grid gap-surface-md @md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="movement-employeeId">{copy.employeeLabel}</FieldLabel>
          <NativeSelect id="movement-employeeId" name="employeeId" required defaultValue="">
            <option value="" disabled>
              Select employee
            </option>
            {formOptions.employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="movement-kind">{copy.movementKindLabel}</FieldLabel>
          <NativeSelect id="movement-kind" name="movementKind" required defaultValue="transfer">
            {HR_MOVEMENT_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="movement-department">{copy.departmentLabel}</FieldLabel>
          <NativeSelect id="movement-department" name="currentDepartmentId" defaultValue="">
            <option value="">No change</option>
            {formOptions.departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="movement-position">{copy.positionLabel}</FieldLabel>
          <NativeSelect id="movement-position" name="currentPositionId" defaultValue="">
            <option value="">No change</option>
            {formOptions.positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="movement-manager">{copy.managerLabel}</FieldLabel>
          <NativeSelect id="movement-manager" name="managerEmployeeId" defaultValue="">
            <option value="">No change</option>
            {formOptions.managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="movement-reason">{copy.reasonLabel}</FieldLabel>
          <Textarea id="movement-reason" name="reason" rows={2} maxLength={2000} />
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
