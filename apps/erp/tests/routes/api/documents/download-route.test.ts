import { beforeEach, describe, expect, it, vi } from "vitest";

const downloadHandler = vi.hoisted(() => ({
  handleObjectStorageDocumentDownloadGet: vi.fn(async () => ({
    status: 302,
    redirect: "https://signed.example/object",
  })),
}));

const governanceDeps = vi.hoisted(() => ({
  createTenantObjectStorageDownloadDeps: vi.fn(() => ({
    getTenantDocument: vi.fn(async () => null),
    recordEvidenceEvent: vi.fn(async () => undefined),
    authorizeDocumentDownload: vi.fn(async () => undefined),
    getDocumentScanStatus: vi.fn(async () => null),
    resolveOrganizationObjectStorageProvider: vi.fn(async () => null),
  })),
}));

vi.mock("@afenda/object-storage/server", () => downloadHandler);
vi.mock("@afenda/feature-system-admin/server", () => governanceDeps);

import { GET as getLegacyDownload } from "@/app/api/documents/[documentId]/download/route";
import { GET as getInternalDownload } from "@/app/api/internal/v1/documents/[documentId]/download/route";

describe("document download routes", () => {
  beforeEach(() => {
    downloadHandler.handleObjectStorageDocumentDownloadGet.mockClear();
    governanceDeps.createTenantObjectStorageDownloadDeps.mockClear();
  });

  it("delegates internal download to object-storage handler with governance deps", async () => {
    const response = await getInternalDownload(
      new Request(
        "http://localhost/api/internal/v1/documents/doc_1/download?moduleId=finance",
      ),
      { params: Promise.resolve({ documentId: "doc_1" }) },
    );

    expect(response.status).toBe(302);
    expect(governanceDeps.createTenantObjectStorageDownloadDeps).toHaveBeenCalled();
    expect(downloadHandler.handleObjectStorageDocumentDownloadGet).toHaveBeenCalledWith(
      expect.objectContaining({ documentId: "doc_1" }),
      expect.objectContaining({
        getTenantDocument: expect.any(Function),
        recordEvidenceEvent: expect.any(Function),
        authorizeDocumentDownload: expect.any(Function),
        getDocumentScanStatus: expect.any(Function),
        resolveOrganizationObjectStorageProvider: expect.any(Function),
      }),
    );
  });

  it("redirects legacy download path to internal route", async () => {
    const response = await getLegacyDownload(
      new Request(
        "http://localhost/api/documents/doc_1/download?moduleId=finance",
      ),
      { params: Promise.resolve({ documentId: "doc_1" }) },
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "http://localhost/api/internal/v1/documents/doc_1/download?moduleId=finance",
    );
  });
});
