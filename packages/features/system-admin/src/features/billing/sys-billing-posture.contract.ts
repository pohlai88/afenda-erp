import type { OrganizationSubscription } from "./sys-billing-subscription.contract";
import type { SystemAdminBillingEntitlementRow } from "./sys-billing-list.contract";

export type BillingPostureSnapshot = {
  subscription: OrganizationSubscription;
  aiUsageEventCount: number;
  lynxRunCount: number;
  gatewaySpendAvailable: boolean;
  gatewaySpendAuthenticationFailed: boolean;
  gatewaySpendEntryCount: number;
  gatewayCostUsd: number;
  entitlements: readonly SystemAdminBillingEntitlementRow[];
  paymentMethodConfigured: boolean;
  marketplaceLinkage: string;
  stripeConfigured: boolean;
  stripeCustomerId: string | null;
};
