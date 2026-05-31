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

import { decideHrGeoExceptionFormAction } from "../actions/hr.time.geo.actions.server";
import { hrGeoUiCopy } from "../surface/hr.time.geo-ui.copy.shared";

function GeoExceptionDecisionForm(input: {
  exceptionId: string;
  decision: "approve" | "reject" | "return";
  label: string;
  variant: "default" | "secondary" | "outline";
}) {
  const [state, formAction, pending] = useActionState(
    decideHrGeoExceptionFormAction,
    undefined as ActionResult | undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-surface-sm">
      <input type="hidden" name="exceptionId" value={input.exceptionId} />
      <input type="hidden" name="decision" value={input.decision} />
      <Field>
        <FieldLabel>{hrGeoUiCopy.pending.trailingReasonLabel}</FieldLabel>
        <Input name="decisionReason" required minLength={3} />
      </Field>
      <Button
        type="submit"
        size="sm"
        variant={input.variant}
        className="w-fit"
        disabled={pending}
      >
        {input.label}
      </Button>
      <ActionFormErrors result={state} />
    </form>
  );
}

/** HRM-GEO-018 — Pattern C row trailing for pending exception decisions. */
export function HrGeoPendingExceptionsTrailingCell({
  row,
}: GovernedListTrailingCellProps) {
  const trailingAction = row.trailingAction;
  const copy = hrGeoUiCopy.pending;

  if (!isListSurfaceTrailingActionRenderable(trailingAction)) {
    return null;
  }

  if (trailingAction.state === "disabled") {
    return (
      <GovernedTrailingActionSlot trailingAction={trailingAction}>
        <span className="type-caption">
          {trailingAction.descriptor?.label ?? copy.colActions}
        </span>
      </GovernedTrailingActionSlot>
    );
  }

  return (
    <GovernedTrailingActionSlot trailingAction={trailingAction}>
      <div className="@container flex min-w-56 flex-col gap-surface-md">
        <GeoExceptionDecisionForm
          exceptionId={row.id}
          decision="approve"
          label={copy.trailingApproveLabel}
          variant="default"
        />
        <GeoExceptionDecisionForm
          exceptionId={row.id}
          decision="reject"
          label={copy.trailingRejectLabel}
          variant="secondary"
        />
        <GeoExceptionDecisionForm
          exceptionId={row.id}
          decision="return"
          label={copy.trailingReturnLabel}
          variant="outline"
        />
      </div>
    </GovernedTrailingActionSlot>
  );
}
