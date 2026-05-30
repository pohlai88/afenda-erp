"use client";

import { useActionState } from "react";

import { ActionFormErrors } from "@afenda/governed-surface/client";
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
  "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full min-w-0 rounded-control border px-3 py-1 text-sm shadow-elevation-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

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
    <div className="grid gap-surface-lg @lg:grid-cols-3">
      <SectionPanelLite title={copy.noticeSubmitLabel}>
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
      </SectionPanelLite>

      <SectionPanelLite title={copy.offboardingSubmitLabel}>
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
      </SectionPanelLite>

      <SectionPanelLite title={copy.onboardingSubmitLabel}>
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
      </SectionPanelLite>
    </div>
  );
}

function SectionPanelLite({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-surface-sm rounded-control border p-surface-md">
      <h3 className="text-sm font-medium">{title}</h3>
      {children}
    </div>
  );
}
