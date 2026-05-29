import type { OrganizationSubscription } from "./system-admin.billing-subscription.contract";
import type { SystemAdminBillingEntitlementRow } from "./system-admin.billing-list.contract";

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
