"use client";

import { useActionState } from "react";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { type ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { Field, FieldGroup, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";
import { SectionPanel } from "@afenda/ui";
import { Textarea } from "@afenda/ui/textarea";

import {
  applyOtmOnBehalfAction,
  requestOwnOtmAction,
} from "../actions/hr.time.otm-request.actions.server";
import {
  HR_OTM_DAY_CATEGORY_OPTIONS,
  HR_OTM_TIMING_KIND_OPTIONS,
} from "../data/hr.time.otm-catalog.shared";
import { hrTimeOtmUiCopy } from "../surface/hr.time.otm-ui.copy.shared";

type OtmRequestFormProps = {
  mode: "self" | "on_behalf";
  employeeOptions?: readonly { value: string; label: string }[];
  showEligibilityOverride?: boolean;
};

function OtmRequestFormShell({
  action,
  title,
  submitLabel,
  children,
}: {
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
  title: string;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const copy = hrTimeOtmUiCopy.requestForm;

  return (
    <SectionPanel title={title}>
      <form action={formAction} className="@container flex flex-col gap-surface-md">
        <FieldGroup className="grid gap-surface-md @md/field-group:grid-cols-2">
          {children}
          <Field className="@md/field-group:col-span-2">
            <Button type="submit" size="sm" disabled={pending}>
              {submitLabel}
            </Button>
          </Field>
        </FieldGroup>
        <p className="type-caption">{copy.durationHint}</p>
        <ActionFormErrors result={state} />
      </form>
    </SectionPanel>
  );
}

function OtmRequestFields({
  mode,
  employeeOptions,
  showEligibilityOverride = true,
}: OtmRequestFormProps) {
  const copy = hrTimeOtmUiCopy.requestForm;

  return (
    <>
      {mode === "on_behalf" ? (
        <Field className="@md/field-group:col-span-2">
          <FieldLabel htmlFor="otm-employee">{copy.fieldEmployee}</FieldLabel>
          <select
            id="otm-employee"
            name="employeeId"
            className="w-full rounded-control border border-input bg-background px-3 py-2 type-control"
            required
            defaultValue=""
          >
            <option value="" disabled>
              {copy.fieldEmployeePlaceholder}
            </option>
            {(employeeOptions ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field>
        <FieldLabel htmlFor="otm-work-date">{copy.fieldWorkDate}</FieldLabel>
        <Input
          id="otm-work-date"
          name="workDate"
          type="date"
          required
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="otm-timing-kind">{copy.fieldTimingKind}</FieldLabel>
        <select
          id="otm-timing-kind"
          name="timingKind"
          className="w-full rounded-control border border-input bg-background px-3 py-2 type-control"
          defaultValue="planned"
        >
          {HR_OTM_TIMING_KIND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field>
        <FieldLabel htmlFor="otm-start-time">{copy.fieldStartTime}</FieldLabel>
        <Input id="otm-start-time" name="startTime" type="time" />
      </Field>

      <Field>
        <FieldLabel htmlFor="otm-end-time">{copy.fieldEndTime}</FieldLabel>
        <Input id="otm-end-time" name="endTime" type="time" />
      </Field>

      <Field>
        <FieldLabel htmlFor="otm-hours">{copy.fieldHours}</FieldLabel>
        <Input
          id="otm-hours"
          name="hours"
          type="number"
          min="0.25"
          max="24"
          step="0.25"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="otm-overtime-type">{copy.fieldOvertimeType}</FieldLabel>
        <select
          id="otm-overtime-type"
          name="overtimeType"
          className="w-full rounded-control border border-input bg-background px-3 py-2 type-control"
          required
          defaultValue="regular"
        >
          {HR_OTM_DAY_CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field className="@md/field-group:col-span-2">
        <FieldLabel htmlFor="otm-reason">{copy.fieldReason}</FieldLabel>
        <Textarea id="otm-reason" name="reason" required rows={3} />
      </Field>

      <Field>
        <FieldLabel htmlFor="otm-policy-group">{copy.fieldPolicyGroup}</FieldLabel>
        <Input
          id="otm-policy-group"
          name="policyGroupCode"
          defaultValue="default"
        />
      </Field>

      {showEligibilityOverride ? (
        <Field className="@md/field-group:col-span-2">
          <FieldLabel htmlFor="otm-eligibility-override">
            {copy.fieldEligibilityOverride}
          </FieldLabel>
          <Textarea
            id="otm-eligibility-override"
            name="eligibilityExceptionReason"
            rows={2}
          />
          <p className="type-caption">{copy.fieldEligibilityOverrideHint}</p>
        </Field>
      ) : null}
    </>
  );
}

/** HRM-OTM-001..006 — Pattern A overtime submit form (self or on-behalf). */
export function OtmRequestForm(props: OtmRequestFormProps) {
  const copy = hrTimeOtmUiCopy.requestForm;

  if (props.mode === "on_behalf") {
    return (
      <OtmRequestFormShell
        action={applyOtmOnBehalfAction}
        title={copy.titleOnBehalf}
        submitLabel={copy.submitOnBehalf}
      >
        <OtmRequestFields {...props} />
      </OtmRequestFormShell>
    );
  }

  return (
    <OtmRequestFormShell
      action={requestOwnOtmAction}
      title={copy.titleSelf}
      submitLabel={copy.submitSelf}
    >
      <OtmRequestFields {...props} />
    </OtmRequestFormShell>
  );
}
