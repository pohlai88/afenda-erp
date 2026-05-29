/**
 * Completes local Stripe wiring for Afenda ERP.
 *
 * Prerequisites:
 *   - Plan price IDs in `.env.config` (STRIPE_PRICE_HOBBY, TEAM, PRO, BUSINESS)
 *   - Secret key via ONE of:
 *       • STRIPE_SECRET_KEY in environment for this command
 *       • non-empty STRIPE_SECRET_KEY in `.secret.config`
 *       • `stripe login` (CLI stores test_mode_api_key in config.toml)
 *
 * Usage:
 *   $env:STRIPE_SECRET_KEY="sk_test_…"   # PowerShell
 *   pnpm stripe:setup
 *   pnpm env:sync
 *   pnpm stripe:listen                    # separate terminal
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Stripe = require(
  "../packages/billing/node_modules/stripe/cjs/stripe.cjs.node.js",
).default as typeof import("stripe").default;

const rootDir = resolve(import.meta.dirname, "..");
const secretPath = resolve(rootDir, ".secret.config");
const envConfigPath = resolve(rootDir, ".env.config");
const stripeConfigPath = resolve(homedir(), ".config", "stripe", "config.toml");

const PLAN_ENV_KEYS = [
  "STRIPE_PRICE_HOBBY",
  "STRIPE_PRICE_TEAM",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_BUSINESS",
] as const;

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

function readStripeCliTestApiKey() {
  if (!existsSync(stripeConfigPath)) return undefined;

  const content = readFileSync(stripeConfigPath, "utf8");
  const match = content.match(/test_mode_api_key\s*=\s*"([^"]+)"/);
  return match?.[1]?.trim();
}

function resolveSecretKey() {
  const fromEnv = process.env.STRIPE_SECRET_KEY?.trim();
  if (fromEnv) return fromEnv;

  const fromFile = parseDotenv(secretPath).STRIPE_SECRET_KEY?.trim();
  if (fromFile) return fromFile;

  return readStripeCliTestApiKey();
}

async function upsertSecretConfig(updates: Record<string, string>) {
  const existing = existsSync(secretPath)
    ? (await readFile(secretPath, "utf8")).split(/\r?\n/)
    : [];

  const keys = new Set(Object.keys(updates));
  const filtered = existing.filter((line) => {
    const match = line.match(/^([A-Z0-9_]+)=/);
    return !match?.[1] || !keys.has(match[1]);
  });

  const block = [
    "",
    "# == Stripe (setup-stripe-integration) ==",
    ...Object.entries(updates).map(([key, value]) => `${key}=${value}`),
  ];

  await writeFile(secretPath, [...filtered, ...block].join("\n"), "utf8");
}

function readWebhookSecretFromCli(apiKey: string) {
  const stdout = execSync(
    "stripe listen --print-secret --forward-to localhost:3000/api/webhooks/stripe",
    {
      cwd: rootDir,
      encoding: "utf8",
      env: { ...process.env, STRIPE_API_KEY: apiKey },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  const secret = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith("whsec_"));

  if (!secret) {
    throw new Error("Stripe CLI did not return a webhook signing secret (whsec_…).");
  }

  return secret;
}

async function validatePriceIds(stripe: Stripe, env: Record<string, string>) {
  const results: string[] = [];

  for (const envKey of PLAN_ENV_KEYS) {
    const priceId = env[envKey]?.trim();
    if (!priceId) {
      console.warn(`  skip ${envKey}: not set in .env.config`);
      continue;
    }

    const price = await stripe.prices.retrieve(priceId);
    if (price.type !== "recurring") {
      throw new Error(`${envKey} (${priceId}) is not a recurring price.`);
    }

    results.push(`${envKey}=${priceId} (${price.currency} ${price.unit_amount ?? 0})`);
  }

  return results;
}

async function main() {
  const mergedEnv = {
    ...parseDotenv(envConfigPath),
    ...parseDotenv(secretPath),
  };

  const secretKey = resolveSecretKey();
  if (!secretKey?.startsWith("sk_")) {
    console.error(
      [
        "Missing Stripe secret key.",
        "Set STRIPE_SECRET_KEY in .secret.config or run:",
        "  stripe login",
        "  # or",
        '  $env:STRIPE_SECRET_KEY="sk_test_…"; pnpm stripe:setup',
        "",
        `Dashboard: https://dashboard.stripe.com/${mergedEnv.STRIPE_ACCOUNT_ID ?? "test"}/apikeys`,
      ].join("\n"),
    );
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);
  const account = await stripe.accounts.retrieve();
  console.log(`Stripe account: ${account.id} (${account.settings?.dashboard?.display_name ?? "connected"})`);

  console.log("Validating plan prices from .env.config…");
  const validated = await validatePriceIds(stripe, mergedEnv);
  for (const line of validated) {
    console.log(`  ✓ ${line}`);
  }

  if (validated.length === 0) {
    console.error("No STRIPE_PRICE_* values found in .env.config. Run pnpm stripe:configure first.");
    process.exit(1);
  }

  console.log("Resolving local webhook signing secret via Stripe CLI…");
  const webhookSecret = readWebhookSecretFromCli(secretKey);

  await upsertSecretConfig({
    STRIPE_SECRET_KEY: secretKey,
    STRIPE_WEBHOOK_SECRET: webhookSecret,
  });

  console.log("");
  console.log("Updated .secret.config:");
  console.log("  STRIPE_SECRET_KEY=sk_… (set)");
  console.log(`  STRIPE_WEBHOOK_SECRET=${webhookSecret.slice(0, 12)}…`);
  console.log("");
  console.log("Next:");
  console.log("  pnpm env:sync");
  console.log("  pnpm stripe:status");
  console.log("  pnpm stripe:listen   # keep running");
  console.log("  pnpm dev");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
