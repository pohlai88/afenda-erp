export type BlobToR2MigrationArgs = {
  organizationId: string;
  dryRun: boolean;
  limit: number;
  overwrite: boolean;
  setOrgProvider: boolean;
};

export type BlobToR2MigrationDocumentRow = {
  id: string;
  pathname: string;
  blobUrl: string;
  contentType: string | null;
  sizeBytes: number;
};

export type BlobToR2MigrationRawDocumentRow = {
  id: string;
  pathname: string;
  blob_url?: string | null;
  blobUrl?: string | null;
  content_type?: string | null;
  contentType?: string | null;
  size_bytes?: number | string | bigint | null;
  sizeBytes?: number | string | bigint | null;
};

export type BlobToR2MigrationResult = {
  organizationId: string;
  dryRun: boolean;
  examined: number;
  copied: number;
  skippedExisting: number;
  failed: number;
  errors: readonly { documentId: string; pathname: string; message: string }[];
};

export function parseBlobToR2MigrationArgs(argv: readonly string[]): BlobToR2MigrationArgs {
  let organizationId = "";
  let dryRun = false;
  let limit = 500;
  let overwrite = false;
  let setOrgProvider = false;

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--organization-id" || token === "--org-id") {
      organizationId = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (token === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (token === "--overwrite") {
      overwrite = true;
      continue;
    }

    if (token === "--set-org-provider") {
      setOrgProvider = true;
      continue;
    }

    if (token === "--limit") {
      const parsed = Number.parseInt(argv[index + 1] ?? "", 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        limit = parsed;
      }
      index += 1;
    }
  }

  return {
    organizationId,
    dryRun,
    limit,
    overwrite,
    setOrgProvider,
  };
}

export function assertTenantPathnameForOrganization(input: {
  pathname: string;
  organizationId: string;
}) {
  const expectedPrefix = `tenants/${input.organizationId}/`;

  if (!input.pathname.startsWith(expectedPrefix)) {
    throw new Error(
      `Pathname ${input.pathname} is outside tenants/${input.organizationId}/`,
    );
  }
}

function normalizeSizeBytes(value: number | string | bigint | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string" && value.trim()) {
    return Number.parseInt(value, 10);
  }

  return Number.NaN;
}

export function normalizeBlobToR2MigrationDocumentRow(
  row: BlobToR2MigrationRawDocumentRow,
): BlobToR2MigrationDocumentRow {
  const blobUrl = row.blobUrl ?? row.blob_url;
  const sizeBytes = normalizeSizeBytes(row.sizeBytes ?? row.size_bytes);

  if (!blobUrl?.trim() || !Number.isSafeInteger(sizeBytes) || sizeBytes < 0) {
    throw new Error(`Invalid migration row for document ${row.id}.`);
  }

  return {
    id: row.id,
    pathname: row.pathname,
    blobUrl,
    contentType: row.contentType ?? row.content_type ?? null,
    sizeBytes,
  };
}

export function isS3ObjectNotFoundError(error: unknown) {
  const candidate = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };

  return (
    candidate.name === "NotFound" ||
    candidate.name === "NoSuchKey" ||
    candidate.$metadata?.httpStatusCode === 404
  );
}

export function formatObjectStorageProviderLabel(
  provider: "vercel-blob" | "r2" | null | undefined,
) {
  if (provider === "vercel-blob") {
    return "Vercel Blob";
  }

  if (provider === "r2") {
    return "Cloudflare R2";
  }

  return "Deployment default";
}
