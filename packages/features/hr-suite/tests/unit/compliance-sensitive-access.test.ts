import { describe, expect, it } from "vitest";

import { buildHrComplianceEvidenceLinksListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-evidence-links-list.surface";
import { buildHrComplianceWorkAuthDocumentsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-work-auth-documents-list.surface";
import {
  COMPLIANCE_SENSITIVE_FIELD_MASK,
  filterComplianceDocumentPickerOptions,
  isComplianceEvidenceLinkSensitive,
  isHrComplianceSensitiveRecordKind,
  maskComplianceSensitiveDisplayText,
  maskComplianceSensitiveStoredValue,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-sensitive-access.shared";

describe("HRM-CMP-024 compliance sensitive access", () => {
  it("masks display text and clears serialized values when unauthorized", () => {
    expect(maskComplianceSensitiveDisplayText("A1234567", false)).toBe(
      COMPLIANCE_SENSITIVE_FIELD_MASK,
    );
    expect(maskComplianceSensitiveStoredValue("A1234567", false)).toBe("");
    expect(maskComplianceSensitiveDisplayText("A1234567", true)).toBe(
      "A1234567",
    );
  });

  it("filters restricted document picker options for non-sensitive readers", () => {
    const options = filterComplianceDocumentPickerOptions(
      [
        { value: "doc_1", classification: "internal" },
        { value: "doc_2", classification: "restricted" },
      ],
      false,
    );

    expect(options.map((option) => option.value)).toEqual(["doc_1"]);
  });

  it("classifies sensitive evidence record kinds", () => {
    expect(isHrComplianceSensitiveRecordKind("work_auth_document")).toBe(true);
    expect(isHrComplianceSensitiveRecordKind("filing")).toBe(false);
  });

  it("redacts work authorization document numbers in governed list rows", () => {
    const surface = buildHrComplianceWorkAuthDocumentsListSurface({
      canViewSensitive: false,
      window: {
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
        rows: [
          {
            id: "wa_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            documentType: "passport",
            status: "pending_verification",
            documentNumber: "P1234567",
            issuedAt: null,
            expiresAt: new Date("2026-12-01T00:00:00.000Z"),
            verifiedAt: null,
            reviewNotes: "Passport scan received",
            linkedEvidenceCount: 0,
          },
        ],
      },
    });

    const row = surface.rows[0]!;
    expect(row.cells.documentNumber).toBe(COMPLIANCE_SENSITIVE_FIELD_MASK);
    expect(row.cells.documentNumberValue).toBe("");
    expect(row.cells.reviewNotesValue).toBe("");
    expect(row.trailingAction).toBeUndefined();
  });

  it("masks restricted evidence document titles while keeping submission posture", () => {
    expect(
      isComplianceEvidenceLinkSensitive({
        documentClassification: "restricted",
      }),
    ).toBe(true);

    const surface = buildHrComplianceEvidenceLinksListSurface({
      canViewSensitive: false,
      window: {
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
        rows: [
          {
            id: "ev_1",
            recordKind: "filing",
            recordId: "fil_1",
            recordLabel: "EPF filing",
            employeeId: null,
            employeeNumber: null,
            employeeDisplayName: null,
            employeeDocumentId: "doc_1",
            documentTitle: "Passport scan",
            documentType: "passport",
            documentClassification: "restricted",
            submissionState: "submitted",
            notes: "Submitted to regulator",
            submittedAt: new Date("2026-05-01T12:00:00.000Z"),
            acknowledgedAt: null,
            createdAt: new Date("2026-05-01T12:00:00.000Z"),
          },
        ],
      },
    });

    const row = surface.rows[0]!;
    expect(row.cells.documentTitle).toBe(COMPLIANCE_SENSITIVE_FIELD_MASK);
    expect(row.cells.notesValue).toBe("");
    expect(row.cells.submissionState).toBe("Submitted");
    expect(row.trailingAction).toBeUndefined();
  });
});
