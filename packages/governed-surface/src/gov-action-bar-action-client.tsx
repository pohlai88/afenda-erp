"use client";

import { useActionState, useState } from "react";

import { Badge } from "@afenda/ui/badge";
import { Button } from "@afenda/ui/button";
import { Checkbox } from "@afenda/ui/checkbox";

import { ActionFormErrors } from "../../components/action-form-errors";
import {
  actionFailure,
  type ActionResult,
} from "./gov-action-result-shared";
import type { ActionDescriptor } from "./gov-action-schema";
import {
  GOVERNED_ACTION_ID_FIELD,
  GOVERNED_CONFIRM_FIELD,
  GOVERNED_STEP_UP_TOKEN_FIELD,
  type GovernedServerActionHandler,
} from "./gov-server-actions-shared";

const ACTION_INTENT_META = {
  default: { label: "Standard", badge: "secondary", button: "secondary" },
  approval: { label: "Approval", badge: "success", button: "default" },
  financial: { label: "Financial", badge: "info", button: "secondary" },
  compliance: { label: "Compliance", badge: "warning", button: "secondary" },
  destructive: {
    label: "Destructive",
    badge: "critical",
    button: "destructive",
  },
} as const satisfies Record<
  ActionDescriptor["intent"],
  {
    label: string;
    badge: "secondary" | "success" | "info" | "warning" | "critical";
    button: "default" | "secondary" | "destructive";
  }
>;

const missingGovernedAction: GovernedServerActionHandler = async () =>
  actionFailure(
    "This governed action is not connected to a registered server action.",
    undefined,
    "governed.action.unregistered",
  );

export function ActionBarActionForm({
  action,
  serverAction,
  stepUpToken,
}: {
  action: ActionDescriptor;
  serverAction?: GovernedServerActionHandler<FormData, void>;
  stepUpToken?: string;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [result, formAction, pending] = useActionState<
    ActionResult<void> | undefined,
    FormData
  >(serverAction ?? missingGovernedAction, undefined);
  const meta = ACTION_INTENT_META[action.intent];
  const actionRegistered = Boolean(serverAction);
  const missingConfirmation = Boolean(action.confirm) && !confirmed;
  const missingStepUpToken = Boolean(action.requiresStepUp) && !stepUpToken;
  const disabled =
    !actionRegistered || pending || missingConfirmation || missingStepUpToken;
  const actionResolution = !actionRegistered
    ? "missing"
    : missingStepUpToken
      ? "missing-step-up"
      : "registered";

  return (
    <form
      action={formAction}
      className="flex min-w-0 flex-wrap items-center gap-1.5"
      data-action-id={action.id}
      data-action-intent={action.intent}
      data-action-resolution={actionResolution}
      data-action-requires-step-up={action.requiresStepUp ? "true" : undefined}
      data-action-has-confirm={action.confirm ? "true" : undefined}
    >
      <input type="hidden" name={GOVERNED_ACTION_ID_FIELD} value={action.id} />
      {action.confirm && confirmed ? (
        <input
          type="hidden"
          name={GOVERNED_CONFIRM_FIELD}
          value="confirmed"
        />
      ) : null}
      {action.requiresStepUp && stepUpToken ? (
        <input
          type="hidden"
          name={GOVERNED_STEP_UP_TOKEN_FIELD}
          value={stepUpToken}
        />
      ) : null}
      {action.confirm ? (
        <label className="type-caption inline-flex items-center gap-1">
          <Checkbox
            aria-label={action.confirm.title}
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
          />
          <span>{action.confirm.confirmLabel}</span>
        </label>
      ) : null}
      <Button
        type="submit"
        variant={meta.button}
        size="sm"
        data-action-id={action.id}
        data-min-role={action.minRole}
        disabled={disabled}
        title={
          missingStepUpToken
            ? "Step-up verification is required before this action can be submitted."
            : missingConfirmation
              ? action.confirm?.title
              : undefined
        }
      >
        {pending ? "Working..." : action.label}
      </Button>
      <Badge variant={meta.badge}>{meta.label}</Badge>
      {action.minRole ? <Badge variant="outline">{action.minRole}</Badge> : null}
      {action.requiresStepUp ? <Badge variant="warning">Step-up</Badge> : null}
      {missingStepUpToken ? (
        <Badge variant="critical">Missing step-up</Badge>
      ) : null}
      {!actionRegistered ? <Badge variant="critical">Unregistered</Badge> : null}
      <ActionFormErrors result={result} />
    </form>
  );
}
