import { moduleIds } from "@afenda/config/module-ids";
import { getObjectStorageEnv } from "@afenda/config/env";
import { uploadRouteCopy } from "@afenda/kernel";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  assertObjectStorageConfigured,
  resolveUploadedDocumentSize,
  resolveVercelBlobCallbackUrl,
} from "../src/env/object-storage-config.server";
import {
  UploadRouteError,
  getUploadRouteErrorResponse,
} from "../src/errors/upload-route.error.shared";
import {
  OBJECT_STORAGE_HTTP_ROUTES,
  assertUploadPathnameMatchesTenant,
  buildTenantObjectPathPrefix,
  buildTenantObjectPathname,
  formatDownloadContentDisposition,
  shouldUseMultipartUpload,
} from "../src/client";
import {
  assertUploadTokenMatchesSession,
  uploadAccessSchema,
  uploadPayloadSchema,
  type UploadTokenPayload,
} from "../src/schemas/upload-payload.shared";

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
    const originalToken = process.env.BLOB_READ_WRITE_TOKEN;
    const originalProvider = process.env.OBJECT_STORAGE_PROVIDER;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.OBJECT_STORAGE_PROVIDER;
    delete process.env.OBJECT_STORAGE_ENDPOINT;

    expect(() => assertObjectStorageConfigured()).toThrow(
      new UploadRouteError(503, uploadRouteCopy.blobNotConfigured),
    );

    process.env.BLOB_READ_WRITE_TOKEN = originalToken;
    process.env.OBJECT_STORAGE_PROVIDER = originalProvider;
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
    expect(uploadAccessSchema.parse("public")).toBe("public");
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
