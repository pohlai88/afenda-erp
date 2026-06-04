"use client";

import { ActionFormErrors } from "@afenda/governed-surface/client";
import { Button } from "@afenda/ui";
import { useState, useTransition } from "react";
import {
  systemAdminActionFailure,
  type SystemAdminActionResult,
} from "../tenant-execution/sys-action-result.contract";
import { systemAdminBillingUiCopy } from "./sys-billing-ui.copy.shared";

export type StartStripeCheckoutAction = () => Promise<
  SystemAdminActionResult<{ url: string }>
>;

export type StartStripeBillingPortalAction = () => Promise<
  SystemAdminActionResult<{ url: string }>
>;

export function SystemAdminBillingStripeActions({
  stripeConfigured,
  canManage,
  startStripeCheckoutAction,
  startStripeBillingPortalAction,
}: {
  stripeConfigured: boolean;
  canManage: boolean;
  startStripeCheckoutAction: StartStripeCheckoutAction;
  startStripeBillingPortalAction: StartStripeBillingPortalAction;
}) {
  const [checkoutPending, startCheckout] = useTransition();
  const [portalPending, startPortal] = useTransition();
  const [lastResult, setLastResult] = useState<
    SystemAdminActionResult<{ url: string }> | undefined
  >();

  if (!stripeConfigured || !canManage) {
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
    <div className="flex flex-col gap-surface-sm">
      <div className="flex flex-wrap gap-surface-sm">
        <Button
          type="button"
          disabled={checkoutPending}
          onClick={() => {
            startCheckout(async () => {
              redirect(await startStripeCheckoutAction());
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
      <ActionFormErrors result={lastResult} />
    </div>
  );
}
