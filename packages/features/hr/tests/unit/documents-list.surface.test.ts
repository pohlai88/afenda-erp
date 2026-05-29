import { describe, expect, it } from "vitest";
import {
  buildHrDocumentsListSurface,
  hrDocumentsSurfaceKey,
} from "../../src/workforce/documents/surface/hr-documents-list.surface";

describe("hr workforce documents list surface", () => {
  it("builds governed list configuration with stable surface key", () => {
    const configuration = buildHrDocumentsListSurface({
      window: {
        rows: [
          {
            id: "doc_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            documentType: "identity",
            title: "Passport scan",
            mimeType: "application/pdf",
            sizeBytes: 2048,
            classification: "confidential",
            verificationStatus: "pending",
            lifecycleStatus: "active",
            effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
            effectiveTo: null,
            uploadedAt: new Date("2026-05-01T12:00:00.000Z"),
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      searchValue: "passport",
    });

    expect(hrDocumentsSurfaceKey).toBe("hr.workforce.documents.list");
    expect(configuration.rows).toHaveLength(1);
    expect(configuration.rows[0]?.cells.title).toBe("Passport scan");
    expect(configuration.rows[0]?.cells.expiresOn).toBe("—");
    expect(configuration.rows[0]?.cells.employee).toBe("E-100 — Alex Operator");
    expect(configuration.pagination?.totalCount).toBe(1);
    expect(configuration.presentation?.toolbar?.search?.value).toBe("passport");
    expect(configuration.surface?.empty?.title).toBe("No documents yet");
  });
});
