"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { type ActionResult } from "@afenda/governed-surface/schemas";
import { useActionState } from "react";

import { Button } from "@afenda/ui/button";
import { Field, FieldGroup, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import { createHrBenefitEnrollmentAction } from "../actions/hr.payroll.benefits.actions.server";
import {
  HRM_BENEFIT_COVERAGE_LEVELS,
  HRM_BENEFIT_ENROLLMENT_CHANNELS,
} from "../schemas/hr.payroll.benefits-form.shared";
import { hrBenefitsUiCopy } from "../surface/hr.payroll.benefits-ui.copy.shared";

const enrollmentSelectClass =
  "min-h-[var(--af-field-height)] w-full rounded-lg border border-transparent bg-input/50 px-[var(--af-field-px)] py-[var(--af-field-py)] text-sm";

export function HrBenefitsEnrollmentCreateForm() {
  const copy = hrBenefitsUiCopy.enrollments;
  const [state, action, pending] = useActionState(
    createHrBenefitEnrollmentAction,
    undefined as ActionResult | undefined,
  );

  return (
    <form action={action} className="rounded-card border p-4">
      <FieldGroup>
        <div>
          <h3 className="type-card-title">{copy.createTitle}</h3>
          <p className="type-muted">{copy.createDescription}</p>
        </div>
        <Field>
          <FieldLabel htmlFor="employeeId">Employee ID</FieldLabel>
          <Input id="employeeId" name="employeeId" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="planId">Plan ID</FieldLabel>
          <Input id="planId" name="planId" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="coverageLevel">{copy.colCoverageLevel}</FieldLabel>
          <select
            id="coverageLevel"
            name="coverageLevel"
            className={enrollmentSelectClass}
            defaultValue="employee_only"
          >
            {HRM_BENEFIT_COVERAGE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="enrollmentChannel">Enrollment channel</FieldLabel>
          <select
            id="enrollmentChannel"
            name="enrollmentChannel"
            className={enrollmentSelectClass}
            defaultValue="administrative"
          >
            {HRM_BENEFIT_ENROLLMENT_CHANNELS.map((channel) => (
              <option key={channel} value={channel}>
                {channel.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="coverageStartDate">{copy.colCoverageStart}</FieldLabel>
          <Input
            id="coverageStartDate"
            name="coverageStartDate"
            type="datetime-local"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="coverageEndDate">Coverage end</FieldLabel>
          <Input id="coverageEndDate" name="coverageEndDate" type="datetime-local" />
        </Field>
        <Field>
          <FieldLabel htmlFor="eligibilityOverrideReference">
            {copy.eligibilityOverrideLabel}
          </FieldLabel>
          <Input id="eligibilityOverrideReference" name="eligibilityOverrideReference" />
        </Field>
        <ActionFormErrors state={state} />
        <Button type="submit" disabled={pending}>
          {copy.createSubmitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
