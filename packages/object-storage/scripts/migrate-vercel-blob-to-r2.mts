import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getObjectStorageEnv } from "@afenda/config/env";
import { neon } from "@neondatabase/serverless";
import { loadAfendaEnv } from "./load-afenda-env.mts";
import {
  assertTenantPathnameForOrganization,
  isS3ObjectNotFoundError,
  normalizeBlobToR2MigrationDocumentRow,
  parseBlobToR2MigrationArgs,
  type BlobToR2MigrationDocumentRow,
  type BlobToR2MigrationRawDocumentRow,
  type BlobToR2MigrationResult,
} from "./blob-to-r2-migration.shared.ts";

loadAfendaEnv();

const args = parseBlobToR2MigrationArgs(process.argv.slice(2));

if (!args.organizationId) {
  console.error(
    "Usage: pnpm blob:migrate:r2 -- --organization-id <orgId> [--dry-run] [--limit 500] [--overwrite] [--set-org-provider]",
  );
  process.exit(1);
}

const storageEnv = getObjectStorageEnv();

if (!storageEnv.configured || storageEnv.provider !== "r2" || !storageEnv.r2) {
  console.error("R2 must be configured (OBJECT_STORAGE_PROVIDER=r2) for migration target.");
  process.exit(1);
}

if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
  console.error("BLOB_READ_WRITE_TOKEN is required to read Vercel Blob source objects.");
  process.exit(1);
}

const databaseUrl =
  process.env.DATABASE_MIGRATION_URL ??
  process.env.DATABASE_URL ??
  process.env.NEON_PREVIEW_DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL (or DATABASE_MIGRATION_URL) is required.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const r2Client = new S3Client({
  region: "auto",
  endpoint: storageEnv.r2.endpoint,
  credentials: {
    accessKeyId: storageEnv.r2.accessKeyId,
    secretAccessKey: storageEnv.r2.secretAccessKey,
  },
});

const rawDocuments = (await sql`
  SELECT
    id,
    pathname,
    blob_url AS "blobUrl",
    content_type AS "contentType",
    size_bytes AS "sizeBytes"
  FROM erp_documents
  WHERE organization_id = ${args.organizationId}
  ORDER BY created_at ASC
  LIMIT ${args.limit}
`) as BlobToR2MigrationRawDocumentRow[];
const documents = rawDocuments.map(normalizeBlobToR2MigrationDocumentRow);

const result: BlobToR2MigrationResult = {
  organizationId: args.organizationId,
  dryRun: args.dryRun,
  examined: documents.length,
  copied: 0,
  skippedExisting: 0,
  failed: 0,
  errors: [],
};

for (const document of documents) {
  try {
    assertTenantPathnameForOrganization({
      pathname: document.pathname,
      organizationId: args.organizationId,
    });

    if (!args.overwrite) {
      try {
        await r2Client.send(
          new HeadObjectCommand({
            Bucket: storageEnv.r2.bucket,
            Key: document.pathname,
          }),
        );
        result.skippedExisting += 1;
        continue;
      } catch (error) {
        if (!isS3ObjectNotFoundError(error)) {
          throw error;
        }
        // Object absent — proceed with copy.
      }
    }

    if (args.dryRun) {
      result.copied += 1;
      continue;
    }

    const sourceResponse = await fetch(document.blobUrl);

    if (!sourceResponse.ok) {
      throw new Error(
        `Blob fetch failed with HTTP ${sourceResponse.status} for ${document.blobUrl}`,
      );
    }

    const contentLength = Number.parseInt(
      sourceResponse.headers.get("content-length") ?? "",
      10,
    );

    if (
      Number.isSafeInteger(contentLength) &&
      contentLength !== document.sizeBytes
    ) {
      throw new Error(
        `Size mismatch for ${document.pathname}: expected ${document.sizeBytes}, got ${contentLength}`,
      );
    }

    await r2Client.send(
      new PutObjectCommand({
        Bucket: storageEnv.r2.bucket,
        Key: document.pathname,
        Body: sourceResponse.body ?? undefined,
        ContentLength: document.sizeBytes,
        ContentType: document.contentType ?? "application/octet-stream",
      }),
    );

    result.copied += 1;
  } catch (error) {
    result.failed += 1;
    result.errors.push({
      documentId: document.id,
      pathname: document.pathname,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

if (args.setOrgProvider && !args.dryRun && result.failed === 0) {
  await sql`
    UPDATE organizations
    SET object_storage_provider = 'r2'
    WHERE id = ${args.organizationId}
  `;
}

console.log(JSON.stringify(result, null, 2));

if (result.failed > 0) {
  process.exitCode = 1;
}
