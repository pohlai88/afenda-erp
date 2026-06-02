import { describe, expect, it, vi } from "vitest";

const TenantDocumentMutationError = vi.hoisted(
  () =>
    class extends Error {
      readonly code:
        | "not_found"
        | "legal_hold"
        | "not_on_legal_hold"
        | "scan_not_releasable";

      constructor(
        code:
          | "not_found"
          | "legal_hold"
          | "not_on_legal_hold"
          | "scan_not_releasable",
      ) {
        super(code);
        this.code = code;
      }
    },
);

const HrDocumentCommandError = vi.hoisted(
  () =>
    class extends Error {
      readonly code: string;

      constructor(code: string) {
        super(code);
        this.code = code;
      }
    },
);

vi.mock("@afenda/db", () => ({
  TenantDocumentMutationError,
  HrDocumentCommandError,
  deleteTenantDocument: vi.fn(async () => ({
    id: "doc_a",
    title: "Invoice.pdf",
    pathname: "tenants/org_a/finance/invoice.pdf",
    classification: "internal",
    retentionClass: "standard",
    scanStatus: "passed",
  })),
  getTenantDocumentStorageRef: vi.fn(async () => ({
    id: "doc_a",
    title: "Invoice.pdf",
    moduleId: "finance",
    pathname: "tenants/org_a/finance/invoice.pdf",
    blobUrl: "https://blob.example/invoice.pdf",
    classification: "internal",
    retentionClass: "standard",
    scanStatus: "passed",
  })),
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
    scanStatus: "pending",
  })),
  claimTenantDocumentForScan: vi.fn(async () => true),
  updateTenantDocumentScanStatus: vi.fn(async () => undefined),
  releaseTenantDocumentLegalHold: vi.fn(async () => ({
    id: "doc_a",
    title: "Invoice.pdf",
    retentionClass: "standard",
  })),
  applyTenantDocumentLegalHold: vi.fn(async () => ({
    id: "doc_a",
    title: "Invoice.pdf",
    retentionClass: "standard",
  })),
  cascadeOrganizationLegalHoldToDocuments: vi.fn(async () => ({
    erpUpdatedCount: 2,
    hrUpdatedCount: 1,
  })),
  releaseTenantDocumentFromScanQuarantine: vi.fn(async () => ({
    id: "doc_a",
    title: "Invoice.pdf",
    moduleId: "finance",
    pathname: "tenants/org_a/finance/invoice.pdf",
    classification: "internal",
    retentionClass: "standard",
    previousScanStatus: "quarantined",
  })),
  isOrganizationDocumentLegalHoldActive: vi.fn(async () => false),
  isHrEmployeeDocumentOnLegalHold: vi.fn((legalHold: boolean) => legalHold),
  deleteHrEmployeeDocument: vi.fn(async () => ({
    id: "hr_doc_a",
    title: "Contract.pdf",
    pathname: "tenants/org_a/hr/contract.pdf",
    classification: "confidential",
  })),
  getHrEmployeeDocumentStorageRef: vi.fn(async () => ({
    id: "hr_doc_a",
    title: "Contract.pdf",
    pathname: "tenants/org_a/hr/contract.pdf",
    blobUrl: "https://blob.example/contract.pdf",
    lifecycleStatus: "archived",
    legalHold: false,
    classification: "confidential",
    employeeId: "emp_a",
  })),
  getOrganizationObjectStorageProvider: vi.fn(async () => null),
  getOrganizationEncryptionSettings: vi.fn(async () => ({
    mode: "platform" as const,
    kmsAdapter: null,
    kmsKeyRef: null,
  })),
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
  buildObjectStorageEncryptionContext: vi.fn(() => ({
    mode: "platform" as const,
    kms: null,
  })),
  decryptStoredDocumentBody: vi.fn(async () => null),
}));

vi.mock("@afenda/kernel/execution", () => ({
  writeExecutionAuditEvent: vi.fn(async () => undefined),
}));

import {
  deleteHrEmployeeDocument,
  deleteTenantDocument,
  getHrEmployeeDocumentStorageRef,
  getTenantDocument,
  getTenantDocumentStorageRef,
  isOrganizationDocumentLegalHoldActive,
  updateTenantDocumentScanStatus,
} from "@afenda/db";
import { createObjectStore } from "@afenda/object-storage/server";
import { writeExecutionAuditEvent } from "@afenda/kernel/execution";
import { deleteTenantDocumentCommand } from "../../src/tenant-execution/commands/delete-tenant-document.command.server";
import { destroyHrEmployeeDocumentCommand } from "../../src/tenant-execution/commands/destroy-hr-employee-document.command.server";
import { processTenantDocumentScanCommand } from "../../src/tenant-execution/commands/process-tenant-document-scan.command.server";
import { releaseLegalHoldToTenantDocumentCommand } from "../../src/tenant-execution/commands/release-legal-hold-to-tenant-document.command.server";
import { releaseTenantDocumentScanQuarantineCommand } from "../../src/tenant-execution/commands/release-tenant-document-scan-quarantine.command.server";
import { applyLegalHoldToTenantDocumentCommand } from "../../src/tenant-execution/commands/apply-legal-hold-to-tenant-document.command.server";
import { cascadeOrganizationLegalHoldCommand } from "../../src/tenant-execution/commands/cascade-organization-legal-hold.command.server";

describe("tenant document lifecycle commands", () => {
  it("purges object bytes before deleting the registry row", async () => {
    await deleteTenantDocumentCommand({
      organizationId: "org_a",
      documentId: "doc_a",
      moduleId: "finance",
      actorAuthUserId: "user_a",
    });

    expect(getTenantDocumentStorageRef).toHaveBeenCalledWith({
      organizationId: "org_a",
      documentId: "doc_a",
    });
    expect(createObjectStore).toHaveBeenCalled();
    const store = vi.mocked(createObjectStore).mock.results.at(-1)?.value as {
      deleteObject: ReturnType<typeof vi.fn>;
    };
    expect(store.deleteObject).toHaveBeenCalledWith({
      pathname: "tenants/org_a/finance/invoice.pdf",
      blobUrl: "https://blob.example/invoice.pdf",
    });
    expect(deleteTenantDocument).toHaveBeenCalled();
    expect(writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DOCUMENT_DELETED" }),
    );
  });

  it("marks pending documents passed after a successful head scan", async () => {
    vi.mocked(getTenantDocument).mockResolvedValueOnce({
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
      metadata: {},
    });

    const result = await processTenantDocumentScanCommand({
      organizationId: "org_a",
      documentId: "doc_a",
      moduleId: "finance",
    });

    expect(result).toBe("passed");
    expect(updateTenantDocumentScanStatus).toHaveBeenCalledWith({
      organizationId: "org_a",
      documentId: "doc_a",
      scanStatus: "passed",
    });
  });

  it("emits retention expiry evidence before deleting the document", async () => {
    vi.mocked(getTenantDocumentStorageRef).mockResolvedValueOnce({
      id: "doc_a",
      title: "Invoice.pdf",
      moduleId: "finance",
      pathname: "tenants/org_a/finance/invoice.pdf",
      blobUrl: "https://blob.example/invoice.pdf",
      classification: "internal",
      retentionClass: "short-term",
      scanStatus: "passed",
    });

    const { expireTenantDocumentCommand } = await import(
      "../../src/tenant-execution/commands/expire-tenant-document.command.server"
    );

    await expireTenantDocumentCommand({
      organizationId: "org_a",
      documentId: "doc_a",
      moduleId: "finance",
      actorAuthUserId: "user_a",
    });

    expect(writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DOCUMENT_RETENTION_EXPIRED" }),
    );
    expect(writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DOCUMENT_DELETED" }),
    );
  });

  it("purges archived HR document bytes before removing the registry row", async () => {
    await destroyHrEmployeeDocumentCommand({
      organizationId: "org_a",
      documentId: "hr_doc_a",
      actorAuthUserId: "user_a",
    });

    expect(getHrEmployeeDocumentStorageRef).toHaveBeenCalledWith({
      organizationId: "org_a",
      documentId: "hr_doc_a",
    });
    const store = vi.mocked(createObjectStore).mock.results.at(-1)?.value as {
      deleteObject: ReturnType<typeof vi.fn>;
    };
    expect(store.deleteObject).toHaveBeenCalledWith({
      pathname: "tenants/org_a/hr/contract.pdf",
      blobUrl: "https://blob.example/contract.pdf",
    });
    expect(deleteHrEmployeeDocument).toHaveBeenCalled();
    expect(writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DOCUMENT_DELETED",
        metadata: expect.objectContaining({ source: "hr-archived-destruction" }),
      }),
    );
  });

  it("blocks ERP delete when organization legal hold is active", async () => {
    vi.mocked(deleteTenantDocument).mockClear();
    vi.mocked(isOrganizationDocumentLegalHoldActive).mockResolvedValueOnce(true);

    await expect(
      deleteTenantDocumentCommand({
        organizationId: "org_a",
        documentId: "doc_a",
        moduleId: "finance",
        actorAuthUserId: "user_a",
      }),
    ).rejects.toBeInstanceOf(TenantDocumentMutationError);

    expect(deleteTenantDocument).not.toHaveBeenCalled();
  });

  it("blocks HR destroy when document legal hold is active", async () => {
    vi.mocked(deleteHrEmployeeDocument).mockClear();
    vi.mocked(getHrEmployeeDocumentStorageRef).mockResolvedValueOnce({
      id: "hr_doc_a",
      title: "Contract.pdf",
      pathname: "tenants/org_a/hr/contract.pdf",
      blobUrl: "https://blob.example/contract.pdf",
      lifecycleStatus: "archived",
      legalHold: true,
      classification: "confidential",
      employeeId: "emp_a",
    });

    await expect(
      destroyHrEmployeeDocumentCommand({
        organizationId: "org_a",
        documentId: "hr_doc_a",
        actorAuthUserId: "user_a",
      }),
    ).rejects.toBeInstanceOf(HrDocumentCommandError);

    expect(deleteHrEmployeeDocument).not.toHaveBeenCalled();
  });

  it("blocks HR destroy when organization legal hold is active", async () => {
    vi.mocked(deleteHrEmployeeDocument).mockClear();
    vi.mocked(isOrganizationDocumentLegalHoldActive).mockResolvedValueOnce(true);

    await expect(
      destroyHrEmployeeDocumentCommand({
        organizationId: "org_a",
        documentId: "hr_doc_a",
        actorAuthUserId: "user_a",
      }),
    ).rejects.toBeInstanceOf(HrDocumentCommandError);

    expect(deleteHrEmployeeDocument).not.toHaveBeenCalled();
  });

  it("records evidence when legal hold is released", async () => {
    const { releaseTenantDocumentLegalHold } = await import("@afenda/db");

    await releaseLegalHoldToTenantDocumentCommand({
      organizationId: "org_a",
      documentId: "doc_a",
      moduleId: "finance",
      actorAuthUserId: "user_a",
    });

    expect(releaseTenantDocumentLegalHold).toHaveBeenCalled();
    expect(writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DOCUMENT_LEGAL_HOLD_RELEASED" }),
    );
  });

  it("records evidence when scan quarantine is released", async () => {
    const { releaseTenantDocumentFromScanQuarantine } = await import("@afenda/db");

    await releaseTenantDocumentScanQuarantineCommand({
      organizationId: "org_a",
      documentId: "doc_a",
      moduleId: "finance",
      actorAuthUserId: "user_a",
    });

    expect(releaseTenantDocumentFromScanQuarantine).toHaveBeenCalled();
    expect(writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DOCUMENT_SCAN_QUARANTINE_RELEASED" }),
    );
  });

  it("records evidence when legal hold is applied", async () => {
    const { applyTenantDocumentLegalHold } = await import("@afenda/db");

    await applyLegalHoldToTenantDocumentCommand({
      organizationId: "org_a",
      documentId: "doc_a",
      moduleId: "finance",
      actorAuthUserId: "user_a",
    });

    expect(applyTenantDocumentLegalHold).toHaveBeenCalled();
    expect(writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DOCUMENT_LEGAL_HOLD_APPLIED" }),
    );
  });

  it("records evidence when organization legal hold cascades", async () => {
    const { cascadeOrganizationLegalHoldToDocuments } = await import("@afenda/db");

    await cascadeOrganizationLegalHoldCommand({
      organizationId: "org_a",
      actorAuthUserId: "user_a",
    });

    expect(cascadeOrganizationLegalHoldToDocuments).toHaveBeenCalled();
    expect(writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DOCUMENT_ORG_LEGAL_HOLD_CASCADED" }),
    );
  });
});
