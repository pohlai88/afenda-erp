import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Cloudflare from "cloudflare";

import { loadAfendaEnv } from "./load-afenda-env.mts";

const DEFAULT_ACCOUNT_ID = "c4a3b29bfa877132a1f16c5c628dc8a2";

export function getCloudflareAccountId(): string {
  const fromEnv =
    process.env.CLOUDFLARE_ACCOUNT_ID?.trim() ??
    process.env.R2_ACCOUNT_ID?.trim() ??
    process.env.OBJECT_STORAGE_ACCOUNT_ID?.trim();

  if (fromEnv) return fromEnv;

  const rootDir = loadAfendaEnv();
  try {
    const wranglerRaw = readFileSync(resolve(rootDir, "wrangler.jsonc"), "utf8");
    const match = wranglerRaw.match(/"account_id"\s*:\s*"([^"]+)"/);
    if (match?.[1]) return match[1];
  } catch {
    // wrangler.jsonc optional for scripts that only need token auth
  }

  return DEFAULT_ACCOUNT_ID;
}

export function getCloudflareApiToken(): string | undefined {
  loadAfendaEnv();
  return process.env.CLOUDFLARE_API_TOKEN?.trim();
}

export function createCloudflareClient(): Cloudflare {
  const apiToken = getCloudflareApiToken();
  if (!apiToken) {
    throw new Error(
      "Missing CLOUDFLARE_API_TOKEN. Create an API token with R2 + Zone permissions in `.secret.config`, then `pnpm env:sync:all`.",
    );
  }

  return new Cloudflare({ apiToken });
}

export function apexDomainFromHostname(hostname: string): string {
  const labels = hostname.trim().toLowerCase().split(".").filter(Boolean);
  if (labels.length < 2) {
    throw new Error(`Invalid hostname for zone lookup: ${hostname}`);
  }
  return labels.slice(-2).join(".");
}
