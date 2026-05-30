"use client";

import { useActionState } from "react";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Field, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import { recordHrEmployeeMovementAction } from "../actions/hr.workforce.lifecycle.actions.server";
import { HR_LIFECYCLE_MOVEMENT_KINDS } from "../schemas/hr.workforce.lifecycle-movement.schema";
import { hrLifecycleUiCopy } from "../surface/hr.workforce.lifecycle-ui.copy.shared";

const LIFECYCLE_SELECT_CLASS =
  "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full min-w-0 rounded-control border px-3 py-1 text-sm shadow-elevation-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export function HrLifecycleMovementPanel() {
  const copy = hrLifecycleUiCopy.movement;
  const [state, formAction, pending] = useActionState(
    recordHrEmployeeMovementAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-surface-sm">
      <Field>
        <FieldLabel htmlFor="lifecycle-movement-employee">
          {copy.employeeLabel}
        </FieldLabel>
        <Input
          id="lifecycle-movement-employee"
          name="employeeId"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="lifecycle-movement-kind">
          {copy.movementKindLabel}
        </FieldLabel>
        <select
          id="lifecycle-movement-kind"
          name="movementKind"
          className={LIFECYCLE_SELECT_CLASS}
          defaultValue="transfer"
          required
        >
          {HR_LIFECYCLE_MOVEMENT_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor="lifecycle-movement-department">
          {copy.departmentLabel}
        </FieldLabel>
        <Input id="lifecycle-movement-department" name="currentDepartmentId" />
      </Field>
      <Field>
        <FieldLabel htmlFor="lifecycle-movement-position">
          {copy.positionLabel}
        </FieldLabel>
        <Input id="lifecycle-movement-position" name="currentPositionId" />
      </Field>
      <Field>
        <FieldLabel htmlFor="lifecycle-movement-manager">
          {copy.managerLabel}
        </FieldLabel>
        <Input id="lifecycle-movement-manager" name="managerEmployeeId" />
      </Field>
      <Field>
        <FieldLabel htmlFor="lifecycle-movement-effective">
          {copy.effectiveDateLabel}
        </FieldLabel>
        <Input
          id="lifecycle-movement-effective"
          name="effectiveDate"
          type="datetime-local"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="lifecycle-movement-reason">{copy.reasonLabel}</FieldLabel>
        <Input id="lifecycle-movement-reason" name="reason" />
      </Field>
      <Field>
        <FieldLabel htmlFor="lifecycle-movement-approval">
          {copy.approvalRefLabel}
        </FieldLabel>
        <Input id="lifecycle-movement-approval" name="approvalReference" />
      </Field>
      <Button
        type="submit"
        size="sm"
        variant="secondary"
        className="w-fit"
        disabled={pending}
      >
        {copy.submitLabel}
      </Button>
      <ActionFormErrors result={state} />
    </form>
  );
}
