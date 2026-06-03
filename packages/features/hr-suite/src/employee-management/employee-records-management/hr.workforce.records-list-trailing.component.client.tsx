"use client";

import { useActionState } from "react";

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { ActionFormErrors } from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { Field, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import {
  archiveHrEmployeeRecordAction,
  recordHrEmployeeAssignmentAction,
  rehireHrEmployeeRecordAction,
  updateHrEmployeeRecordAction,
} from "./hr.workforce.records.actions.server";
import { hrRecordsDirectorySurfaceKey } from "./hr.workforce.records-directory-list.surface";
import { hrRecordsSeparatedSurfaceKey } from "./hr.workforce.records-separated-list.surface";
import { hrRecordsUiCopy } from "./hr.workforce.records-ui.copy.shared";

function RecordsTrailingActionForm({
  action,
  submitLabel,
  children,
  hiddenFields,
}: {
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  submitLabel: string;
  children?: React.ReactNode;
  hiddenFields?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-surface-sm">
      {hiddenFields}
      {children}
      <Button
        type="submit"
        size="sm"
        variant="secondary"
        className="w-fit"
        disabled={pending}
      >
        {submitLabel}
      </Button>
      <ActionFormErrors result={state} />
    </form>
  );
}

export function HrRecordsDirectoryTrailingCell(
  props: GovernedListTrailingCellProps,
) {
  if (
    !isListSurfaceTrailingActionRenderable(props.row.trailingAction) ||
    props.context?.surfaceKey !== hrRecordsDirectorySurfaceKey
  ) {
    return null;
  }

  const copy = hrRecordsUiCopy.trailing;
  const employeeId = String(props.row.cells.employeeIdValue ?? props.row.id);

  return (
    <GovernedTrailingActionSlot>
      <div className="flex flex-col gap-surface-md">
        <RecordsTrailingActionForm
          action={updateHrEmployeeRecordAction}
          submitLabel={copy.updateLabel}
          hiddenFields={
            <input type="hidden" name="employeeId" value={employeeId} />
          }
        >
          <Field>
            <FieldLabel htmlFor={`records-email-${props.row.id}`}>
              {copy.emailLabel}
            </FieldLabel>
            <Input
              id={`records-email-${props.row.id}`}
              name="email"
              type="email"
              defaultValue={String(props.row.cells.emailValue ?? "")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`records-reason-update-${props.row.id}`}>
              {copy.reasonLabel}
            </FieldLabel>
            <Input id={`records-reason-update-${props.row.id}`} name="reason" />
          </Field>
        </RecordsTrailingActionForm>
        <RecordsTrailingActionForm
          action={recordHrEmployeeAssignmentAction}
          submitLabel={copy.assignmentLabel}
          hiddenFields={
            <input type="hidden" name="employeeId" value={employeeId} />
          }
        >
          <Field>
            <FieldLabel htmlFor={`records-dept-${props.row.id}`}>
              {copy.departmentIdLabel}
            </FieldLabel>
            <Input id={`records-dept-${props.row.id}`} name="currentDepartmentId" />
          </Field>
          <Field>
            <FieldLabel htmlFor={`records-pos-${props.row.id}`}>
              {copy.positionIdLabel}
            </FieldLabel>
            <Input id={`records-pos-${props.row.id}`} name="currentPositionId" />
          </Field>
          <Field>
            <FieldLabel htmlFor={`records-effective-${props.row.id}`}>
              {copy.effectiveDateLabel}
            </FieldLabel>
            <Input
              id={`records-effective-${props.row.id}`}
              name="assignmentEffectiveFrom"
              type="date"
            />
          </Field>
        </RecordsTrailingActionForm>
        <RecordsTrailingActionForm
          action={archiveHrEmployeeRecordAction}
          submitLabel={copy.archiveLabel}
          hiddenFields={
            <>
              <input type="hidden" name="employeeId" value={employeeId} />
            </>
          }
        >
          <Field>
            <FieldLabel htmlFor={`records-reason-archive-${props.row.id}`}>
              {copy.reasonLabel}
            </FieldLabel>
            <Input
              id={`records-reason-archive-${props.row.id}`}
              name="reason"
              required
            />
          </Field>
        </RecordsTrailingActionForm>
      </div>
    </GovernedTrailingActionSlot>
  );
}

export function HrRecordsSeparatedTrailingCell(
  props: GovernedListTrailingCellProps,
) {
  if (
    !isListSurfaceTrailingActionRenderable(props.row.trailingAction) ||
    props.context?.surfaceKey !== hrRecordsSeparatedSurfaceKey
  ) {
    return null;
  }

  const copy = hrRecordsUiCopy.separated;
  const priorEmployeeId = String(props.row.cells.employeeIdValue ?? props.row.id);

  return (
    <GovernedTrailingActionSlot>
      <RecordsTrailingActionForm
        action={rehireHrEmployeeRecordAction}
        submitLabel={copy.trailingRehireLabel}
        hiddenFields={
          <input type="hidden" name="priorEmployeeId" value={priorEmployeeId} />
        }
      >
        <Field>
          <FieldLabel htmlFor={`records-rehire-number-${props.row.id}`}>
            {hrRecordsUiCopy.trailing.employeeNumberLabel}
          </FieldLabel>
          <Input
            id={`records-rehire-number-${props.row.id}`}
            name="employeeNumber"
            placeholder={String(props.row.cells.employeeNumberValue ?? "")}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`records-rehire-name-${props.row.id}`}>
            {hrRecordsUiCopy.trailing.legalNameLabel}
          </FieldLabel>
          <Input
            id={`records-rehire-name-${props.row.id}`}
            name="legalName"
            defaultValue={String(props.row.cells.legalNameValue ?? "")}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`records-rehire-reason-${props.row.id}`}>
            {hrRecordsUiCopy.trailing.reasonLabel}
          </FieldLabel>
          <Input id={`records-rehire-reason-${props.row.id}`} name="reason" />
        </Field>
      </RecordsTrailingActionForm>
    </GovernedTrailingActionSlot>
  );
}
