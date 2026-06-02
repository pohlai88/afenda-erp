import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { getObjectStorageEnv } from "../../config/src/env.ts";
import { loadAfendaEnv } from "./load-afenda-env.mts";

const repoRoot = loadAfendaEnv();
const packageRoot = resolve(repoRoot, "packages/object-storage");

const storageEnv = getObjectStorageEnv();

const keyPresence = {
  OBJECT_STORAGE_PROVIDER: Boolean(
    process.env.OBJECT_STORAGE_PROVIDER?.trim(),
  ),
  OBJECT_STORAGE_ENDPOINT: Boolean(
    process.env.OBJECT_STORAGE_ENDPOINT?.trim() ??
      process.env.R2_ENDPOINT?.trim() ??
      process.env.R2_ACCOUNT_ID?.trim(),
  ),
  OBJECT_STORAGE_BUCKET: Boolean(
    process.env.OBJECT_STORAGE_BUCKET?.trim() ??
      process.env.R2_BUCKET_NAME?.trim(),
  ),
  OBJECT_STORAGE_ACCESS_KEY_ID: Boolean(
    process.env.OBJECT_STORAGE_ACCESS_KEY_ID?.trim() ??
      process.env.R2_ACCESS_KEY_ID?.trim(),
  ),
  OBJECT_STORAGE_SECRET_ACCESS_KEY: Boolean(
    process.env.OBJECT_STORAGE_SECRET_ACCESS_KEY?.trim() ??
      process.env.R2_SECRET_ACCESS_KEY?.trim(),
  ),
  BLOB_READ_WRITE_TOKEN: Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()),
};

const report: Record<string, unknown> = {
  filesLoaded: [
    ".env.config",
    ".env.local",
    "apps/erp/.env.local",
    ".secret.config",
  ],
  keyPresence,
  resolved: {
    provider: storageEnv.provider,
    configured: storageEnv.configured,
    bucket:
      storageEnv.provider === "r2" && storageEnv.configured
        ? storageEnv.r2?.bucket
        : undefined,
    endpoint:
      storageEnv.provider === "r2" && storageEnv.configured
        ? storageEnv.r2?.endpoint
        : undefined,
    publicUrlBase:
      storageEnv.provider === "r2" && storageEnv.configured
        ? storageEnv.r2?.publicUrlBase ?? null
        : undefined,
  },
  hints: [] as string[],
};

if (!storageEnv.configured) {
  report.hints = [
    "Object storage is not configured. For R2: set OBJECT_STORAGE_PROVIDER=r2, endpoint, bucket, and API keys in `.env.config` / `.secret.config`, then `pnpm env:sync`.",
    "Legacy R2_* keys are aliased to OBJECT_STORAGE_* by @afenda/config/env.",
  ];
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = 1;
  process.exit();
}

if (storageEnv.provider === "r2" && storageEnv.r2) {
  try {
    const output = execSync("pnpm exec tsx scripts/verify-r2-s3-api.mts", {
      cwd: packageRoot,
      env: process.env,
      encoding: "utf8",
    });
    report.r2HeadBucket = JSON.parse(output.trim().split("\n").at(-1)!);
  } catch (error) {
    report.r2HeadBucket = {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
    report.hints = [
      "R2 credentials or bucket name failed HeadBucket. Confirm bucket exists and API token has Object Read & Write on the bucket.",
      "Apply browser CORS with `pnpm r2:provision` after `pnpm exec wrangler login`.",
    ];
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    process.exit();
  }

  if (!storageEnv.r2.publicUrlBase) {
    report.hints = [
      "Private R2 uploads are ready (presign → PUT → complete).",
      "CORS should include dev + production origins — check with `pnpm r2:status` or Cloudflare MCP.",
      "For access=public: enable r2.dev/custom domain in Cloudflare, set OBJECT_STORAGE_PUBLIC_URL_BASE.",
    ];
  } else {
    report.hints = [
      "R2 S3 API credentials verified.",
      "Run `pnpm r2:provision` to apply or refresh bucket CORS via wrangler.",
    ];
  }
} else if (storageEnv.provider === "vercel-blob") {
  report.hints = [
    "Vercel Blob is active. Switch to R2 with OBJECT_STORAGE_PROVIDER=r2 and R2 credentials.",
  ];
}

console.log(JSON.stringify(report, null, 2));
