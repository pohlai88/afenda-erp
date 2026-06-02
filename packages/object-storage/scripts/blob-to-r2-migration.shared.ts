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
