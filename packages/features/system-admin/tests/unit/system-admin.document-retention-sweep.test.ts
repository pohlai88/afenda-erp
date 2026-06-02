import { beforeEach, describe, expect, it, vi } from "vitest";

const TenantDocumentMutationError = vi.hoisted(
  () =>
    class extends Error {
      readonly code: string;

      constructor(code: string) {
        super(code);
        this.code = code;
      }
    },
);

const dbMocks = vi.hoisted(() => ({
  deleteTenantDocument: vi.fn(async () => ({
    id: "doc_a",
    title: "Invoice.pdf",
    pathname: "tenants/org_a/finance/invoice.pdf",
    classification: "internal",
    retentionClass: "short-term",
    scanStatus: "passed",
  })),
  getTenantDocumentStorageRef: vi.fn(async () => ({
    id: "doc_a",
    title: "Invoice.pdf",
    moduleId: "finance",
    pathname: "tenants/org_a/finance/invoice.pdf",
    blobUrl: "https://blob.example/invoice.pdf",
    classification: "internal",
    retentionClass: "short-term",
    scanStatus: "passed",
  })),
  isOrganizationDocumentLegalHoldActive: vi.fn(async () => false),
  listHrEmployeeDocumentsEligibleForDestruction: vi.fn(async () => []),
  listOrganizationsForCoreErpSeed: vi.fn(async () => [
    { id: "org_a", ownerAuthUserId: "user_owner" },
  ]),
  listTenantDocumentsPastRetentionExpiry: vi.fn(async () => [
    {
      id: "doc_a",
      moduleId: "finance",
      title: "Invoice.pdf",
      retentionClass: "short-term",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    },
  ]),
  runHrDocumentExpirySweep: vi.fn(async () => ({
    expiredCount: 0,
    errorCount: 0,
    errors: [],
  })),
}));

vi.mock("@afenda/db", () => ({
  TenantDocumentMutationError,
  ...dbMocks,
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
    deleteObject: vi.fn(async () => undefined),
  })),
}));

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: vi.fn(async () => undefined),
}));

import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { executeDocumentRetentionExpirySweepCommand } from "../../src/tenant-execution/commands/document-retention-expiry-sweep.command.server";

describe("document retention expiry sweep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.isOrganizationDocumentLegalHoldActive.mockResolvedValue(false);
    dbMocks.listOrganizationsForCoreErpSeed.mockResolvedValue([
      { id: "org_a", ownerAuthUserId: "user_owner" },
    ]);
    dbMocks.listTenantDocumentsPastRetentionExpiry.mockResolvedValue([
      {
        id: "doc_a",
        moduleId: "finance",
        title: "Invoice.pdf",
        retentionClass: "short-term",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      },
    ]);
    dbMocks.runHrDocumentExpirySweep.mockResolvedValue({
      expiredCount: 0,
      errorCount: 0,
      errors: [],
    });
    dbMocks.listHrEmployeeDocumentsEligibleForDestruction.mockResolvedValue([]);
  });

  it("sweeps expired documents across organizations", async () => {
    const result = await executeDocumentRetentionExpirySweepCommand();

    expect(result).toMatchObject({
      mode: "all-orgs",
      organizationCount: 1,
      completedOrganizationCount: 1,
      expiredDocumentCount: 1,
    });
    expect(dbMocks.listTenantDocumentsPastRetentionExpiry).toHaveBeenCalled();
    expect(writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DOCUMENT_RETENTION_EXPIRED" }),
    );
    expect(writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DOCUMENT_DELETED" }),
    );
  });

  it("skips organizations under active legal hold", async () => {
    dbMocks.isOrganizationDocumentLegalHoldActive.mockResolvedValue(true);

    const result = await executeDocumentRetentionExpirySweepCommand();

    expect(result).toMatchObject({
      mode: "all-orgs",
      organizationCount: 1,
      expiredDocumentCount: 0,
      organizations: [
        expect.objectContaining({
          organizationId: "org_a",
          skipped: true,
          reason: "organization_legal_hold",
        }),
      ],
    });
    expect(dbMocks.deleteTenantDocument).not.toHaveBeenCalled();
  });

  it("runs HR expiry and destruction sweeps alongside ERP expiry", async () => {
    dbMocks.runHrDocumentExpirySweep.mockResolvedValueOnce({
      expiredCount: 2,
      errorCount: 0,
      errors: [],
    });

    const result = await executeDocumentRetentionExpirySweepCommand();

    expect(dbMocks.runHrDocumentExpirySweep).toHaveBeenCalled();
    expect(result).toMatchObject({
      hrDocumentExpirySweep: {
        expiredCount: 2,
        errorCount: 0,
        errors: [],
      },
      hrDocumentDestructionSweep: expect.objectContaining({
        mode: "all-orgs",
      }),
    });
  });
});
