"use client";

import { Button } from "@afenda/ui";
import { useTransition } from "react";
import type { SystemAdminActionResult } from "../../tenant-execution/contracts/system-admin.action-result.contract";
import { systemAdminBillingUiCopy } from "../surface/system-admin.billing-ui.copy.shared";

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

  if (!stripeConfigured || !canManage) {
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
  );
}
