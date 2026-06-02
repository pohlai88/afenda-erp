import { execSync } from "node:child_process";

import { getObjectStorageEnv } from "../packages/config/src/env.ts";
import { loadAfendaEnv } from "./cloudflare/load-afenda-env.mts";
import {
  createCloudflareClient,
  getCloudflareAccountId,
  getCloudflareApiToken,
} from "./cloudflare/cloudflare-client.shared.mts";
import { getR2CloudflareSnapshot } from "./cloudflare/r2-cloudflare-api.shared.mts";

const rootDir = loadAfendaEnv();

const storageEnv = getObjectStorageEnv();
const bucket =
  storageEnv.provider === "r2" && storageEnv.configured
    ? storageEnv.r2?.bucket
    : undefined;

if (!bucket) {
  console.log(
    JSON.stringify(
      {
        configured: false,
        hints: ["R2 is not configured. Run `pnpm r2:verify` first."],
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
  process.exit();
}

function runWrangler(args: string) {
  return execSync(`pnpm exec wrangler ${args}`, {
    cwd: rootDir,
    encoding: "utf8",
  }).trim();
}

let whoamiOk = false;
let bucketInfo = "";
let corsList = "";

try {
  runWrangler("whoami");
  whoamiOk = true;
} catch {
  whoamiOk = false;
}

try {
  bucketInfo = runWrangler(`r2 bucket info ${bucket}`);
} catch (error) {
  bucketInfo =
    error instanceof Error ? error.message : "Failed to read bucket info";
}

try {
  corsList = runWrangler(`r2 bucket cors list ${bucket}`);
} catch (error) {
  corsList =
    error instanceof Error ? error.message : "Failed to read bucket CORS";
}

let sdk: Awaited<ReturnType<typeof getR2CloudflareSnapshot>> | null = null;
let sdkError: string | null = null;
const apiTokenPresent = Boolean(getCloudflareApiToken());

if (apiTokenPresent) {
  try {
    const client = createCloudflareClient();
    sdk = await getR2CloudflareSnapshot(
      client,
      bucket,
      getCloudflareAccountId(),
    );
  } catch (error) {
    sdkError = error instanceof Error ? error.message : String(error);
  }
}

const report = {
  configured: true,
  bucket,
  endpoint: storageEnv.r2?.endpoint,
  publicUrlBase: storageEnv.r2?.publicUrlBase ?? null,
  wranglerAuthenticated: whoamiOk,
  bucketInfo,
  corsList,
  cloudflareSdk: apiTokenPresent
    ? {
        accountId: getCloudflareAccountId(),
        snapshot: sdk,
        error: sdkError,
      }
    : {
        configured: false,
        hints: [
          "Set CLOUDFLARE_API_TOKEN in `.secret.config` for SDK status (same token as wrangler).",
          "Run `pnpm r2:cloudflare:verify` after adding the token.",
        ],
      },
  cloudflareMcp: {
    bindingsTools: [
      "r2_buckets_list",
      "r2_bucket_get",
      "set_active_account",
    ],
    executeTools: ["search", "execute"],
    executeExamples: [
      "GET /accounts/{accountId}/r2/buckets/{bucket}/cors",
      "GET /accounts/{accountId}/r2/buckets/{bucket}/domains/custom",
      "GET /accounts/{accountId}/r2/buckets/{bucket}/domains/managed",
      "PUT /accounts/{accountId}/r2/buckets/{bucket}/domains/managed { enabled: false }",
    ],
  },
  hints: [
    ...(whoamiOk
      ? [
          "Reconcile CORS with `pnpm r2:provision` after changing NEXT_PUBLIC_SITE_URL or R2_CORS_EXTRA_ORIGINS.",
        ]
      : [
          "Run `pnpm exec wrangler login` or set CLOUDFLARE_API_TOKEN for wrangler status.",
        ]),
    ...(sdk?.managedDomain?.enabled
      ? [
          "r2.dev is enabled — disable with `pnpm r2:domain:provision` after custom domain is attached.",
        ]
      : []),
    ...(sdk && sdk.zones.length === 0
      ? [
          "No Cloudflare zones on this account — add nexuscanon.com before attaching attachments.nexuscanon.com.",
        ]
      : []),
    "Cloudflare MCP `cloudflare` → `execute` mirrors the official cloudflare-typescript SDK paths.",
  ],
};

console.log(JSON.stringify(report, null, 2));

if (!whoamiOk && !apiTokenPresent) {
  process.exitCode = 1;
}
