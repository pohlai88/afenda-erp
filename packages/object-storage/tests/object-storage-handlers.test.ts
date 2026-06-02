import { beforeEach, describe, expect, it, vi } from "vitest";
import { uploadRouteCopy } from "@afenda/kernel";
import { UploadRouteError } from "../src/_object-storage-integration/domain/upload-route.error.shared";
import { OBJECT_STORAGE_HTTP_ROUTES } from "../src/_object-storage-integration/contracts/index";
import type {
  ObjectStorageDocumentScanStatus,
  ObjectStorageGateDecision,
} from "../src/_object-storage-integration/contracts/index";

const authMocks = vi.hoisted(() => ({
  requireUploadModuleAccess: vi.fn(async () => ({
    organization: { id: "org_a" },
    session: { id: "user_a" },
    moduleDefinition: {},
  })),
}));

const configMocks = vi.hoisted(() => ({
  assertObjectStorageConfigured: vi.fn(() => ({
    configured: true,
    provider: "vercel-blob" as const,
    vercelBlob: { BLOB_READ_WRITE_TOKEN: "blob-token" },
  })),
}));

const blobUploadMock = vi.hoisted(() => ({
  handleVercelBlobUploadPost: vi.fn(async () => ({
    status: 200,
    body: { registered: true },
  })),
}));

const r2UploadMock = vi.hoisted(() => ({
  handleR2UploadPost: vi.fn(async () => ({
    status: 200,
    body: { completed: true },
  })),
}));

const storeMocks = vi.hoisted(() => ({
  createObjectStore: vi.fn(() => ({
    providerId: "vercel-blob",
    getSignedDownloadUrl: vi.fn(async () => ({
      url: "https://signed.example/object",
      validUntilMs: Date.now() + 300_000,
    })),
  })),
}));

vi.mock("@afenda/observability", () => ({
  getRequestId: vi.fn(() => "req_handler_test"),
  logServerEvent: vi.fn(),
}));

vi.mock(
  "../src/_object-storage-integration/domain/upload-route-auth.server",
  () => authMocks,
);
vi.mock(
  "../src/_object-storage-integration/domain/object-storage-config.server",
  () => configMocks,
);
vi.mock("../src/blob/api/upload-handler.server", () => blobUploadMock);
vi.mock("../src/r2/api/upload-handler.server", () => r2UploadMock);
vi.mock(
  "../src/_object-storage-integration/domain/create-object-store.server",
  () => storeMocks,
);

import {
  handleObjectStorageDocumentDownloadGet,
  handleObjectStorageUploadConfigGet,
  handleObjectStorageUploadPost,
} from "../src/_object-storage-integration/api/object-storage-handlers.server";

const financeDocument = {
  id: "doc_a",
  title: "Invoice.pdf",
  moduleId: "finance" as const,
  pathname: "tenants/org_a/finance/invoice.pdf",
  access: "private" as const,
  classification: "internal" as const,
  retentionClass: "standard" as const,
  scanStatus: "passed" as const,
};

describe("object storage HTTP handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.requireUploadModuleAccess.mockResolvedValue({
      organization: { id: "org_a" },
      session: { id: "user_a" },
      moduleDefinition: {},
    });
    configMocks.assertObjectStorageConfigured.mockReturnValue({
      configured: true,
      provider: "vercel-blob",
      vercelBlob: { BLOB_READ_WRITE_TOKEN: "blob-token" },
    });
    blobUploadMock.handleVercelBlobUploadPost.mockResolvedValue({
      status: 200,
      body: { registered: true },
    });
  });

  describe("handleObjectStorageUploadPost", () => {
    it("delegates vercel-blob uploads to the blob handler", async () => {
      const request = new Request(`http://localhost${OBJECT_STORAGE_HTTP_ROUTES.upload}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "blob.generate-client-token" }),
      });

      const result = await handleObjectStorageUploadPost(request);

      expect(result).toEqual({
        status: 200,
        body: { registered: true },
      });
      expect(blobUploadMock.handleVercelBlobUploadPost).toHaveBeenCalled();
      expect(r2UploadMock.handleR2UploadPost).not.toHaveBeenCalled();
    });

    it("records DOCUMENT_UPLOAD_DENIED on 403 upload failures", async () => {
      blobUploadMock.handleVercelBlobUploadPost.mockRejectedValueOnce(
        new UploadRouteError(403, uploadRouteCopy.uploadNotAllowed),
      );

      const events: unknown[] = [];
      const request = new Request(`http://localhost${OBJECT_STORAGE_HTTP_ROUTES.upload}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "blob.generate-client-token",
          payload: { moduleId: "finance" },
        }),
      });

      const result = await handleObjectStorageUploadPost(request, {
        recordEvidenceEvent: async (event) => {
          events.push(event);
        },
      });

      expect(result.status).toBe(403);
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        action: "DOCUMENT_UPLOAD_DENIED",
        organizationId: "org_a",
        moduleId: "finance",
        userId: "user_a",
        metadata: {
          denialStatus: 403,
          denialReason: uploadRouteCopy.uploadNotAllowed,
        },
      });
    });
  });

  describe("handleObjectStorageUploadConfigGet", () => {
    it("returns provider config for authorized upload modules", async () => {
      const url = new URL(
        `http://localhost${OBJECT_STORAGE_HTTP_ROUTES.uploadConfig}`,
      );
      url.searchParams.set("moduleId", "finance");

      const result = await handleObjectStorageUploadConfigGet(
        new Request(url.toString()),
      );

      expect(result.status).toBe(200);
      expect(result.body).toMatchObject({
        configured: true,
        provider: "vercel-blob",
        pathnamePrefix: "tenants/org_a/finance",
        uploadRoute: OBJECT_STORAGE_HTTP_ROUTES.upload,
      });
      expect(authMocks.requireUploadModuleAccess).toHaveBeenCalledWith(
        "finance",
        "upload",
      );
    });

    it("returns unauthorized config when module access is denied", async () => {
      authMocks.requireUploadModuleAccess.mockRejectedValueOnce(
        new UploadRouteError(403, uploadRouteCopy.uploadNotAllowed),
      );

      const url = new URL(
        `http://localhost${OBJECT_STORAGE_HTTP_ROUTES.uploadConfig}`,
      );
      url.searchParams.set("moduleId", "finance");

      const result = await handleObjectStorageUploadConfigGet(
        new Request(url.toString()),
      );

      expect(result.status).toBe(403);
      expect(result.body).toMatchObject({
        configured: true,
        authorized: false,
        error: uploadRouteCopy.uploadNotAllowed,
      });
    });
  });

  describe("handleObjectStorageDocumentDownloadGet", () => {
    it("issues a signed redirect and records DOCUMENT_DOWNLOADED", async () => {
      const events: unknown[] = [];
      const request = new Request(
        "http://localhost/api/internal/v1/documents/doc_a/download?moduleId=finance",
      );

      const result = await handleObjectStorageDocumentDownloadGet(
        { request, documentId: "doc_a" },
        {
          getTenantDocument: vi.fn(async () => financeDocument),
          authorizeDocumentDownload: vi.fn(
            async (): Promise<ObjectStorageGateDecision | void> => undefined,
          ),
          getDocumentScanStatus: vi.fn(
            async (): Promise<ObjectStorageDocumentScanStatus | null> => "passed",
          ),
          recordEvidenceEvent: async (event) => {
            events.push(event);
          },
        },
      );

      expect(result.status).toBe(302);
      expect(result.redirect).toBe("https://signed.example/object");
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        action: "DOCUMENT_DOWNLOADED",
        organizationId: "org_a",
        moduleId: "finance",
        documentId: "doc_a",
        userId: "user_a",
        sessionId: "user_a",
      });
    });

    it("records DOCUMENT_DOWNLOAD_DENIED on 403 governance blocks", async () => {
      const events: unknown[] = [];
      const request = new Request(
        "http://localhost/api/internal/v1/documents/doc_a/download?moduleId=finance",
      );

      const result = await handleObjectStorageDocumentDownloadGet(
        { request, documentId: "doc_a" },
        {
          getTenantDocument: vi.fn(async () => financeDocument),
          authorizeDocumentDownload: vi.fn(
            async (): Promise<ObjectStorageGateDecision | void> => ({
              allowed: false,
              status: 403,
              reason: "Sensitive document access is required.",
            }),
          ),
          getDocumentScanStatus: vi.fn(
            async (): Promise<ObjectStorageDocumentScanStatus | null> => "passed",
          ),
          recordEvidenceEvent: async (event) => {
            events.push(event);
          },
        },
      );

      expect(result.status).toBe(403);
      expect(result.body).toEqual({
        error: "Sensitive document access is required.",
      });
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        action: "DOCUMENT_DOWNLOAD_DENIED",
        organizationId: "org_a",
        moduleId: "finance",
        documentId: "doc_a",
        metadata: {
          denialStatus: 403,
          denialReason: "Sensitive document access is required.",
        },
      });
    });
  });
});
