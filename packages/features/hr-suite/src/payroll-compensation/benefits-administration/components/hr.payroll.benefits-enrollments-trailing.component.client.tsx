"use client";

import {
  GovernedTrailingActionSlot,
  isListSurfaceTrailingActionRenderable,
  type GovernedListTrailingCellProps,
} from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Field, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import {
  addHrBenefitEnrollmentDependentFormAction,
  approveHrBenefitEnrollmentFormAction,
  verifyHrBenefitEnrollmentDependentsFormAction,
} from "../actions/hr.payroll.benefits.actions.server";
import { HRM_BENEFIT_DEPENDENT_RELATIONSHIPS } from "../schemas/hr.payroll.benefits-form.shared";
import { hrBenefitsUiCopy } from "../surface/hr.payroll.benefits-ui.copy.shared";

const enrollmentSelectClass =
  "min-h-field w-full rounded-control border border-transparent bg-input/50 px-field-px py-field-py type-control";

function HiddenEnrollmentId({ row }: { row: GovernedListTrailingCellProps["row"] }) {
  return (
    <input
      type="hidden"
      name="enrollmentId"
      value={String(row.cells.enrollmentIdValue ?? row.id)}
    />
  );
}

export function HrBenefitsEnrollmentsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrBenefitsUiCopy.enrollments;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  const descriptorId = trailingAction.descriptor?.id;

  if (descriptorId === "approve-enrollment") {
    return (
      <GovernedTrailingActionSlot trailingAction={trailingAction}>
        <form action={approveHrBenefitEnrollmentFormAction} className="flex flex-col gap-2">
          <HiddenEnrollmentId row={row} />
          <Button type="submit" variant="default" size="sm">
            {copy.trailingApproveLabel}
          </Button>
        </form>
      </GovernedTrailingActionSlot>
    );
  }

  if (descriptorId === "verify-dependents") {
    return (
      <GovernedTrailingActionSlot trailingAction={trailingAction}>
        <form action={verifyHrBenefitEnrollmentDependentsFormAction} className="flex flex-col gap-2">
          <HiddenEnrollmentId row={row} />
          <Button type="submit" variant="outline" size="sm">
            {copy.trailingVerifyDependentsLabel}
          </Button>
        </form>
      </GovernedTrailingActionSlot>
    );
  }

  if (descriptorId === "add-dependent") {
    return (
      <GovernedTrailingActionSlot trailingAction={trailingAction}>
        <form action={addHrBenefitEnrollmentDependentFormAction} className="flex flex-col gap-3">
          <HiddenEnrollmentId row={row} />
          <Field>
            <FieldLabel>{copy.dependentNameLabel}</FieldLabel>
            <Input name="dependentName" required />
          </Field>
          <Field>
            <FieldLabel>{copy.dependentRelationshipLabel}</FieldLabel>
            <select name="relationship" className={enrollmentSelectClass} defaultValue="spouse">
              {HRM_BENEFIT_DEPENDENT_RELATIONSHIPS.map((relationship) => (
                <option key={relationship} value={relationship}>
                  {relationship.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel>{copy.dependentDobLabel}</FieldLabel>
            <Input name="dateOfBirth" type="date" />
          </Field>
          <Field>
            <FieldLabel>{copy.colCoverageStart}</FieldLabel>
            <Input
              name="coverageStartDate"
              type="datetime-local"
              defaultValue={String(row.cells.coverageStartInput ?? "")}
              required
            />
          </Field>
          <Button type="submit" variant="outline" size="sm">
            {copy.trailingAddDependentLabel}
          </Button>
        </form>
      </GovernedTrailingActionSlot>
    );
  }

  return null;
}
