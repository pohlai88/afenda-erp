"use client";

import { useActionState } from "react";

import type { GovernedListTrailingCellProps } from "@afenda/governed-surface/client";
import { ActionFormErrors } from "@afenda/governed-surface/client";
import type { ActionResult } from "@afenda/governed-surface/schemas";
import { Button } from "@afenda/ui/button";
import { Field, FieldLabel } from "@afenda/ui/field";
import { Input } from "@afenda/ui/input";

import { HR_LIFECYCLE_PROBATION_OUTCOMES } from "../schemas/hr.workforce.lifecycle-probation.schema";
import { HR_LIFECYCLE_EMPLOYMENT_STATUSES } from "../schemas/hr.workforce.lifecycle-employment-status.schema";
import { formatLifecycleEmploymentStatusLabel } from "../surface/hr.workforce.lifecycle-list.shared";
import { hrLifecycleUiCopy } from "../surface/hr.workforce.lifecycle-ui.copy.shared";

const LIFECYCLE_SELECT_CLASS =
  "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full min-w-0 rounded-control border px-3 py-1 type-control shadow-elevation-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export function LifecycleTrailingActionForm({
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

export function HrLifecycleOverviewScheduleTrailingForm({
  row,
  action,
}: {
  row: GovernedListTrailingCellProps["row"];
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
}) {
  const copy = hrLifecycleUiCopy.overview;
  const employeeId = String(row.cells.employeeIdValue ?? row.id);
  const currentStatus = String(row.cells.currentStatusValue ?? "");

  return (
    <LifecycleTrailingActionForm
      action={action}
      submitLabel={copy.trailingScheduleLabel}
      hiddenFields={
        <input type="hidden" name="employeeId" value={employeeId} />
      }
    >
      <Field>
        <FieldLabel htmlFor={`lifecycle-to-${row.id}`}>
          {copy.trailingToStatus}
        </FieldLabel>
        <select
          id={`lifecycle-to-${row.id}`}
          name="toStatus"
          className={LIFECYCLE_SELECT_CLASS}
          defaultValue=""
          required
        >
          <option value="" disabled>
            Select stage
          </option>
          {HR_LIFECYCLE_EMPLOYMENT_STATUSES.filter(
            (status) => status !== currentStatus && status !== "archived",
          ).map((status) => (
            <option key={status} value={status}>
              {formatLifecycleEmploymentStatusLabel(status)}
            </option>
          ))}
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor={`lifecycle-effective-${row.id}`}>
          {copy.trailingEffectiveDate}
        </FieldLabel>
        <Input
          id={`lifecycle-effective-${row.id}`}
          name="effectiveDate"
          type="datetime-local"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`lifecycle-reason-${row.id}`}>
          {copy.trailingReason}
        </FieldLabel>
        <Input id={`lifecycle-reason-${row.id}`} name="reason" />
      </Field>
      <Field>
        <FieldLabel htmlFor={`lifecycle-approval-${row.id}`}>
          {copy.trailingApprovalRef}
        </FieldLabel>
        <Input
          id={`lifecycle-approval-${row.id}`}
          name="approvalReference"
        />
      </Field>
    </LifecycleTrailingActionForm>
  );
}

export function HrLifecycleProbationOutcomeTrailingForm({
  row,
  action,
}: {
  row: GovernedListTrailingCellProps["row"];
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
}) {
  const copy = hrLifecycleUiCopy.probationDue;
  const employeeId = String(row.cells.employeeIdValue ?? row.id);
  const defaultProbationEnd = String(row.cells.probationEndDateInput ?? "");

  return (
    <LifecycleTrailingActionForm
      action={action}
      submitLabel={copy.trailingOutcomeLabel}
      hiddenFields={
        <input type="hidden" name="employeeId" value={employeeId} />
      }
    >
      <Field>
        <FieldLabel htmlFor={`probation-outcome-${row.id}`}>
          {copy.trailingOutcome}
        </FieldLabel>
        <select
          id={`probation-outcome-${row.id}`}
          name="outcome"
          className={LIFECYCLE_SELECT_CLASS}
          defaultValue="confirmed"
          required
        >
          {HR_LIFECYCLE_PROBATION_OUTCOMES.map((outcome) => (
            <option key={outcome} value={outcome}>
              {outcome.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </Field>
      <Field>
        <FieldLabel htmlFor={`probation-end-${row.id}`}>
          {copy.trailingProbationEnd}
        </FieldLabel>
        <Input
          id={`probation-end-${row.id}`}
          name="probationEndDate"
          type="date"
          defaultValue={defaultProbationEnd}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`probation-effective-${row.id}`}>
          {copy.trailingEffectiveDate}
        </FieldLabel>
        <Input
          id={`probation-effective-${row.id}`}
          name="effectiveDate"
          type="datetime-local"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`probation-reason-${row.id}`}>
          {copy.trailingReason}
        </FieldLabel>
        <Input id={`probation-reason-${row.id}`} name="reason" />
      </Field>
      <Field>
        <FieldLabel htmlFor={`probation-approval-${row.id}`}>
          {copy.trailingApprovalRef}
        </FieldLabel>
        <Input
          id={`probation-approval-${row.id}`}
          name="approvalReference"
        />
      </Field>
    </LifecycleTrailingActionForm>
  );
}

export function HrLifecycleContractRenewalTrailingForm({
  row,
  action,
}: {
  row: GovernedListTrailingCellProps["row"];
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
}) {
  const copy = hrLifecycleUiCopy.contractReviews;
  const employeeId = String(row.cells.employeeIdValue ?? row.id);
  const defaultContractEnd = String(row.cells.contractEndDateInput ?? "");

  return (
    <LifecycleTrailingActionForm
      action={action}
      submitLabel={copy.trailingRenewLabel}
      hiddenFields={
        <input type="hidden" name="employeeId" value={employeeId} />
      }
    >
      <Field>
        <FieldLabel htmlFor={`contract-renew-end-${row.id}`}>
          {copy.trailingNewEndDate}
        </FieldLabel>
        <Input
          id={`contract-renew-end-${row.id}`}
          name="contractEndDate"
          type="date"
          defaultValue={defaultContractEnd}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`contract-renew-effective-${row.id}`}>
          {copy.trailingEffectiveDate}
        </FieldLabel>
        <Input
          id={`contract-renew-effective-${row.id}`}
          name="effectiveDate"
          type="datetime-local"
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`contract-renew-reason-${row.id}`}>
          {copy.trailingReason}
        </FieldLabel>
        <Input
          id={`contract-renew-reason-${row.id}`}
          name="reason"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`contract-renew-approval-${row.id}`}>
          {copy.trailingApprovalRef}
        </FieldLabel>
        <Input
          id={`contract-renew-approval-${row.id}`}
          name="approvalReference"
        />
      </Field>
    </LifecycleTrailingActionForm>
  );
}

export function HrLifecycleNoticePeriodOffboardingTrailingForm({
  row,
  action,
}: {
  row: GovernedListTrailingCellProps["row"];
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
}) {
  const copy = hrLifecycleUiCopy.noticePeriod;
  const employeeId = String(row.cells.employeeIdValue ?? row.id);

  return (
    <LifecycleTrailingActionForm
      action={action}
      submitLabel={copy.trailingStartOffboarding}
      hiddenFields={
        <>
          <input type="hidden" name="employeeId" value={employeeId} />
          <input type="hidden" name="reason" value="Notice period exit" />
        </>
      }
    >
      <Field>
        <FieldLabel htmlFor={`notice-offboard-last-${row.id}`}>
          {hrLifecycleUiCopy.exit.lastWorkingLabel}
        </FieldLabel>
        <Input
          id={`notice-offboard-last-${row.id}`}
          name="lastWorkingDate"
          type="date"
        />
      </Field>
    </LifecycleTrailingActionForm>
  );
}

export function HrLifecyclePendingTransitionCancelTrailingForm({
  row,
  action,
}: {
  row: GovernedListTrailingCellProps["row"];
  action: (
    previous: ActionResult | undefined,
    formData: FormData,
  ) => Promise<ActionResult>;
}) {
  const copy = hrLifecycleUiCopy.pendingTransitions;

  return (
    <LifecycleTrailingActionForm
      action={action}
      submitLabel={copy.trailingCancelLabel}
      hiddenFields={
        <input type="hidden" name="transitionId" value={row.id} />
      }
    />
  );
}
