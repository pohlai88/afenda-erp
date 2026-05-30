"use client";

import { useActionState } from "react";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { SubsectionPanel } from "@afenda/ui";
import { Button } from "@afenda/ui/button";
import { Field, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import {
  initiateHrNoticePeriodAction,
  startHrOffboardingCaseAction,
  startHrOnboardingCaseAction,
} from "../actions/hr.workforce.lifecycle.actions.server";
import { hrLifecycleUiCopy } from "../surface/hr.workforce.lifecycle-ui.copy.shared";

const LIFECYCLE_SELECT_CLASS =
  "min-h-field w-full rounded-control border border-transparent bg-input/50 px-field-px py-field-py type-control";

function ExitPathwayForm({
  action,
  submitLabel,
  children,
}: {
  action: typeof initiateHrNoticePeriodAction;
  submitLabel: string;
  children?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-surface-sm">
      <Field>
        <FieldLabel htmlFor={`exit-employee-${submitLabel}`}>
          {hrLifecycleUiCopy.exit.employeeLabel}
        </FieldLabel>
        <Input
          id={`exit-employee-${submitLabel}`}
          name="employeeId"
          required
        />
      </Field>
      {children}
      <Field>
        <FieldLabel htmlFor={`exit-reason-${submitLabel}`}>
          {hrLifecycleUiCopy.exit.reasonLabel}
        </FieldLabel>
        <Input id={`exit-reason-${submitLabel}`} name="reason" required />
      </Field>
      <Field>
        <FieldLabel htmlFor={`exit-approval-${submitLabel}`}>
          {hrLifecycleUiCopy.exit.approvalRefLabel}
        </FieldLabel>
        <Input id={`exit-approval-${submitLabel}`} name="approvalReference" />
      </Field>
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

export function HrLifecycleExitPanel() {
  const copy = hrLifecycleUiCopy.exit;

  return (
    <div className="@container grid gap-surface-lg @lg:grid-cols-3">
      <SubsectionPanel title={copy.noticeSubmitLabel}>
        <ExitPathwayForm
          action={initiateHrNoticePeriodAction}
          submitLabel={copy.noticeSubmitLabel}
        >
          <Field>
            <FieldLabel htmlFor="exit-notice-effective">
              {copy.effectiveDateLabel}
            </FieldLabel>
            <Input
              id="exit-notice-effective"
              name="effectiveDate"
              type="datetime-local"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="exit-notice-last-working">
              {copy.lastWorkingLabel}
            </FieldLabel>
            <Input
              id="exit-notice-last-working"
              name="lastWorkingDate"
              type="date"
            />
          </Field>
        </ExitPathwayForm>
      </SubsectionPanel>

      <SubsectionPanel title={copy.offboardingSubmitLabel}>
        <ExitPathwayForm
          action={startHrOffboardingCaseAction}
          submitLabel={copy.offboardingSubmitLabel}
        >
          <Field>
            <FieldLabel htmlFor="exit-offboard-effective">
              {copy.effectiveDateLabel}
            </FieldLabel>
            <Input
              id="exit-offboard-effective"
              name="effectiveDate"
              type="datetime-local"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="exit-offboard-last-working">
              {copy.lastWorkingLabel}
            </FieldLabel>
            <Input
              id="exit-offboard-last-working"
              name="lastWorkingDate"
              type="date"
            />
          </Field>
        </ExitPathwayForm>
      </SubsectionPanel>

      <SubsectionPanel title={copy.onboardingSubmitLabel}>
        <ExitPathwayForm
          action={startHrOnboardingCaseAction}
          submitLabel={copy.onboardingSubmitLabel}
        >
          <Field>
            <FieldLabel htmlFor="exit-onboard-target">
              {copy.targetStatusLabel}
            </FieldLabel>
            <select
              id="exit-onboard-target"
              name="targetStatus"
              className={LIFECYCLE_SELECT_CLASS}
              defaultValue="active"
            >
              <option value="active">active</option>
              <option value="confirmed">confirmed</option>
              <option value="probation">probation</option>
            </select>
          </Field>
        </ExitPathwayForm>
      </SubsectionPanel>
    </div>
  );
}
