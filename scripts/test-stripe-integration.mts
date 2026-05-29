/**
 * Smoke test: Stripe account, configured prices, and optional Checkout session.
 * Usage: pnpm stripe:test
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadStripeScriptClient } from "./stripe-script-client.shared.mts";
import { getStripeConfigurationStatus } from "../packages/billing/src/stripe-config.shared.ts";
import {
  listStripeBillingPlans,
  resolveStripeBillingPlanKeyFromPriceId,
  resolveStripeBillingPlanPriceId,
} from "../packages/billing/src/stripe-plans.shared.ts";

const rootDir = resolve(import.meta.dirname, "..");

function parseDotenv(path: string) {
  if (!existsSync(path)) return {} as Record<string, string>;
  const env: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex <= 0) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const merged = {
  ...parseDotenv(resolve(rootDir, ".env.config")),
  ...parseDotenv(resolve(rootDir, ".secret.config")),
};

for (const [key, value] of Object.entries(merged)) {
  if (value) process.env[key] = value;
}

const status = getStripeConfigurationStatus();
if (!status.configured) {
  console.error("Stripe is not fully configured. Run pnpm stripe:setup first.");
  process.exit(1);
}

const plans = listStripeBillingPlans();
console.log(`Configured plans: ${plans.map((plan) => plan.key).join(", ")}`);

for (const plan of plans) {
  const roundTrip = resolveStripeBillingPlanKeyFromPriceId(plan.priceId);
  if (roundTrip !== plan.key) {
    throw new Error(`Plan key round-trip failed for ${plan.key} → ${roundTrip}`);
  }
}

const stripe = loadStripeScriptClient(process.env.STRIPE_SECRET_KEY!);
const account = await stripe.accounts.retrieve();
console.log(`Account ${account.id} OK`);

for (const plan of plans) {
  const price = await stripe.prices.retrieve(plan.priceId);
  console.log(`  price ${plan.key}: ${price.id} (${price.currency} ${price.unit_amount})`);
}

const proPriceId = resolveStripeBillingPlanPriceId("pro");
const customer = await stripe.customers.create({
  name: "Afenda Stripe integration test",
  metadata: { integrationTest: "true", organizationId: "org_test_stripe" },
});

const session = await stripe.checkout.sessions.create({
  mode: "subscription",
  customer: customer.id,
  line_items: [{ price: proPriceId, quantity: 1 }],
  success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/system-admin/billing?checkout=success`,
  cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/system-admin/billing?checkout=cancelled`,
  metadata: {
    organizationId: "org_test_stripe",
    planKey: "pro",
  },
});

if (!session.url) {
  throw new Error("Checkout session missing URL.");
}

console.log("Checkout session created (not opened):", session.id);
console.log("Stripe integration smoke test passed.");
