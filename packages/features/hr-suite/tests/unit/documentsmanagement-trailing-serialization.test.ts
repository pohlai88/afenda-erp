import { describe, expect, it } from "vitest";

import { buildHrDocumentsRepositoryListSurface } from "../../src/employee-management/documents-management/surface/hr.workforce.documents-repository-list.surface";

describe("documents Pattern C trailing cell serialization", () => {
  it("serializes verification and replace prefill cells without leaking blob URLs", () => {
    const effectiveTo = new Date("2026-12-31T00:00:00.000Z");

    const repository = buildHrDocumentsRepositoryListSurface({
      window: {
        rows: [
          {
            id: "doc_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            documentType: "passport",
            documentGroup: null,
            title: "Passport scan",
            blobUrl: "https://storage.example/passport.pdf",
            mimeType: "application/pdf",
            sizeBytes: 1024,
            classification: "internal",
            verificationStatus: "pending",
            lifecycleStatus: "active",
            effectiveFrom: effectiveTo,
            effectiveTo,
            rejectionReason: null,
            versionNumber: 1,
            isLatestActive: true,
            supersedesDocumentId: null,
            uploadedAt: effectiveTo,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
      canViewSensitive: true,
    });

    expect(repository.rows[0]?.cells.effectiveToInput).toBeTruthy();
    expect(repository.rows[0]?.cells.effectiveVerificationValue).toBe("pending");
    expect(repository.rows[0]?.cells.employeeIdValue).toBe("emp_1");
    expect(repository.rows[0]?.cells.titleValue).toBe("Passport scan");
    expect(repository.rows[0]?.cells.blobUrlValue).toBeUndefined();
    expect(repository.rows[0]?.trailingAction?.state).toBe("ready");
  });

  it("masks restricted document payload cells without sensitive read access", () => {
    const effectiveTo = new Date("2026-12-31T00:00:00.000Z");

    const repository = buildHrDocumentsRepositoryListSurface({
      window: {
        rows: [
          {
            id: "doc_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            documentType: "medical",
            documentGroup: null,
            title: "Medical report",
            blobUrl: "https://storage.example/medical.pdf",
            mimeType: "application/pdf",
            sizeBytes: 1024,
            classification: "restricted",
            verificationStatus: "pending",
            lifecycleStatus: "active",
            effectiveFrom: effectiveTo,
            effectiveTo,
            rejectionReason: null,
            versionNumber: 1,
            isLatestActive: true,
            supersedesDocumentId: null,
            uploadedAt: effectiveTo,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
      canViewSensitive: false,
    });

    expect(repository.rows[0]?.cells.title).toBe("Restricted document");
    expect(repository.rows[0]?.cells.titleValue).toBe("Restricted document");
    expect(repository.rows[0]?.cells.blobUrlValue).toBeUndefined();
    expect(repository.rows[0]?.trailingAction?.state).not.toBe("ready");
  });
});
