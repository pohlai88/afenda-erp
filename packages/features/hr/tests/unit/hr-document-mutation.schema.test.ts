import { describe, expect, it } from "vitest";
import {
  hrRegisterDocumentActionSchema,
  hrRejectDocumentActionSchema,
} from "../../src/workforce/documents/schemas/hr-document-mutation.schema";

describe("hr document mutation schemas", () => {
  it("accepts register payload with optional effective dates", () => {
    const parsed = hrRegisterDocumentActionSchema.safeParse({
      employeeId: "emp_1",
      documentType: "identity",
      title: "Passport",
      blobUrl: "https://example.test/passport.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      effectiveFrom: "2026-01-01",
      effectiveTo: "2031-01-01",
    });

    expect(parsed.success).toBe(true);
  });

  it("requires rejection reason on reject", () => {
    const missing = hrRejectDocumentActionSchema.safeParse({
      documentId: "doc_1",
      rejectionReason: "",
    });
    expect(missing.success).toBe(false);

    const valid = hrRejectDocumentActionSchema.safeParse({
      documentId: "doc_1",
      rejectionReason: "Image is unreadable.",
    });
    expect(valid.success).toBe(true);
  });
});
