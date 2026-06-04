import { describe, expect, it, vi } from "vitest";

vi.mock("@afenda/db", () => ({
  getOrganizationDocumentStorageBytes: vi.fn(async () => 1024),
  getTenantDocument: vi.fn(async () => null),
  getHrEmployeeDocumentForDownload: vi.fn(async () => null),
}));

vi.mock("@afenda/kernel/execution", () => ({
  requireExecutionContext: vi.fn(async () => ({
    organizationId: "org_a",
    capabilities: ["hr.documents.read"],
  })),
  hasExecutionPermission: vi.fn(() => false),
  writeExecutionAuditEvent: vi.fn(async () => undefined),
}));

import { getOrganizationDocumentStorageBytes, getHrEmployeeDocumentForDownload, getTenantDocument } from "@afenda/db";
import {
  hasExecutionPermission,
  writeExecutionAuditEvent,
} from "@afenda/kernel/execution";
import {
  assertTenantUploadQuota,
  authorizeTenantDocumentDownload,
  createTenantObjectStorageDownloadDeps,
  recordTenantDocumentEvidenceEvent,
} from "../../src/features/tenant-execution/sys-object-storage-governance.server";

describe("tenant object-storage governance", () => {
  it("writes document evidence events to the execution audit ledger", async () => {
    await recordTenantDocumentEvidenceEvent({
      action: "DOCUMENT_UPLOADED",
      organizationId: "org_a",
      moduleId: "finance",
      userId: "user_a",
      timestamp: "2026-06-02T10:00:00.000Z",
      documentId: "doc_a",
      pathname: "tenants/org_a/finance/file.pdf",
    });

    expect(writeExecutionAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DOCUMENT_UPLOADED",
        targetType: "document",
        targetId: "doc_a",
      }),
    );
  });

  it("denies sensitive downloads without the required capability", async () => {
    const decision = await authorizeTenantDocumentDownload({
      organizationId: "org_a",
      moduleId: "hr",
      documentId: "doc_a",
      pathname: "tenants/org_a/hr/file.pdf",
      access: "private",
      classification: "confidential",
      requestedByAuthUserId: "user_a",
    });

    expect(decision).toEqual({
      allowed: false,
      status: 403,
      reason: "Sensitive document access is required.",
    });
  });

  it.each(["reports", "approvals"] as const)(
    "denies sensitive %s downloads without module sensitive.read capability",
    async (moduleId) => {
      const decision = await authorizeTenantDocumentDownload({
        organizationId: "org_a",
        moduleId,
        documentId: "doc_a",
        pathname: `tenants/org_a/${moduleId}/file.pdf`,
        access: "private",
        classification: "confidential",
        requestedByAuthUserId: "user_a",
      });

      expect(decision).toEqual({
        allowed: false,
        status: 403,
        reason: "Sensitive document access is required.",
      });
    },
  );

  it("blocks uploads when quota would be exceeded", async () => {
    vi.mocked(getOrganizationDocumentStorageBytes).mockResolvedValueOnce(
      50 * 1024 * 1024 * 1024,
    );

    const decision = await assertTenantUploadQuota({
      organizationId: "org_a",
      moduleId: "finance",
      pathname: "tenants/org_a/finance/file.pdf",
      sizeBytes: 1024,
      contentType: "application/pdf",
      access: "private",
      classification: "internal",
      retentionClass: "standard",
      uploadedByAuthUserId: "user_a",
    });

    expect(decision).toMatchObject({
      allowed: false,
      status: 429,
    });
  });

  it("allows non-sensitive downloads without extra capability", async () => {
    vi.mocked(hasExecutionPermission).mockReturnValueOnce(false);

    const decision = await authorizeTenantDocumentDownload({
      organizationId: "org_a",
      moduleId: "finance",
      documentId: "doc_a",
      pathname: "tenants/org_a/finance/file.pdf",
      access: "private",
      classification: "internal",
      requestedByAuthUserId: "user_a",
    });

    expect(decision).toBeUndefined();
  });

  it("resolves HR vault documents via the composite download port", async () => {
    vi.mocked(getHrEmployeeDocumentForDownload).mockResolvedValueOnce({
      id: "hr_doc_a",
      title: "Contract.pdf",
      pathname: "tenants/org_a/hr/contract.pdf",
      classification: "internal",
      verificationStatus: "verified",
    });

    const deps = createTenantObjectStorageDownloadDeps();
    const document = await deps.getTenantDocument({
      organizationId: "org_a",
      documentId: "hr_doc_a",
      moduleId: "hr",
    });

    expect(getHrEmployeeDocumentForDownload).toHaveBeenCalledWith({
      organizationId: "org_a",
      documentId: "hr_doc_a",
    });
    expect(getTenantDocument).not.toHaveBeenCalled();
    expect(document).toMatchObject({
      id: "hr_doc_a",
      moduleId: "hr",
      pathname: "tenants/org_a/hr/contract.pdf",
      access: "private",
      scanStatus: "passed",
    });
  });

  it("maps pending HR verification to a blocked scan status", async () => {
    vi.mocked(getHrEmployeeDocumentForDownload).mockResolvedValueOnce({
      id: "hr_doc_b",
      title: "Pending.pdf",
      pathname: "tenants/org_a/hr/pending.pdf",
      classification: "internal",
      verificationStatus: "pending",
    });

    const deps = createTenantObjectStorageDownloadDeps();
    const document = await deps.getTenantDocument({
      organizationId: "org_a",
      documentId: "hr_doc_b",
      moduleId: "hr",
    });

    expect(document?.scanStatus).toBe("pending");
  });
});
