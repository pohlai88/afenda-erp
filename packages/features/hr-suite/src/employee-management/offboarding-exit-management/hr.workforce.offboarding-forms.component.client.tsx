"use client";

import { useActionState } from "react";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui/button";
import { Field, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";
import { SectionPanel } from "@afenda/ui";

import { initiateHrOffboardingExitCaseAction } from "./hr.workforce.offboarding.actions.server";
import { hrOffboardingUiCopy } from "./hr.workforce.offboarding-ui.copy.shared";

const OFFBOARDING_SELECT_CLASS =
  "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full min-w-0 rounded-control border px-3 py-1 type-control shadow-elevation-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export function HrOffboardingInitiatePanel({
  employeeOptions,
}: {
  employeeOptions: Array<{ value: string; label: string }>;
}) {
  const copy = hrOffboardingUiCopy.initiatePanel;
  const [state, formAction, pending] = useActionState(
    initiateHrOffboardingExitCaseAction,
    undefined,
  );

  return (
    <SectionPanel headingLevel={3} title={copy.title} description={copy.description}>
      <form action={formAction} className="grid gap-surface-sm @md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="offboarding-employee">Employee</FieldLabel>
          <select
            id="offboarding-employee"
            name="employeeId"
            required
            className={OFFBOARDING_SELECT_CLASS}
            defaultValue=""
          >
            <option value="" disabled>
              Select employee
            </option>
            {employeeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="offboarding-exit-type">Exit type</FieldLabel>
          <select
            id="offboarding-exit-type"
            name="exitType"
            required
            className={OFFBOARDING_SELECT_CLASS}
            defaultValue="resignation"
          >
            <option value="resignation">Resignation</option>
            <option value="termination">Termination</option>
            <option value="retirement">Retirement</option>
            <option value="contract_expiry">Contract expiry</option>
            <option value="redundancy">Redundancy</option>
            <option value="death">Death</option>
            <option value="mutual_separation">Mutual separation</option>
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="offboarding-reason">Reason</FieldLabel>
          <Input id="offboarding-reason" name="reason" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="offboarding-effective-date">Effective date</FieldLabel>
          <Input
            id="offboarding-effective-date"
            name="effectiveDate"
            type="date"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="offboarding-notice-start">Notice start</FieldLabel>
          <Input
            id="offboarding-notice-start"
            name="noticeStartDate"
            type="date"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="offboarding-notice-end">Notice end</FieldLabel>
          <Input id="offboarding-notice-end" name="noticeEndDate" type="date" />
        </Field>
        <Field>
          <FieldLabel htmlFor="offboarding-last-working">Last working date</FieldLabel>
          <Input
            id="offboarding-last-working"
            name="lastWorkingDate"
            type="date"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="offboarding-notice-days">Required notice days</FieldLabel>
          <Input
            id="offboarding-notice-days"
            name="requiredNoticeDays"
            type="number"
            min={0}
            defaultValue={30}
          />
        </Field>
        <Field className="@md:col-span-2">
          <FieldLabel htmlFor="offboarding-sensitive">Sensitive details</FieldLabel>
          <Input id="offboarding-sensitive" name="sensitiveDetails" />
        </Field>
        <div className="@md:col-span-2">
          <Button type="submit" disabled={pending}>
            Start offboarding
          </Button>
          <ActionFormErrors result={state} />
        </div>
      </form>
    </SectionPanel>
  );
}
