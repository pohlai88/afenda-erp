import { moduleIds } from "@afenda/config/module-ids";
import { uploadRouteCopy } from "@afenda/kernel";
import { describe, expect, it } from "vitest";
import {
  assertUploadPathnameMatchesTenant,
  buildTenantBlobPathname,
  buildTenantBlobPathPrefix,
  formatDownloadContentDisposition,
  shouldUseMultipartUpload,
} from "@/lib/api/blob-pathnames.shared";
import {
  assertBlobConfigured,
  resolveBlobCallbackUrl,
  resolveUploadedDocumentSize,
} from "@/lib/api/blob-upload";
import { UploadRouteError } from "@/lib/api/upload-route";

describe("blob upload helpers", () => {
  it("builds tenant-scoped blob path prefixes", () => {
    expect(
      buildTenantBlobPathPrefix({
        organizationId: "org_123",
        moduleId: moduleIds[0],
      }),
    ).toBe(`tenants/org_123/${moduleIds[0]}`);

    expect(
      buildTenantBlobPathname({
        organizationId: "org_123",
        moduleId: moduleIds[0],
        filename: "invoice.pdf",
      }),
    ).toBe(`tenants/org_123/${moduleIds[0]}/invoice.pdf`);
  });

  it("rejects unsafe upload filenames", () => {
    expect(() =>
      buildTenantBlobPathname({
        organizationId: "org_123",
        moduleId: moduleIds[0],
        filename: "../invoice.pdf",
      }),
    ).toThrow(UploadRouteError);
  });

  it("requires pathname to stay within the tenant prefix", () => {
    expect(() =>
      assertUploadPathnameMatchesTenant({
        pathname: "tenants/org-a/finance/invoice.pdf",
        organizationId: "org-b",
        moduleId: moduleIds[0],
      }),
    ).toThrow(new UploadRouteError(403, uploadRouteCopy.invalidRequest));
  });

  it("resolves callback URLs from env or request host", () => {
    expect(
      resolveBlobCallbackUrl(
        new Request("http://localhost:3000/api/uploads"),
        { VERCEL_BLOB_CALLBACK_URL: "https://tunnel.example/api/uploads" },
      ),
    ).toBe("https://tunnel.example/api/uploads");

    expect(
      resolveBlobCallbackUrl(
        new Request("https://preview.example/api/uploads", {
          headers: {
            host: "preview.example",
            "x-forwarded-host": "preview.example",
            "x-forwarded-proto": "https",
          },
        }),
        {},
      ),
    ).toBe("https://preview.example/api/uploads");
  });

  it("detects multipart uploads for large files", () => {
    expect(shouldUseMultipartUpload(3 * 1024 * 1024)).toBe(false);
    expect(shouldUseMultipartUpload(5 * 1024 * 1024)).toBe(true);
  });

  it("throws when blob storage is not configured", () => {
    const originalToken = process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_READ_WRITE_TOKEN;

    expect(() => assertBlobConfigured()).toThrow(
      new UploadRouteError(503, uploadRouteCopy.blobNotConfigured),
    );

    process.env.BLOB_READ_WRITE_TOKEN = originalToken;
  });

  it("validates uploaded blob size against declared payload", () => {
    expect(
      resolveUploadedDocumentSize({
        declaredSizeBytes: 1024,
        blob: { size: 1024 },
      }),
    ).toBe(1024);

    expect(() =>
      resolveUploadedDocumentSize({
        declaredSizeBytes: 1024,
        blob: { size: 2048 },
      }),
    ).toThrow(UploadRouteError);
  });

  it("formats download content disposition safely", () => {
    expect(formatDownloadContentDisposition('Quarterly "report".pdf')).toContain(
      "filename=",
    );
    expect(formatDownloadContentDisposition('Quarterly "report".pdf')).toContain(
      "filename*=UTF-8''",
    );
  });
});
