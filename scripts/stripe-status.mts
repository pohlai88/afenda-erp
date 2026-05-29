/**
 * Prints Stripe env readiness (no secret values).
 * Usage: pnpm stripe:status
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getStripeConfigurationStatus } from "../packages/billing/src/stripe-config.shared.ts";
import { listStripeBillingPlans } from "../packages/billing/src/stripe-plans.shared.ts";

const rootDir = resolve(import.meta.dirname, "..");

function parseDotenv(path: string): Record<string, string> {
  if (!existsSync(path)) return {};

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

console.log("Stripe configuration status");
console.log("────────────────────────────");
console.log(`  configured:       ${status.configured}`);
console.log(`  STRIPE_SECRET_KEY:        ${status.hasSecretKey ? "set" : "missing"}`);
console.log(
  `  STRIPE_WEBHOOK_SECRET:    ${status.hasWebhookSecret ? "set" : "missing"}`,
);
console.log(`  STRIPE_PRICE_ID:          ${status.hasPriceId ? "set" : "missing"}`);
console.log(
  `  configured plans:         ${listStripeBillingPlans().map((plan) => plan.key).join(", ") || "none"}`,
);
console.log(
  `  NEXT_PUBLIC_SITE_URL:     ${status.hasSiteUrl ? merged.NEXT_PUBLIC_SITE_URL ?? "set" : "missing"}`,
);

if (!status.configured) {
  console.log("");
  console.log("Next steps:");
  console.log("  1. stripe login");
  console.log("  2. pnpm stripe:configure");
  console.log("  3. Add STRIPE_SECRET_KEY=sk_test_… to .secret.config");
  console.log("  4. pnpm env:sync && pnpm stripe:listen  # separate terminal");
  process.exit(1);
}

console.log("");
console.log("Ready for local checkout, portal, and webhooks.");
