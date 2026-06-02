import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  claimTenantDocumentForScan: vi.fn(async () => true),
  getTenantDocument: vi.fn(async () => ({
    id: "doc_a",
    title: "Invoice.pdf",
    pathname: "tenants/org_a/finance/invoice.pdf",
    blobUrl: "https://blob.example/invoice.pdf",
    contentType: "application/pdf",
    sizeBytes: 1024,
    access: "private",
    moduleId: "finance",
    classification: "internal",
    retentionClass: "standard",
    scanStatus: "scanning",
  })),
  updateTenantDocumentScanStatus: vi.fn(async () => undefined),
  listTenantDocumentsPendingScan: vi.fn(async () => [
    {
      id: "doc_a",
      moduleId: "finance",
      title: "Invoice.pdf",
      pathname: "tenants/org_a/finance/invoice.pdf",
      blobUrl: "https://blob.example/invoice.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      scanStatus: "pending",
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  ]),
  listOrganizationsForCoreErpSeed: vi.fn(async () => [
    { id: "org_a", ownerAuthUserId: "user_owner" },
  ]),
}));

vi.mock("@afenda/db", () => dbMocks);

vi.mock("@afenda/config/env", () => ({
  getDocumentAvEnv: vi.fn(() => ({ staleScanningMinutes: 30 })),
  getDocumentAvWebhookSecret: vi.fn(() => "av-webhook-secret"),
}));

vi.mock("@afenda/object-storage/server", () => ({
  assertObjectStorageConfigured: vi.fn(() => ({
    configured: true,
    provider: "r2",
    r2: {
      bucket: "axis-attachments",
      endpoint: "https://example.r2.cloudflarestorage.com",
      accessKeyId: "key",
      secretAccessKey: "secret",
    },
  })),
  createObjectStore: vi.fn(() => ({
    providerId: "r2",
    headObject: vi.fn(async () => ({
      pathname: "tenants/org_a/finance/invoice.pdf",
      url: "https://example/invoice.pdf",
      sizeBytes: 1024,
    })),
    getSignedDownloadUrl: vi.fn(async () => ({
      url: "https://example/signed",
      validUntilMs: Date.now() + 3600_000,
    })),
  })),
  incrementObjectStorageMetric: vi.fn(),
}));

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: vi.fn(async () => undefined),
}));

import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { executeDocumentScanSweepCommand } from "../../src/tenant-execution/commands/document-scan-sweep.command.server";
import { processTenantDocumentScanCommand } from "../../src/tenant-execution/commands/process-tenant-document-scan.command.server";
import { reportTenantDocumentScanResultCommand } from "../../src/tenant-execution/commands/report-tenant-document-scan-result.command.server";
import { handleDocumentScanWebhookPost } from "../../src/tenant-execution/api/handle-document-scan-webhook.server";

describe("document AV scan pipeline", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    dbMocks.claimTenantDocumentForScan.mockResolvedValue(true);
    const { getDocumentAvEnv } = await import("@afenda/config/env");
    vi.mocked(getDocumentAvEnv).mockReturnValue({ staleScanningMinutes: 30 });
    dbMocks.getTenantDocument.mockResolvedValue({
      id: "doc_a",
      title: "Invoice.pdf",
      pathname: "tenants/org_a/finance/invoice.pdf",
      blobUrl: "https://blob.example/invoice.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      access: "private",
      moduleId: "finance",
      classification: "internal",
      retentionClass: "standard",
      scanStatus: "scanning",
    });
  });

  it("claims pending documents and marks them passed after a successful scan", async () => {
    const result = await processTenantDocumentScanCommand({
      organizationId: "org_a",
      documentId: "doc_a",
      moduleId: "finance",
    });

    expect(result).toBe("passed");
    expect(dbMocks.claimTenantDocumentForScan).toHaveBeenCalled();
    expect(dbMocks.updateTenantDocumentScanStatus).toHaveBeenCalledWith({
      organizationId: "org_a",
      documentId: "doc_a",
      scanStatus: "passed",
    });
  });

  it("records malware evidence when a scan quarantines a document", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ status: "quarantined" }, { status: 200 }),
      ),
    );

    const { getDocumentAvEnv } = await import("@afenda/config/env");
    vi.mocked(getDocumentAvEnv).mockReturnValue({
      apiUrl: "https://av.example/scan",
      staleScanningMinutes: 30,
    });

    const result = await processTenantDocumentScanCommand({
      organizationId: "org_a",
      documentId: "doc_a",
      moduleId: "finance",
    });

    expect(result).toBe("quarantined");
    expect(writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DOCUMENT_MALWARE_DETECTED" }),
    );

    vi.unstubAllGlobals();
  });

  it("accepts async AV webhook callbacks with bearer auth", async () => {
    const response = await handleDocumentScanWebhookPost(
      new Request("http://localhost/api/internal/v1/webhooks/document-scan-result", {
        method: "POST",
        headers: {
          authorization: "Bearer av-webhook-secret",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          organizationId: "org_a",
          documentId: "doc_a",
          moduleId: "finance",
          status: "passed",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      status: "passed",
    });
  });

  it("rejects AV webhook callbacks without authorization", async () => {
    const response = await handleDocumentScanWebhookPost(
      new Request("http://localhost/api/internal/v1/webhooks/document-scan-result", {
        method: "POST",
        body: JSON.stringify({
          organizationId: "org_a",
          documentId: "doc_a",
          moduleId: "finance",
          status: "passed",
        }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("is idempotent when webhook reports an already terminal status", async () => {
    dbMocks.getTenantDocument.mockResolvedValueOnce({
      id: "doc_a",
      title: "Invoice.pdf",
      pathname: "tenants/org_a/finance/invoice.pdf",
      blobUrl: "https://blob.example/invoice.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
      access: "private",
      moduleId: "finance",
      classification: "internal",
      retentionClass: "standard",
      scanStatus: "passed",
    });

    const status = await reportTenantDocumentScanResultCommand({
      organizationId: "org_a",
      documentId: "doc_a",
      moduleId: "finance",
      status: "failed",
    });

    expect(status).toBe("passed");
    expect(dbMocks.updateTenantDocumentScanStatus).not.toHaveBeenCalled();
  });

  it("sweeps pending documents across organizations", async () => {
    const result = await executeDocumentScanSweepCommand();

    expect(result).toMatchObject({
      mode: "all-orgs",
      organizationCount: 1,
      scannedDocumentCount: 1,
    });
  });
});
