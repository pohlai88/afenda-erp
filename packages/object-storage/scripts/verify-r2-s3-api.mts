import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { getObjectStorageEnv } from "../../config/src/env.ts";

const storageEnv = getObjectStorageEnv();

if (storageEnv.provider !== "r2" || !storageEnv.configured || !storageEnv.r2) {
  console.error("R2 is not configured.");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: storageEnv.r2.endpoint,
  credentials: {
    accessKeyId: storageEnv.r2.accessKeyId,
    secretAccessKey: storageEnv.r2.secretAccessKey,
  },
});

await client.send(
  new HeadBucketCommand({ Bucket: storageEnv.r2.bucket }),
);

console.log(JSON.stringify({ ok: true, bucket: storageEnv.r2.bucket }));
