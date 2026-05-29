"use client";

import { Button, Field, FieldGroup, FieldLabel, NativeSelect, NativeSelectOption } from "@afenda/ui";
import { useState, useTransition } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import type { SystemAdminBillingPlanRow } from "../contracts/system-admin.billing-plans.contract";
import { systemAdminBillingUiCopy } from "../surface/system-admin.billing-ui.copy.shared";

export type StartStripeCheckoutWithPlanAction = (input: {
  planKey: string;
}) => Promise<SystemAdminActionResult<{ url: string }>>;

export type StartStripeBillingPortalAction = () => Promise<
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
  const [checkoutPending, startCheckout] = useTransition();
  const [portalPending, startPortal] = useTransition();

  if (!canManage || plans.length === 0) {
    return null;
  }

  const redirect = (result: SystemAdminActionResult<{ url: string }>) => {
    if (!result.ok || !result.data?.url) {
      if (!result.ok) {
        console.error(result.error);
      }
      return;
    }

    window.location.assign(result.data.url);
  };

  return (
    <div className="flex flex-col gap-surface-md">
      <FieldGroup className="flex flex-col gap-surface-sm @sm:flex-row @sm:items-end">
        <Field className="min-w-[12rem] flex-1">
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
      <p className="type-caption text-muted-foreground">
        {systemAdminBillingUiCopy.plans.checkoutHint}
      </p>
    </div>
  );
}
