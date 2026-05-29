import { z } from "zod";
import {
  listStripeBillingPlans,
  resolveStripeBillingPlanPriceId,
} from "./stripe-plans.shared";

const stripeEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PRICE_ID: z.string().min(1).optional(),
  STRIPE_DEFAULT_PLAN_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export type StripeConfigurationStatus = {
  configured: boolean;
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
  hasPriceId: boolean;
  hasSiteUrl: boolean;
};

export function getStripeConfigurationStatus(): StripeConfigurationStatus {
  const env = stripeEnvSchema.safeParse(process.env);
  const parsed = env.success ? env.data : {};

  const hasSecretKey = Boolean(parsed.STRIPE_SECRET_KEY);
  const hasWebhookSecret = Boolean(parsed.STRIPE_WEBHOOK_SECRET);
  const hasPriceId =
    listStripeBillingPlans().length > 0 || Boolean(parsed.STRIPE_PRICE_ID);
  const hasSiteUrl = Boolean(parsed.NEXT_PUBLIC_SITE_URL);

  return {
    configured: hasSecretKey && hasWebhookSecret && hasPriceId && hasSiteUrl,
    hasSecretKey,
    hasWebhookSecret,
    hasPriceId,
    hasSiteUrl,
  };
}

export function readStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return key;
}

export function readStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }

  return secret;
}

export function readStripePriceId(planKey?: string) {
  if (planKey) {
    return resolveStripeBillingPlanPriceId(planKey);
  }

  const plans = listStripeBillingPlans();
  if (plans[0]) {
    return plans[0].priceId;
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error(
      "No Stripe price configured. Set STRIPE_PRICE_* or STRIPE_PRICE_ID.",
    );
  }

  return priceId;
}

export function readBillingSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not configured.");
  }

  return siteUrl.replace(/\/$/, "");
}
