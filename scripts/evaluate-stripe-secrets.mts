/**
 * Evaluates Stripe keys in .secret.config (prints formats only, never full values).
 * Usage: pnpm stripe:evaluate
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const rootDir = resolve(import.meta.dirname, "..");
const secretPath = resolve(rootDir, ".secret.config");

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

function mask(value: string) {
  if (value.length <= 12) return "(too short)";
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

function classifyStripeKey(value: string | undefined) {
  if (!value?.trim()) return { status: "missing", detail: "not set" } as const;
  const v = value.trim();
  if (v.startsWith("sk_test_")) return { status: "ok", detail: "test secret key (server SDK)" } as const;
  if (v.startsWith("sk_live_")) return { status: "ok", detail: "live secret key (server SDK)" } as const;
  if (v.startsWith("pk_test_")) return { status: "ok", detail: "test publishable key (client)" } as const;
  if (v.startsWith("pk_live_")) return { status: "ok", detail: "live publishable key (client)" } as const;
  if (v.startsWith("whsec_")) return { status: "ok", detail: "webhook signing secret" } as const;
  if (v.startsWith("mk_"))
    return {
      status: "invalid_for_sdk",
      detail: "restricted/CLI key — not valid for @afenda/billing server SDK",
    } as const;
  if (v.startsWith("rk_"))
    return { status: "warn", detail: "restricted key — limited API scope" } as const;
  return { status: "warn", detail: "unrecognized Stripe key prefix" } as const;
}

const secrets = parseDotenv(secretPath);
const keysToCheck = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_CLI_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
] as const;

console.log("Stripe secret evaluation (.secret.config)");
console.log("────────────────────────────────────────");

for (const key of keysToCheck) {
  const value = secrets[key];
  const kind = classifyStripeKey(value);
  const label =
    kind.status === "ok"
      ? "OK"
      : kind.status === "missing"
        ? "MISSING"
        : kind.status === "invalid_for_sdk"
          ? "WRONG USE"
          : "WARN";

  console.log(`  ${key}`);
  console.log(`    ${label}: ${kind.detail}`);
  if (value) console.log(`    mask: ${mask(value)}`);
}

const sk = secrets.STRIPE_SECRET_KEY?.trim();
if (sk?.startsWith("sk_")) {
  const require = createRequire(import.meta.url);
  const Stripe = require(
    "../packages/billing/node_modules/stripe/cjs/stripe.cjs.node.js",
  ).default as typeof import("stripe").default;

  try {
    const stripe = new Stripe(sk);
    const account = await stripe.accounts.retrieve();
    console.log("");
    console.log(`  API probe: connected to ${account.id}`);
  } catch (error) {
    console.log("");
    console.log(
      `  API probe: FAILED — ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }
}

console.log("");
console.log("Afenda runtime uses: STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET (+ plan prices in .env.config).");
