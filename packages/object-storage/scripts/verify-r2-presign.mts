import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getObjectStorageEnv } from "../../config/src/env.ts";
import { R2_PRESIGN_EXPIRES_SECONDS } from "../src/r2/domain/presign.shared.ts";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

for (const file of [".env.config", ".env.local", "apps/erp/.env.local"]) {
  config({ path: resolve(rootDir, file), override: false });
}
config({ path: resolve(rootDir, ".secret.config"), override: true });

const storageEnv = getObjectStorageEnv();

if (storageEnv.provider !== "r2" || !storageEnv.configured || !storageEnv.r2) {
  console.error("R2 is not configured.");
  process.exit(1);
}

const r2 = storageEnv.r2;
const client = new S3Client({
  region: "auto",
  endpoint: r2.endpoint,
  credentials: {
    accessKeyId: r2.accessKeyId,
    secretAccessKey: r2.secretAccessKey,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const verifyKey = `__afenda-presign-verify/${Date.now()}.txt`;
const verifyBody = "afenda-r2-presign-verify";
const contentType = "text/plain; charset=utf-8";

const uploadUrl = await getSignedUrl(
  client,
  new PutObjectCommand({
    Bucket: r2.bucket,
    Key: verifyKey,
    ContentType: contentType,
  }),
  { expiresIn: R2_PRESIGN_EXPIRES_SECONDS },
);

const putResponse = await fetch(uploadUrl, {
  method: "PUT",
  headers: { "Content-Type": contentType },
  body: verifyBody,
});

if (!putResponse.ok) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        step: "put",
        status: putResponse.status,
        hint: "Confirm bucket CORS allows PUT + Content-Type from your origins (pnpm r2:provision).",
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const head = await client.send(
  new HeadObjectCommand({ Bucket: r2.bucket, Key: verifyKey }),
);

await client.send(
  new DeleteObjectCommand({ Bucket: r2.bucket, Key: verifyKey }),
);

console.log(
  JSON.stringify(
    {
      ok: true,
      bucket: r2.bucket,
      endpoint: r2.endpoint,
      presignExpiresSeconds: R2_PRESIGN_EXPIRES_SECONDS,
      uploadUrlHost: new URL(uploadUrl).host,
      signedHeaders: ["content-type"],
      headContentLength: head.ContentLength,
      etag: head.ETag?.replaceAll('"', ""),
      cloudflareDocs:
        "https://developers.cloudflare.com/r2/api/s3/presigned-urls/",
    },
    null,
    2,
  ),
);
