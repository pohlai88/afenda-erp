import { moduleIds } from "@afenda/config/module-ids";
import { getObjectStorageEnv } from "@afenda/config/env";
import { uploadRouteCopy } from "@afenda/kernel";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  assertObjectStorageConfigured,
  resolveUploadedDocumentSize,
  resolveVercelBlobCallbackUrl,
} from "../src/_object-storage-integration/domain/object-storage-config.server";
import {
  assertDocumentScanPassed,
  assertGateDecisionAllowed,
  assertUploadQuotaAllowed,
  recordEvidenceEvent,
  recordGovernanceDeniedEvidenceEvent,
  recordUploadRouteDeniedEvidence,
} from "../src/_object-storage-integration/api/evidence-governance.server";
import {
  UploadRouteError,
  getUploadRouteErrorResponse,
} from "../src/_object-storage-integration/domain/upload-route.error.shared";
import {
  OBJECT_STORAGE_HTTP_ROUTES,
} from "../src/_object-storage-integration/contracts/index";
import {
  assertUploadPathnameMatchesTenant,
  buildTenantObjectPathPrefix,
  buildTenantObjectPathname,
  formatDownloadContentDisposition,
  shouldUseMultipartUpload,
} from "../src/_object-storage-integration/policies/tenant-pathnames.shared";
import {
  assertUploadTokenMatchesSession,
  uploadAccessSchema,
  uploadClassificationSchema,
  uploadPayloadSchema,
  uploadRetentionClassSchema,
  type UploadTokenPayload,
} from "../src/_object-storage-integration/schemas/upload-payload.shared";
import {
  objectStorageEncryptionModes,
  objectStorageGovernancePolicy,
  objectStorageKmsAdapterIds,
  objectStorageProviderIds,
  objectStorageUploadModes,
} from "../src/metadata";

describe("object storage metadata door", () => {
  it("exports provider, upload, and encryption registry ids", () => {
    expect(objectStorageProviderIds).toEqual(["vercel-blob", "r2", "s3"]);
    expect(objectStorageUploadModes).toEqual(["presigned", "server"]);
    expect(objectStorageEncryptionModes).toEqual(["platform", "customer-managed"]);
    expect(objectStorageKmsAdapterIds).toEqual(["vault-transit", "aws-kms"]);
  });
});

describe("tenant object pathnames", () => {
  it("builds tenant-scoped object path prefixes", () => {
    expect(
      buildTenantObjectPathPrefix({
        organizationId: "org_123",
        moduleId: moduleIds[0],
      }),
    ).toBe(`tenants/org_123/${moduleIds[0]}`);

    expect(
      buildTenantObjectPathname({
        organizationId: "org_123",
        moduleId: moduleIds[0],
        filename: "invoice.pdf",
      }),
    ).toBe(`tenants/org_123/${moduleIds[0]}/invoice.pdf`);
  });

  it("rejects unsafe upload filenames", () => {
    expect(() =>
      buildTenantObjectPathname({
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

  it("detects multipart uploads for large files", () => {
    expect(shouldUseMultipartUpload(3 * 1024 * 1024)).toBe(false);
    expect(shouldUseMultipartUpload(5 * 1024 * 1024)).toBe(true);
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

describe("object storage config", () => {
  it("resolves Vercel Blob callback URLs from env or request host", () => {
    expect(
      resolveVercelBlobCallbackUrl(
        new Request(`http://localhost:3000${OBJECT_STORAGE_HTTP_ROUTES.upload}`),
        {
          VERCEL_BLOB_CALLBACK_URL: `https://tunnel.example${OBJECT_STORAGE_HTTP_ROUTES.upload}`,
        },
      ),
    ).toBe(`https://tunnel.example${OBJECT_STORAGE_HTTP_ROUTES.upload}`);

    expect(
      resolveVercelBlobCallbackUrl(
        new Request(`https://preview.example${OBJECT_STORAGE_HTTP_ROUTES.upload}`, {
          headers: {
            host: "preview.example",
            "x-forwarded-host": "preview.example",
            "x-forwarded-proto": "https",
          },
        }),
        {},
      ),
    ).toBe(`https://preview.example${OBJECT_STORAGE_HTTP_ROUTES.upload}`);
  });

  it("throws when object storage is not configured", () => {
    const touchedKeys = [
      "BLOB_READ_WRITE_TOKEN",
      "OBJECT_STORAGE_PROVIDER",
      "OBJECT_STORAGE_ENDPOINT",
    ] as const;
    const originalEnv = Object.fromEntries(
      touchedKeys.map((key) => [key, process.env[key]]),
    );

    try {
      for (const key of touchedKeys) {
        delete process.env[key];
      }

      expect(() => assertObjectStorageConfigured()).toThrow(
        new UploadRouteError(503, uploadRouteCopy.blobNotConfigured),
      );
    } finally {
      for (const key of touchedKeys) {
        const value = originalEnv[key];
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
  });

  it("validates uploaded object size against declared payload", () => {
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
});

describe("upload payload schema", () => {
  it("validates upload payload schema", () => {
    const payload = uploadPayloadSchema.parse({
      moduleId: moduleIds[0],
      title: "Quarterly statement",
      contentType: "application/pdf",
      sizeBytes: 1024,
      access: "private",
    });

    expect(payload.access).toBe("private");
    expect(payload.classification).toBe("internal");
    expect(payload.retentionClass).toBe("standard");
    expect(uploadAccessSchema.parse("public")).toBe("public");
    expect(uploadClassificationSchema.parse("restricted")).toBe("restricted");
    expect(uploadRetentionClassSchema.parse("legal-hold")).toBe("legal-hold");
  });

  it("exposes governance policy through the metadata door", () => {
    expect(objectStorageGovernancePolicy).toMatchObject({
      defaultClassification: "internal",
      defaultRetentionClass: "standard",
      classificationRequired: true,
      retentionClassRequired: true,
    });
    expect(objectStorageGovernancePolicy.classifications).toContain(
      "confidential",
    );
    expect(objectStorageGovernancePolicy.classifications).toContain(
      "highly-restricted",
    );
    expect(objectStorageGovernancePolicy.retentionClasses).toContain(
      "legal-hold",
    );
  });

  it("identifies sensitive classifications for download governance", async () => {
    const { isObjectStorageClassificationSensitive } = await import(
      "../src/_object-storage-integration/policies/document-governance-policy.shared"
    );

    expect(isObjectStorageClassificationSensitive("internal")).toBe(false);
    expect(isObjectStorageClassificationSensitive("confidential")).toBe(true);
    expect(isObjectStorageClassificationSensitive("highly-restricted")).toBe(
      true,
    );
  });

  it("detects magic bytes for common upload types", async () => {
    const {
      detectContentTypeFromMagicBytes,
      magicBytesMatchDeclaredContentType,
    } = await import(
      "../src/_object-storage-integration/policies/document-content-verification.shared"
    );

    const pdfPrefix = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
    expect(detectContentTypeFromMagicBytes(pdfPrefix)).toBe("application/pdf");
    expect(
      magicBytesMatchDeclaredContentType("application/pdf", pdfPrefix),
    ).toBe(true);
    expect(
      magicBytesMatchDeclaredContentType("image/png", pdfPrefix),
    ).toBe(false);
  });

  it("rejects stored content when magic bytes mismatch declared type", async () => {
    const { assertStoredContentMatchesDeclared } = await import(
      "../src/_object-storage-integration/api/upload-registration.server"
    );

    const pngDeclaredPdfBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52,
    ]);

    expect(() =>
      assertStoredContentMatchesDeclared({
        storedContentType: "image/png",
        declaredContentType: "application/pdf",
        prefixBytes: pngDeclaredPdfBytes,
      }),
    ).toThrow(UploadRouteError);
  });

  it("maps upload route errors to status and message", () => {
    const response = getUploadRouteErrorResponse(
      new UploadRouteError(403, uploadRouteCopy.uploadNotAllowed),
    );

    expect(response).toEqual({
      status: 403,
      message: uploadRouteCopy.uploadNotAllowed,
    });
  });

  it("maps zod errors to invalid request copy", () => {
    const response = getUploadRouteErrorResponse(
      new z.ZodError([
        {
          code: "custom",
          message: "Invalid",
          path: ["title"],
        },
      ]),
    );

    expect(response).toEqual({
      status: 400,
      message: uploadRouteCopy.invalidRequest,
    });
  });

  it("rejects upload tokens that do not match the active session", () => {
    const payload = {
      moduleId: moduleIds[0],
      title: "Quarterly statement",
      contentType: "application/pdf" as const,
      sizeBytes: 1024,
      access: "private" as const,
      classification: "internal" as const,
      retentionClass: "standard" as const,
      registerTenantDocument: true,
      organizationId: "org-a",
      uploadedByAuthUserId: "user-a",
    } satisfies UploadTokenPayload;

    expect(() =>
      assertUploadTokenMatchesSession(
        payload,
        { id: "org-b" },
        { id: "user-a" },
      ),
    ).toThrow(new UploadRouteError(403, uploadRouteCopy.tokenMismatch));
  });
});

describe("evidence governance gates", () => {
  it("blocks downloads until scan status is passed", () => {
    expect(() => assertDocumentScanPassed({ scanStatus: "passed" })).not.toThrow();
    expect(() => assertDocumentScanPassed({ scanStatus: undefined })).toThrow(
      UploadRouteError,
    );
    expect(() => assertDocumentScanPassed({ scanStatus: "pending" })).toThrow(
      UploadRouteError,
    );
  });

  it("maps governance denials to upload route errors", () => {
    expect(() => assertGateDecisionAllowed({ allowed: true })).not.toThrow();
    expect(() =>
      assertGateDecisionAllowed({
        allowed: false,
        status: 429,
        reason: "Organization storage quota exceeded.",
      }),
    ).toThrow(new UploadRouteError(429, "Organization storage quota exceeded."));
  });

  it("records evidence events with a generated timestamp", async () => {
    const events: unknown[] = [];

    await recordEvidenceEvent({
      sink: async (event) => {
        events.push(event);
      },
      event: {
        action: "DOCUMENT_UPLOADED",
        organizationId: "org-a",
        moduleId: moduleIds[0],
        userId: "user-a",
        pathname: "tenants/org-a/finance/file.pdf",
      },
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      action: "DOCUMENT_UPLOADED",
      organizationId: "org-a",
      userId: "user-a",
    });
    expect((events[0] as { timestamp?: string }).timestamp).toEqual(
      expect.any(String),
    );
  });

  it("records upload quota denials before throwing", async () => {
    const events: unknown[] = [];

    await expect(
      assertUploadQuotaAllowed({
        recordDenied: async (event) => {
          events.push(event);
        },
        quotaInput: {
          organizationId: "org-a",
          moduleId: moduleIds[0],
          pathname: "tenants/org-a/finance/file.pdf",
          sizeBytes: 1024,
          contentType: "application/pdf",
          access: "private",
          classification: "internal",
          retentionClass: "standard",
          uploadedByAuthUserId: "user-a",
        },
        quotaGate: async () => ({
          allowed: false,
          status: 429,
          reason: "Organization storage quota exceeded.",
        }),
      }),
    ).rejects.toThrow(UploadRouteError);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      action: "DOCUMENT_UPLOAD_DENIED",
      metadata: {
        denialStatus: 429,
        denialReason: "Organization storage quota exceeded.",
      },
    });
  });

  it("records governance denials for blocked downloads", async () => {
    const events: unknown[] = [];

    await recordGovernanceDeniedEvidenceEvent({
      sink: async (event) => {
        events.push(event);
      },
      action: "DOCUMENT_DOWNLOAD_DENIED",
      status: 423,
      reason: "Document unavailable.",
      event: {
        organizationId: "org-a",
        moduleId: moduleIds[0],
        userId: "user-a",
        documentId: "doc-a",
        pathname: "tenants/org-a/finance/file.pdf",
      },
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      action: "DOCUMENT_DOWNLOAD_DENIED",
      metadata: {
        denialStatus: 423,
        denialReason: "Document unavailable.",
      },
    });
  });

  it("records upload permission denials with 403 status", async () => {
    const events: unknown[] = [];

    await recordUploadRouteDeniedEvidence({
      sink: async (event) => {
        events.push(event);
      },
      error: new UploadRouteError(403, uploadRouteCopy.uploadNotAllowed),
      context: {
        organizationId: "org-a",
        moduleId: moduleIds[0],
        userId: "user-a",
        pathname: "tenants/org-a/finance/file.pdf",
      },
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      action: "DOCUMENT_UPLOAD_DENIED",
      metadata: {
        denialStatus: 403,
        denialReason: uploadRouteCopy.uploadNotAllowed,
      },
    });
  });
});

describe("object storage env", () => {
  it("treats empty R2 placeholders as unset while Blob token remains valid", () => {
    const env = getObjectStorageEnv({
      NODE_ENV: "test",
      BLOB_READ_WRITE_TOKEN: "blob-token",
      OBJECT_STORAGE_PROVIDER: "",
      OBJECT_STORAGE_ENDPOINT: "",
      OBJECT_STORAGE_BUCKET: "",
      OBJECT_STORAGE_PUBLIC_URL_BASE: "",
    } as NodeJS.ProcessEnv);

    expect(env.configured).toBe(true);
    expect(env.provider).toBe("vercel-blob");
  });

  it("maps legacy R2_* env keys to OBJECT_STORAGE_*", () => {
    const env = getObjectStorageEnv({
      NODE_ENV: "test",
      OBJECT_STORAGE_PROVIDER: "r2",
      R2_ACCOUNT_ID: "acct123",
      R2_BUCKET_NAME: "my-bucket",
      R2_ACCESS_KEY_ID: "key-id",
      R2_SECRET_ACCESS_KEY: "secret-key",
    } as NodeJS.ProcessEnv);

    expect(env.configured).toBe(true);
    expect(env.provider).toBe("r2");
    expect(env.r2).toEqual({
      endpoint: "https://acct123.r2.cloudflarestorage.com",
      bucket: "my-bucket",
      accessKeyId: "key-id",
      secretAccessKey: "secret-key",
      publicUrlBase: undefined,
    });
  });
});
