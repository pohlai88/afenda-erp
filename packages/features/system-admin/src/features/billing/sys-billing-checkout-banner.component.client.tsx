"use client";

import { Alert, AlertDescription, AlertTitle } from "@afenda/ui";
import { systemAdminBillingUiCopy } from "../surface/system-admin.billing-ui.copy.shared";

export function SystemAdminBillingCheckoutBanner({
  checkoutStatus,
}: {
  checkoutStatus?: "success" | "cancelled";
}) {
  if (checkoutStatus === "success") {
    return (
      <Alert data-testid="system-admin-billing-checkout-banner">
        <AlertTitle>{systemAdminBillingUiCopy.checkout.successTitle}</AlertTitle>
        <AlertDescription>
          {systemAdminBillingUiCopy.checkout.successDescription}
        </AlertDescription>
      </Alert>
    );
  }

  if (checkoutStatus === "cancelled") {
    return (
      <Alert data-testid="system-admin-billing-checkout-banner">
        <AlertTitle>{systemAdminBillingUiCopy.checkout.cancelledTitle}</AlertTitle>
        <AlertDescription>
          {systemAdminBillingUiCopy.checkout.cancelledDescription}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
