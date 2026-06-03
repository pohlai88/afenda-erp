import { describe, expect, it } from "vitest";
import {
  assertTenantPathnameForOrganization,
  formatObjectStorageProviderLabel,
  isS3ObjectNotFoundError,
  normalizeBlobToR2MigrationDocumentRow,
  parseBlobToR2MigrationArgs,
} from "../scripts/blob-to-r2-migration.shared";

describe("blob-to-r2 migration helpers", () => {
  it("parses migration CLI flags", () => {
    expect(
      parseBlobToR2MigrationArgs([
        "--organization-id",
        "org_a",
        "--dry-run",
        "--limit",
        "25",
        "--set-org-provider",
      ]),
    ).toEqual({
      organizationId: "org_a",
      dryRun: true,
      limit: 25,
      overwrite: false,
      setOrgProvider: true,
    });
  });

  it("rejects pathnames outside the tenant prefix", () => {
    expect(() =>
      assertTenantPathnameForOrganization({
        organizationId: "org_a",
        pathname: "tenants/org_b/finance/file.pdf",
      }),
    ).toThrow(/outside tenants\/org_a\//);
  });

  it("formats provider labels for operator output", () => {
    expect(formatObjectStorageProviderLabel(null)).toBe("Deployment default");
    expect(formatObjectStorageProviderLabel("r2")).toBe("Cloudflare R2");
  });

  it("normalizes Neon snake_case rows to migration documents", () => {
    expect(
      normalizeBlobToR2MigrationDocumentRow({
        id: "doc_a",
        pathname: "tenants/org_a/finance/file.pdf",
        blob_url: "https://blob.example/file.pdf",
        content_type: "application/pdf",
        size_bytes: "1024",
      }),
    ).toEqual({
      id: "doc_a",
      pathname: "tenants/org_a/finance/file.pdf",
      blobUrl: "https://blob.example/file.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
    });
  });

  it("only treats actual S3 not-found failures as absent objects", () => {
    expect(isS3ObjectNotFoundError({ name: "NoSuchKey" })).toBe(true);
    expect(isS3ObjectNotFoundError({ $metadata: { httpStatusCode: 404 } })).toBe(
      true,
    );
    expect(isS3ObjectNotFoundError({ $metadata: { httpStatusCode: 403 } })).toBe(
      false,
    );
  });
});
