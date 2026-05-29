/**
 * Post-`stripe login` setup for Afenda local billing.
 *
 * Usage:
 *   stripe login
 *   pnpm stripe:configure
 *   pnpm env:sync
 *
 * Then keep `pnpm stripe:listen` running while developing.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const secretPath = resolve(rootDir, ".secret.config");
const stripeConfigPath = resolve(homedir(), ".config", "stripe", "config.toml");

function runStripe(command: string) {
  return execSync(`stripe ${command}`, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function parseJson<T>(stdout: string): T {
  return JSON.parse(stdout) as T;
}

function upsertSecretConfig(updates: Record<string, string>) {
  const lines = existsSync(secretPath)
    ? readFile(secretPath, { encoding: "utf8" }).then((content) =>
        content.split(/\r?\n/),
      )
    : Promise.resolve([] as string[]);

  return lines.then((existing) => {
    const keys = new Set(Object.keys(updates));
    const filtered = existing.filter((line) => {
      const match = line.match(/^([A-Z0-9_]+)=/);
      return !match?.[1] || !keys.has(match[1]);
    });

    const block = [
      "",
      "# == Stripe (CLI configure) ==",
      "# sk_test from https://dashboard.stripe.com/test/apikeys",
      ...Object.entries(updates).map(([key, value]) => `${key}=${value}`),
    ];

    return writeFile(secretPath, [...filtered, ...block].join("\n"), "utf8");
  });
}

async function main() {
  if (!existsSync(stripeConfigPath)) {
    console.error(
      [
        "Stripe CLI is not logged in.",
        "Run: stripe login",
        "Then: pnpm stripe:configure",
      ].join("\n"),
    );
    process.exit(1);
  }

  console.log("Stripe CLI session found.");

  const product = parseJson<{ id: string }>(
    runStripe(
      'products create --name="Afenda ERP" --description="Per-organization subscription" --format=json',
    ),
  );

  const price = parseJson<{ id: string }>(
    runStripe(
      `prices create --product=${product.id} --currency=usd --unit-amount=4900 --recurring.interval=month --format=json`,
    ),
  );

  const webhookSecret = runStripe(
    "listen --print-secret --forward-to localhost:3000/api/webhooks/stripe",
  ).split(/\r?\n/).pop()?.trim();

  if (!webhookSecret?.startsWith("whsec_")) {
    throw new Error("Could not read webhook signing secret from Stripe CLI.");
  }

  await upsertSecretConfig({
    STRIPE_PRICE_ID: price.id,
    STRIPE_WEBHOOK_SECRET: webhookSecret,
  });

  console.log("");
  console.log("Updated .secret.config:");
  console.log(`  STRIPE_PRICE_ID=${price.id}`);
  console.log(`  STRIPE_WEBHOOK_SECRET=${webhookSecret.slice(0, 12)}…`);
  console.log("");
  console.log("Add your test secret key manually (Dashboard → Developers → API keys):");
  console.log("  STRIPE_SECRET_KEY=sk_test_…");
  console.log("");
  console.log("Optional publishable key for future client Elements:");
  console.log("  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…");
  console.log("");
  console.log("Then:");
  console.log("  pnpm env:sync");
  console.log("  pnpm stripe:listen   # keep running in a second terminal");
  console.log("  pnpm dev");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
