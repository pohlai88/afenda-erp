import { execSync } from "node:child_process";

import { loadAfendaEnv } from "./cloudflare/load-afenda-env.mts";
import {
  createCloudflareClient,
  getCloudflareAccountId,
  getCloudflareApiToken,
} from "./cloudflare/cloudflare-client.shared.mts";
import {
  attachR2CustomDomain,
  disableR2ManagedDomain,
  getR2CloudflareSnapshot,
  resolveZoneIdForHostname,
} from "./cloudflare/r2-cloudflare-api.shared.mts";

const rootDir = loadAfendaEnv();

const bucket =
  process.env.OBJECT_STORAGE_BUCKET?.trim() ??
  process.env.R2_BUCKET_NAME?.trim();
const customDomain =
  process.env.R2_PUBLIC_CUSTOM_DOMAIN?.trim() ?? "attachments.nexuscanon.com";
let zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
const minTls = process.env.R2_PUBLIC_DOMAIN_MIN_TLS?.trim() ?? "1.2";
const accountId = getCloudflareAccountId();
const apiToken = getCloudflareApiToken();

if (!bucket) {
  console.error(
    "Missing OBJECT_STORAGE_BUCKET. Set in `.env.config` and run `pnpm env:sync`.",
  );
  process.exit(1);
}

function runWrangler(args: string) {
  execSync(`pnpm exec wrangler ${args}`, {
    cwd: rootDir,
    stdio: "inherit",
  });
}

function runWranglerCapture(args: string) {
  return execSync(`pnpm exec wrangler ${args}`, {
    cwd: rootDir,
    encoding: "utf8",
  }).trim();
}

const publicUrlBase = `https://${customDomain}`;

console.log(`R2 custom domain — bucket: ${bucket}`);
console.log(`Domain: ${customDomain}`);
console.log(`Target OBJECT_STORAGE_PUBLIC_URL_BASE: ${publicUrlBase}`);

async function provisionWithSdk() {
  const client = createCloudflareClient();

  if (!zoneId) {
    zoneId = await resolveZoneIdForHostname(client, customDomain, accountId);
    if (zoneId) {
      console.log(`Resolved CLOUDFLARE_ZONE_ID from API: ${zoneId}`);
    }
  }

  if (!zoneId) {
    const snapshot = await getR2CloudflareSnapshot(client, bucket, accountId);
    console.error(
      [
        "Missing CLOUDFLARE_ZONE_ID and no matching zone in Cloudflare.",
        "",
        `Account zones (${snapshot.zones.length}): ${
          snapshot.zones.length
            ? snapshot.zones.map((zone) => `${zone.name} (${zone.id})`).join(", ")
            : "none"
        }`,
        "",
        "Add nexuscanon.com to Cloudflare, then set CLOUDFLARE_ZONE_ID in `.env.config`:",
        "  https://dash.cloudflare.com/?to=/:account/domains/add",
        "",
        "Re-run: pnpm r2:domain:provision",
      ].join("\n"),
    );
    process.exit(1);
  }

  const before = await getR2CloudflareSnapshot(client, bucket, accountId);
  const alreadyAttached = before.customDomains.some(
    (entry) => entry.domain === customDomain,
  );

  if (!alreadyAttached) {
    console.log(`Attaching custom domain via Cloudflare API (${customDomain})...`);
    await attachR2CustomDomain({
      client,
      accountId,
      bucket,
      domain: customDomain,
      zoneId,
      minTls,
    });
  } else {
    console.log(`Custom domain ${customDomain} already connected.`);
  }

  const afterAttach = await getR2CloudflareSnapshot(client, bucket, accountId);
  console.log(
    JSON.stringify(
      {
        customDomains: afterAttach.customDomains,
        managedDomainBefore: before.managedDomain,
      },
      null,
      2,
    ),
  );

  console.log("Disabling r2.dev public development URL (use custom domain in production)...");
  try {
    await disableR2ManagedDomain({ client, accountId, bucket });
  } catch (error) {
    console.warn(
      `r2.dev disable skipped: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const after = await getR2CloudflareSnapshot(client, bucket, accountId);
  console.log(
    JSON.stringify(
      {
        customDomains: after.customDomains,
        managedDomain: after.managedDomain,
      },
      null,
      2,
    ),
  );
}

async function provisionWithWrangler() {
  if (!zoneId) {
    console.error(
      [
        "Missing CLOUDFLARE_ZONE_ID.",
        "",
        "Set CLOUDFLARE_API_TOKEN in `.secret.config` for SDK auto-resolve, or add zone id manually.",
        "Add nexuscanon.com to Cloudflare first:",
        "  https://dash.cloudflare.com/?to=/:account/domains/add",
        "",
        "Then: CLOUDFLARE_ZONE_ID=<zone_id> in `.env.config`",
        "Re-run: pnpm r2:domain:provision",
      ].join("\n"),
    );
    process.exit(1);
  }

  console.log(`Zone: ${zoneId} (wrangler fallback)`);

  try {
    runWrangler("whoami");
  } catch {
    console.error("Run `pnpm exec wrangler login` then retry.");
    process.exit(1);
  }

  const existing = runWranglerCapture(`r2 bucket domain list ${bucket}`);

  if (!existing.includes(customDomain)) {
    runWrangler(
      `r2 bucket domain add ${bucket} --domain ${customDomain} --zone-id ${zoneId} --min-tls ${minTls} --force`,
    );
  } else {
    console.log(`Custom domain ${customDomain} already connected.`);
  }

  runWrangler(`r2 bucket domain list ${bucket}`);
  runWrangler(`r2 bucket domain get ${bucket} --domain ${customDomain}`);

  console.log("Disabling r2.dev public development URL...");
  try {
    runWrangler(`r2 bucket dev-url disable ${bucket} --force`);
  } catch {
    console.warn("r2.dev disable skipped (may already be disabled).");
  }
}

try {
  if (apiToken) {
    await provisionWithSdk();
  } else {
    console.warn(
      "CLOUDFLARE_API_TOKEN not set — falling back to wrangler CLI. Prefer SDK: add token to `.secret.config`.",
    );
    await provisionWithWrangler();
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

console.log(
  [
    "",
    "Custom domain provision complete.",
    `Set in .env.config: OBJECT_STORAGE_PUBLIC_URL_BASE=${publicUrlBase}`,
    zoneId ? `Optional: CLOUDFLARE_ZONE_ID=${zoneId}` : "",
    "Then: pnpm env:sync && pnpm r2:verify",
    "",
    "If apex DNS stays on Vercel, confirm attachments CNAME in Cloudflare DNS",
    "matches the record created for this R2 bucket.",
  ]
    .filter(Boolean)
    .join("\n"),
);
