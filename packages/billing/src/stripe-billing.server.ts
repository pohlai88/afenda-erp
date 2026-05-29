import {
  getOrganizationBillingByOrganizationId,
  getOrganizationBillingByStripeCustomerId,
  getOrganizationProfile,
  insertOrganizationBilling,
  listOrganizationBillingInvoices,
  upsertOrganizationBillingFromStripe,
  upsertOrganizationBillingInvoice,
} from "@afenda/db";
import Stripe from "stripe";
import {
  readBillingSiteUrl,
  readStripePriceId,
  readStripeSecretKey,
  readStripeWebhookSecret,
} from "./stripe-config.shared";
import { resolveStripeBillingPlanKeyFromPriceId } from "./stripe-plans.shared";

export { getStripeConfigurationStatus, type StripeConfigurationStatus } from "./stripe-config.shared";

type OrganizationSubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "suspended"
  | "cancelled";

let stripeClient: Stripe | null = null;

function getStripeClient() {
  if (!stripeClient) {
    stripeClient = new Stripe(readStripeSecretKey());
  }

  return stripeClient;
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): OrganizationSubscriptionStatus {
  switch (status) {
    case "trialing":
      return "trial";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "cancelled";
    case "unpaid":
    case "paused":
    case "incomplete":
    case "incomplete_expired":
      return "suspended";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

function resolvePlanKeyFromSubscription(subscription: Stripe.Subscription) {
  const price = subscription.items.data[0]?.price;
  const priceId = price?.id;
  if (priceId) {
    return resolveStripeBillingPlanKeyFromPriceId(priceId);
  }

  const nickname = price?.nickname;
  if (nickname) {
    return nickname.toLowerCase().replace(/\s+/g, "-");
  }

  return "subscription";
}

function resolveOrganizationIdFromStripeObject(
  metadata: Stripe.Metadata | null | undefined,
) {
  const organizationId = metadata?.organizationId;
  if (!organizationId) {
    throw new Error("Stripe object is missing metadata.organizationId.");
  }

  return organizationId;
}

function resolveSubscriptionPeriodDates(subscription: Stripe.Subscription) {
  const period = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };

  const startUnix =
    period.current_period_start ?? subscription.start_date ?? subscription.created;
  const endUnix = period.current_period_end ?? null;

  return {
    currentPeriodStart: new Date(startUnix * 1000),
    currentPeriodEnd: endUnix ? new Date(endUnix * 1000) : null,
  };
}

async function syncSubscriptionToDatabase(input: {
  organizationId: string;
  stripeCustomerId: string;
  subscription: Stripe.Subscription;
}) {
  const seatsPurchased =
    input.subscription.items.data[0]?.quantity ?? 1;
  const period = resolveSubscriptionPeriodDates(input.subscription);

  await upsertOrganizationBillingFromStripe({
    organizationId: input.organizationId,
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.subscription.id,
    planKey: resolvePlanKeyFromSubscription(input.subscription),
    status: mapStripeSubscriptionStatus(input.subscription.status),
    seatsPurchased,
    currentPeriodStart: period.currentPeriodStart,
    currentPeriodEnd: period.currentPeriodEnd,
  });
}

function mapStripeInvoiceStatus(
  status: Stripe.Invoice.Status | null,
): "draft" | "open" | "paid" | "void" | "uncollectible" {
  if (
    status === "open" ||
    status === "paid" ||
    status === "void" ||
    status === "uncollectible"
  ) {
    return status;
  }

  return "draft";
}

async function syncInvoiceToDatabase(input: {
  organizationId: string;
  invoice: Stripe.Invoice;
}) {
  const status = mapStripeInvoiceStatus(input.invoice.status);

  await upsertOrganizationBillingInvoice({
    organizationId: input.organizationId,
    stripeInvoiceId: input.invoice.id,
    status,
    amountDueCents: input.invoice.amount_due ?? 0,
    currency: input.invoice.currency ?? "usd",
    periodStart: input.invoice.period_start
      ? new Date(input.invoice.period_start * 1000)
      : null,
    periodEnd: input.invoice.period_end
      ? new Date(input.invoice.period_end * 1000)
      : null,
    hostedInvoiceUrl: input.invoice.hosted_invoice_url ?? null,
  });
}

export async function ensureStripeCustomerForOrganization(input: {
  organizationId: string;
  organizationSlug: string;
}) {
  const existing = await getOrganizationBillingByOrganizationId({
    organizationId: input.organizationId,
  });

  if (existing) {
    return existing.stripeCustomerId;
  }

  const profile = await getOrganizationProfile({
    organizationId: input.organizationId,
  });
  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    name: profile?.name ?? input.organizationSlug,
    metadata: {
      organizationId: input.organizationId,
    },
  });

  await insertOrganizationBilling({
    organizationId: input.organizationId,
    stripeCustomerId: customer.id,
    planKey: "trial",
    status: "trial",
  });

  return customer.id;
}

export async function createStripeCheckoutSession(input: {
  organizationId: string;
  organizationSlug: string;
  seatQuantity: number;
  planKey?: string;
}) {
  const stripe = getStripeClient();
  const siteUrl = readBillingSiteUrl();
  const priceId = readStripePriceId(input.planKey);
  const customerId = await ensureStripeCustomerForOrganization(input);

  const resolvedPlanKey =
    input.planKey ??
    resolveStripeBillingPlanKeyFromPriceId(priceId);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: Math.max(1, input.seatQuantity),
      },
    ],
    success_url: `${siteUrl}/system-admin/billing?checkout=success`,
    cancel_url: `${siteUrl}/system-admin/billing?checkout=cancelled`,
    metadata: {
      organizationId: input.organizationId,
      planKey: resolvedPlanKey,
    },
    subscription_data: {
      metadata: {
        organizationId: input.organizationId,
        planKey: resolvedPlanKey,
      },
    },
  });

  if (!session.url) {
    throw new Error("Stripe Checkout did not return a redirect URL.");
  }

  return { url: session.url };
}

export async function createStripeBillingPortalSession(input: {
  organizationId: string;
  organizationSlug: string;
}) {
  const stripe = getStripeClient();
  const siteUrl = readBillingSiteUrl();
  const customerId = await ensureStripeCustomerForOrganization(input);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${siteUrl}/system-admin/billing`,
  });

  return { url: session.url };
}

export async function processStripeWebhookEvent(input: {
  rawBody: string;
  signature: string;
}) {
  const stripe = getStripeClient();
  const event = stripe.webhooks.constructEvent(
    input.rawBody,
    input.signature,
    readStripeWebhookSecret(),
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || !session.subscription) {
        break;
      }

      const organizationId = resolveOrganizationIdFromStripeObject(
        session.metadata,
      );
      const subscription = await stripe.subscriptions.retrieve(
        String(session.subscription),
      );
      const customerId = String(session.customer);

      await syncSubscriptionToDatabase({
        organizationId,
        stripeCustomerId: customerId,
        subscription,
      });
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      let organizationId: string | undefined;
      try {
        organizationId = resolveOrganizationIdFromStripeObject(
          subscription.metadata,
        );
      } catch {
        organizationId = (
          await getOrganizationBillingByStripeCustomerId({
            stripeCustomerId: String(subscription.customer),
          })
        )?.organizationId;
      }

      if (!organizationId) {
        throw new Error(
          `Unable to resolve organization for subscription ${subscription.id}.`,
        );
      }

      await syncSubscriptionToDatabase({
        organizationId,
        stripeCustomerId: String(subscription.customer),
        subscription,
      });
      break;
    }
    case "invoice.paid":
    case "invoice.payment_failed":
    case "invoice.finalized": {
      const invoice = event.data.object as Stripe.Invoice;
      let organizationId: string | undefined;
      try {
        organizationId = resolveOrganizationIdFromStripeObject(invoice.metadata);
      } catch {
        organizationId = invoice.customer
          ? (
              await getOrganizationBillingByStripeCustomerId({
                stripeCustomerId: String(invoice.customer),
              })
            )?.organizationId
          : undefined;
      }

      if (!organizationId) {
        break;
      }

      await syncInvoiceToDatabase({ organizationId, invoice });
      break;
    }
    default:
      break;
  }

  return { received: true, type: event.type };
}

export async function listStripeBackedInvoices(input: {
  organizationId: string;
}) {
  return listOrganizationBillingInvoices({
    organizationId: input.organizationId,
    limit: 24,
  });
}
