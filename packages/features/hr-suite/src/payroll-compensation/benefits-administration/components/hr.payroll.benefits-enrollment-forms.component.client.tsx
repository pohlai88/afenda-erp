"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { type ActionResult } from "@afenda/governed-surface/schemas";
import { useActionState } from "react";

import { Button } from "@afenda/ui/button";
import { Field, FieldGroup, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import {
  createHrBenefitEnrollmentAction,
  createNewHireBenefitEnrollmentAction,
  recordHrBenefitLifeEventAction,
} from "../actions/hr.payroll.benefits.actions.server";
import {
  HRM_BENEFIT_COVERAGE_LEVELS,
  HRM_BENEFIT_ENROLLMENT_CHANNELS,
  HRM_BENEFIT_LIFE_EVENT_KINDS,
} from "../schemas/hr.payroll.benefits-form.shared";
import { hrBenefitsUiCopy } from "../surface/hr.payroll.benefits-ui.copy.shared";

const enrollmentSelectClass =
  "min-h-field w-full rounded-control border border-transparent bg-input/50 px-field-px py-field-py type-control";

export function HrBenefitsNewHireEnrollmentForm() {
  const copy = hrBenefitsUiCopy.newHireEnrollment;
  const enrollmentCopy = hrBenefitsUiCopy.enrollments;
  const [state, action, pending] = useActionState(
    createNewHireBenefitEnrollmentAction,
    undefined as ActionResult | undefined,
  );

  return (
    <form action={action} className="rounded-card border p-4">
      <input type="hidden" name="enrollmentChannel" value="new_hire" />
      <FieldGroup>
        <div>
          <h3 className="type-card-title">{copy.title}</h3>
          <p className="type-muted">{copy.description}</p>
        </div>
        <Field>
          <FieldLabel htmlFor="newHireEmployeeId">Employee ID</FieldLabel>
          <Input id="newHireEmployeeId" name="employeeId" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="newHirePlanId">Plan ID</FieldLabel>
          <Input id="newHirePlanId" name="planId" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="newHireCoverageLevel">
            {enrollmentCopy.colCoverageLevel}
          </FieldLabel>
          <select
            id="newHireCoverageLevel"
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
          <FieldLabel htmlFor="newHireCoverageStartDate">
            {enrollmentCopy.colCoverageStart}
          </FieldLabel>
          <Input
            id="newHireCoverageStartDate"
            name="coverageStartDate"
            type="datetime-local"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="newHireEligibilityOverrideReference">
            {enrollmentCopy.eligibilityOverrideLabel}
          </FieldLabel>
          <Input
            id="newHireEligibilityOverrideReference"
            name="eligibilityOverrideReference"
          />
        </Field>
        <ActionFormErrors result={state} />
        <Button type="submit" disabled={pending}>
          {copy.submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}

export function HrBenefitsLifeEventRecordForm() {
  const copy = hrBenefitsUiCopy.lifeEvent;
  const [state, action, pending] = useActionState(
    recordHrBenefitLifeEventAction,
    undefined as ActionResult | undefined,
  );

  return (
    <form action={action} className="rounded-card border p-4">
      <FieldGroup>
        <div>
          <h3 className="type-card-title">{copy.title}</h3>
          <p className="type-muted">{copy.description}</p>
        </div>
        <Field>
          <FieldLabel htmlFor="lifeEventEmployeeId">Employee ID</FieldLabel>
          <Input id="lifeEventEmployeeId" name="employeeId" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="lifeEventKind">{copy.colKind}</FieldLabel>
          <select id="lifeEventKind" name="kind" className={enrollmentSelectClass} required>
            {HRM_BENEFIT_LIFE_EVENT_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="lifeEventDate">{copy.colEventDate}</FieldLabel>
          <Input id="lifeEventDate" name="eventDate" type="datetime-local" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="lifeEventApprovalReference">
            {copy.colApprovalReference}
          </FieldLabel>
          <Input id="lifeEventApprovalReference" name="approvalReference" />
        </Field>
        <Field>
          <FieldLabel htmlFor="lifeEventNotes">Notes</FieldLabel>
          <Input id="lifeEventNotes" name="notes" />
        </Field>
        <ActionFormErrors result={state} />
        <Button type="submit" disabled={pending}>
          {copy.submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}

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
          <FieldLabel htmlFor="openEnrollmentWindowId">Open enrollment window ID</FieldLabel>
          <Input id="openEnrollmentWindowId" name="openEnrollmentWindowId" />
        </Field>
        <Field>
          <FieldLabel htmlFor="lifeEventId">Life event ID</FieldLabel>
          <Input id="lifeEventId" name="lifeEventId" />
        </Field>
        <Field>
          <FieldLabel htmlFor="eligibilityOverrideReference">
            {copy.eligibilityOverrideLabel}
          </FieldLabel>
          <Input id="eligibilityOverrideReference" name="eligibilityOverrideReference" />
        </Field>
        <ActionFormErrors result={state} />
        <Button type="submit" disabled={pending}>
          {copy.createSubmitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
