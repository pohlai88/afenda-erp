import { getGatewaySpendReport } from "@afenda/ai/server";
import { listAiFeatureEntitlements } from "@afenda/db";
import {
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  ensureStripeCustomerForOrganization,
  getStripeConfigurationStatus,
} from "@afenda/billing/server";
import { formatErpDateTime } from "@afenda/kernel";
import { listLynxEvalRuns } from "@afenda/feature-knowledge/server";
import { listTenantMembers } from "../users/sys-identity.repository.server";
import { listAiUsageEvents } from "../lynx/sys-lynx.repository.server";
import type { BillingPostureSnapshot } from "./sys-billing-posture.contract";
import type { OrganizationSubscription } from "./sys-billing-subscription.contract";
import type {
  SystemAdminBillingEntitlementRow,
  SystemAdminBillingInvoiceRow,
  SystemAdminBillingPaymentRow,
} from "./sys-billing-list.contract";
import {
  getOrganizationBillingByOrganizationId,
  listOrganizationBillingInvoices,
} from "./sys-billing-stripe.repository.server";

export async function getBillingPostureSnapshot(input: {
  organizationId: string;
  organizationSlug: string;
}): Promise<BillingPostureSnapshot> {
  const stripeStatus = getStripeConfigurationStatus();

  const [
    aiUsageEvents,
    lynxEvalRuns,
    gatewaySpend,
    members,
    entitlementRows,
    billingRecord,
  ] = await Promise.all([
    listAiUsageEvents({ organizationId: input.organizationId, limit: 500 }),
    listLynxEvalRuns(input.organizationId, 500),
    getGatewaySpendReport({ organizationId: input.organizationId }),
    listTenantMembers({ organizationId: input.organizationId, limit: 200 }),
    listAiFeatureEntitlements({ organizationId: input.organizationId }),
    getOrganizationBillingByOrganizationId({
      organizationId: input.organizationId,
    }),
  ]);

  const gatewayCostUsd = gatewaySpend.entries.reduce(
    (sum, entry) => sum + entry.costUsd,
    0,
  );

  const seatCount = members.filter((member) => member.status === "active").length;

  const subscription: OrganizationSubscription = billingRecord
    ? {
        organizationId: input.organizationId,
        planKey: billingRecord.planKey,
        status: billingRecord.status,
        seatsPurchased: billingRecord.seatsPurchased,
        seatsUsed: seatCount,
        startsAt: billingRecord.currentPeriodStart
          ? formatErpDateTime(billingRecord.currentPeriodStart)
          : formatErpDateTime(billingRecord.updatedAt),
        renewsAt: billingRecord.currentPeriodEnd
          ? formatErpDateTime(billingRecord.currentPeriodEnd)
          : undefined,
        providerLinkage: stripeStatus.configured
          ? "Stripe (subscription authority)"
          : "Stripe (configuration incomplete)",
      }
    : {
        organizationId: input.organizationId,
        planKey: stripeStatus.configured ? "trial" : "staged",
        status: "trial",
        seatsPurchased: seatCount,
        seatsUsed: seatCount,
        startsAt: formatErpDateTime(new Date()),
        providerLinkage: stripeStatus.configured
          ? "Stripe — no subscription yet"
          : "Configure STRIPE_* environment variables",
      };

  const entitlements: SystemAdminBillingEntitlementRow[] =
    entitlementRows.map((row) => ({
      id: row.feature,
      key: row.feature,
      label: row.feature,
      status: row.enabled ? "Included" : "Disabled",
      source: "ai_feature_entitlements",
    }));

  const hasActiveStripeSubscription =
    billingRecord?.status === "active" || billingRecord?.status === "trial";

  return {
    subscription,
    aiUsageEventCount: aiUsageEvents.length,
    lynxRunCount: lynxEvalRuns.length,
    gatewaySpendAvailable: gatewaySpend.available,
    gatewaySpendAuthenticationFailed:
      gatewaySpend.authenticationFailed ?? false,
    gatewaySpendEntryCount: gatewaySpend.entries.length,
    gatewayCostUsd,
    entitlements,
    paymentMethodConfigured:
      stripeStatus.configured &&
      Boolean(billingRecord?.stripeSubscriptionId) &&
      hasActiveStripeSubscription,
    marketplaceLinkage: stripeStatus.configured
      ? "Stripe Customer Portal and Checkout"
      : "Stripe not configured",
    stripeConfigured: stripeStatus.configured,
    stripeCustomerId: billingRecord?.stripeCustomerId ?? null,
  };
}

export async function loadBillingInvoiceRows(input: {
  organizationId: string;
}): Promise<SystemAdminBillingInvoiceRow[]> {
  const rows = await listOrganizationBillingInvoices({
    organizationId: input.organizationId,
    limit: 24,
  });

  return rows.map((row) => ({
    id: row.id,
    reference: row.stripeInvoiceId,
    period:
      row.periodStart && row.periodEnd
        ? `${formatErpDateTime(row.periodStart)} – ${formatErpDateTime(row.periodEnd)}`
        : "—",
    amount: `${(row.amountDueCents / 100).toFixed(2)} ${row.currency.toUpperCase()}`,
    status: row.status,
  }));
}

export function buildBillingPaymentRows(input: {
  stripeConfigured: boolean;
  paymentMethodConfigured: boolean;
  stripeCustomerId: string | null;
}): SystemAdminBillingPaymentRow[] {
  if (!input.stripeConfigured) {
    return [];
  }

  return [
    {
      id: "stripe",
      method: "Stripe",
      status: input.paymentMethodConfigured ? "Active subscription" : "Not subscribed",
      lastActivity: input.stripeCustomerId
        ? `Customer ${input.stripeCustomerId}`
        : "No Stripe customer yet",
    },
  ];
}

export {
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  ensureStripeCustomerForOrganization,
  getStripeConfigurationStatus,
};
