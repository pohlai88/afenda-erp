import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadHandler = vi.hoisted(() => ({
  handleObjectStorageUploadPost: vi.fn(async () => ({
    status: 200,
    body: { registered: true },
  })),
  handleObjectStorageUploadConfigGet: vi.fn(async () => ({
    status: 200,
    body: {
      configured: true,
      authorized: true,
      provider: "vercel-blob",
      pathnamePrefix: "tenants/org_1/finance",
    },
  })),
}));

const governanceDeps = vi.hoisted(() => ({
  createTenantObjectStorageUploadDeps: vi.fn(
    (input: { registerUploadedDocument: unknown }) => ({
      registerUploadedDocument: input.registerUploadedDocument,
      recordEvidenceEvent: vi.fn(async () => undefined),
      assertUploadQuota: vi.fn(async () => undefined),
    }),
  ),
  registerUploadedTenantDocumentCommand: vi.fn(async () => "doc_test"),
}));

vi.mock("@afenda/object-storage/server", () => uploadHandler);
vi.mock("@afenda/feature-system-admin/server", () => governanceDeps);

import { OBJECT_STORAGE_HTTP_ROUTES } from "@afenda/object-storage/client";
import { POST as postUpload } from "@/app/api/internal/v1/uploads/route";
import { GET as getUploadConfig } from "@/app/api/internal/v1/uploads/config/route";

describe("internal upload routes", () => {
  beforeEach(() => {
    uploadHandler.handleObjectStorageUploadPost.mockClear();
    uploadHandler.handleObjectStorageUploadConfigGet.mockClear();
    governanceDeps.createTenantObjectStorageUploadDeps.mockClear();
    governanceDeps.registerUploadedTenantDocumentCommand.mockClear();
  });

  it("wires governance upload deps into upload POST", async () => {
    const response = await postUpload(
      new Request(`http://localhost${OBJECT_STORAGE_HTTP_ROUTES.upload}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "blob.generate-client-token" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(governanceDeps.createTenantObjectStorageUploadDeps).toHaveBeenCalledWith({
      registerUploadedDocument:
        governanceDeps.registerUploadedTenantDocumentCommand,
    });
    expect(uploadHandler.handleObjectStorageUploadPost).toHaveBeenCalledWith(
      expect.any(Request),
      expect.objectContaining({
        registerUploadedDocument:
          governanceDeps.registerUploadedTenantDocumentCommand,
      }),
    );
  });

  it("returns upload config from object-storage handler", async () => {
    const url = new URL(
      `http://localhost${OBJECT_STORAGE_HTTP_ROUTES.uploadConfig}`,
    );
    url.searchParams.set("moduleId", "finance");

    const response = await getUploadConfig(new Request(url.toString()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      configured: true,
      authorized: true,
    });
    expect(uploadHandler.handleObjectStorageUploadConfigGet).toHaveBeenCalled();
  });
});
