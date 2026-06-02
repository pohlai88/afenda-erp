import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { loadAfendaEnv } from "./cloudflare/load-afenda-env.mts";
import {
  createCloudflareClient,
  getCloudflareAccountId,
  getCloudflareApiToken,
} from "./cloudflare/cloudflare-client.shared.mts";
import { setR2BucketCors } from "./cloudflare/r2-cloudflare-api.shared.mts";

const rootDir = loadAfendaEnv();

const bucket =
  process.env.OBJECT_STORAGE_BUCKET?.trim() ??
  process.env.R2_BUCKET_NAME?.trim();

if (!bucket) {
  console.error(
    "Missing OBJECT_STORAGE_BUCKET (or legacy R2_BUCKET_NAME). Set in `.env.config` and run `pnpm env:sync`.",
  );
  process.exitCode = 1;
  process.exit();
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const extraOrigins =
  process.env.R2_CORS_EXTRA_ORIGINS?.split(",").flatMap((value) => {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }) ?? [];
const origins = Array.from(
  new Set(
    [
      siteUrl,
      ...extraOrigins,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter((value): value is string => Boolean(value?.trim())),
  ),
);

const corsConfig = {
  rules: [
    {
      allowed: {
        origins,
        methods: ["PUT", "GET", "HEAD"],
        headers: ["Content-Type", "Content-Length"],
      },
      exposeHeaders: ["ETag"],
      maxAgeSeconds: 3600,
    },
  ],
};

const corsPath = resolve(
  rootDir,
  "packages/object-storage/src/r2/policies/cors.generated.json",
);
writeFileSync(corsPath, `${JSON.stringify(corsConfig, null, 2)}\n`);

function runWrangler(args: string) {
  execSync(`pnpm exec wrangler ${args}`, {
    cwd: rootDir,
    stdio: "inherit",
  });
}

console.log(`R2 provision — bucket: ${bucket}`);
console.log(`CORS origins: ${origins.join(", ")}`);

const apiToken = getCloudflareApiToken();

if (apiToken) {
  try {
    const client = createCloudflareClient();
    await setR2BucketCors({
      client,
      accountId: getCloudflareAccountId(),
      bucket,
      rules: corsConfig.rules,
    });
    console.log("CORS applied via Cloudflare API (cloudflare-typescript SDK).");
  } catch (error) {
    console.warn(
      `SDK CORS apply failed, falling back to wrangler: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    applyCorsWithWrangler();
  }
} else {
  applyCorsWithWrangler();
}

function applyCorsWithWrangler() {
  try {
    runWrangler("whoami");
  } catch {
    console.error(
      "Wrangler is not authenticated. Run `pnpm exec wrangler login` or set CLOUDFLARE_API_TOKEN, then retry `pnpm r2:provision`.",
    );
    process.exitCode = 1;
    process.exit();
  }

  runWrangler(`r2 bucket info ${bucket}`);
  runWrangler(`r2 bucket cors set ${bucket} --file ${corsPath} --force`);
  runWrangler(`r2 bucket cors list ${bucket}`);
}

console.log("R2 bucket verified and CORS applied.");
