"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button, Field, FieldGroup, FieldLabel, NativeSelect, NativeSelectOption } from "@afenda/ui";
import { useState, useTransition } from "react";
import {
  systemAdminActionFailure,
  type SystemAdminActionResult,
} from "../tenant-execution/sys-action-result.contract";
import type { SystemAdminBillingPlanRow } from "./sys-billing-plans.contract";
import { systemAdminBillingUiCopy } from "./sys-billing-ui.copy.shared";

export type StartStripeCheckoutWithPlanAction = (input: {
  planKey: string;
}) => Promise<SystemAdminActionResult<{ url: string }>>;

type StartStripeBillingPortalAction = () => Promise<
  SystemAdminActionResult<{ url: string }>
>;

export function SystemAdminBillingPlanCheckout({
  plans,
  defaultPlanKey,
  canManage,
  startStripeCheckoutWithPlanAction,
  startStripeBillingPortalAction,
}: {
  plans: readonly SystemAdminBillingPlanRow[];
  defaultPlanKey?: string;
  canManage: boolean;
  startStripeCheckoutWithPlanAction: StartStripeCheckoutWithPlanAction;
  startStripeBillingPortalAction: StartStripeBillingPortalAction;
}) {
  const [planKey, setPlanKey] = useState(
    defaultPlanKey ?? plans[0]?.key ?? "pro",
  );
  const [lastResult, setLastResult] = useState<
    SystemAdminActionResult<{ url: string }> | undefined
  >();
  const [checkoutPending, startCheckout] = useTransition();
  const [portalPending, startPortal] = useTransition();

  if (!canManage || plans.length === 0) {
    return null;
  }

  const redirect = (result: SystemAdminActionResult<{ url: string }>) => {
    if (!result.ok) {
      setLastResult(result);
      return;
    }

    if (!result.data?.url) {
      setLastResult(systemAdminActionFailure("Stripe redirect URL was missing."));
      return;
    }

    setLastResult(undefined);
    window.location.assign(result.data.url);
  };

  return (
    <div className="flex flex-col gap-surface-md">
      <FieldGroup className="flex flex-col gap-surface-sm @sm:flex-row @sm:items-end">
        <Field className="min-w-48 flex-1">
          <FieldLabel>{systemAdminBillingUiCopy.plans.selectLabel}</FieldLabel>
          <NativeSelect
            value={planKey}
            onChange={(event) => setPlanKey(event.target.value)}
          >
            {plans.map((plan) => (
              <NativeSelectOption key={plan.key} value={plan.key}>
                {plan.name} — {plan.priceLabel}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <div className="flex flex-wrap gap-surface-sm">
          <Button
            type="button"
            disabled={checkoutPending}
            onClick={() => {
              startCheckout(async () => {
                redirect(await startStripeCheckoutWithPlanAction({ planKey }));
              });
            }}
          >
            {checkoutPending
              ? systemAdminBillingUiCopy.stripe.checkoutPending
              : systemAdminBillingUiCopy.stripe.checkout}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={portalPending}
            onClick={() => {
              startPortal(async () => {
                redirect(await startStripeBillingPortalAction());
              });
            }}
          >
            {portalPending
              ? systemAdminBillingUiCopy.stripe.portalPending
              : systemAdminBillingUiCopy.stripe.portal}
          </Button>
        </div>
      </FieldGroup>
      <p className="type-caption">
        {systemAdminBillingUiCopy.plans.checkoutHint}
      </p>
      <ActionFormErrors result={lastResult} />
    </div>
  );
}
