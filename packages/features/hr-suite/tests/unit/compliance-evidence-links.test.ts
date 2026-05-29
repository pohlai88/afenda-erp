import { describe, expect, it } from "vitest";

import {
  HR_COMPLIANCE_EVIDENCE_RECORD_KINDS,
  HR_COMPLIANCE_EVIDENCE_SUBMISSION_STATES,
  isHrComplianceEvidenceRecordKind,
  isHrComplianceEvidenceSubmissionState,
} from "@afenda/db";

import {
  parseLinkHrComplianceEvidenceForm,
  parseUnlinkHrComplianceEvidenceForm,
  parseUpdateHrComplianceEvidenceSubmissionStateForm,
} from "../../src/employee-management/compliance-regulatory-tracking/schemas/hr.workforce.compliance-evidence-link.schema";
import { buildHrComplianceEvidenceLinksListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-evidence-links-list.surface";
import { hrComplianceEvidenceLinksSurfaceKey } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-evidence-links-list.surface";

describe("HRM-CMP-020 evidence link shared contracts", () => {
  it("declares supported compliance record kinds", () => {
    expect(HR_COMPLIANCE_EVIDENCE_RECORD_KINDS).toEqual([
      "filing",
      "employee_requirement",
      "work_auth_document",
      "work_eligibility",
      "exception",
    ]);
  });

  it("validates record kind and submission state tokens", () => {
    expect(isHrComplianceEvidenceRecordKind("filing")).toBe(true);
    expect(isHrComplianceEvidenceRecordKind("unknown")).toBe(false);
    expect(isHrComplianceEvidenceSubmissionState("submitted")).toBe(true);
    expect(isHrComplianceEvidenceSubmissionState("overdue")).toBe(false);
    expect(HR_COMPLIANCE_EVIDENCE_SUBMISSION_STATES).toContain("acknowledged");
  });
});

describe("HRM-CMP-020 evidence link form parsing", () => {
  it("parses link, unlink, and submission state mutation payloads", () => {
    const linkForm = new FormData();
    linkForm.set("recordKind", "work_auth_document");
    linkForm.set("recordId", "wad_1");
    linkForm.set("employeeDocumentId", "doc_1");
    linkForm.set("notes", "audit copy");

    expect(parseLinkHrComplianceEvidenceForm(linkForm).success).toBe(true);

    const unlinkForm = new FormData();
    unlinkForm.set("evidenceLinkId", "ev_1");
    expect(parseUnlinkHrComplianceEvidenceForm(unlinkForm).success).toBe(true);

    const updateForm = new FormData();
    updateForm.set("evidenceLinkId", "ev_1");
    updateForm.set("submissionState", "submitted");
    expect(
      parseUpdateHrComplianceEvidenceSubmissionStateForm(updateForm).success,
    ).toBe(true);
  });

  it("rejects invalid record kinds and empty record ids", () => {
    const invalidKind = new FormData();
    invalidKind.set("recordKind", "unknown");
    invalidKind.set("recordId", "wad_1");
    invalidKind.set("employeeDocumentId", "doc_1");
    expect(parseLinkHrComplianceEvidenceForm(invalidKind).success).toBe(false);

    const missingRecordId = new FormData();
    missingRecordId.set("recordKind", "filing");
    missingRecordId.set("employeeDocumentId", "doc_1");
    expect(parseLinkHrComplianceEvidenceForm(missingRecordId).success).toBe(
      false,
    );
  });
});

describe("buildHrComplianceEvidenceLinksListSurface", () => {
  it("serializes submission state for trailing cells and registers surface metadata", () => {
    const linkedAt = new Date("2026-05-01T12:00:00.000Z");
    const surface = buildHrComplianceEvidenceLinksListSurface({
      canWrite: true,
      canViewSensitive: true,
      window: {
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
        rows: [
          {
            id: "hr_cmp_ev_test",
            recordKind: "work_auth_document",
            recordId: "hr_cmp_wad_test",
            recordLabel: "E-001 · work permit",
            employeeId: "hr_emp_test",
            employeeNumber: "E-001",
            employeeDisplayName: "Alex Operator",
            employeeDocumentId: "hr_doc_test",
            documentTitle: "Work permit scan",
            documentType: "work_permit",
            documentClassification: "internal",
            submissionState: "draft",
            notes: null,
            submittedAt: null,
            acknowledgedAt: null,
            createdAt: linkedAt,
          },
        ],
      },
    });

    expect(surface.surface.columnsId).toBe("hr.workforce.compliance.evidence-links");
    expect(surface.rows[0]?.cells.trailingSubmissionStateValue).toBe("draft");
    expect(surface.rows[0]?.cells.employeeDocumentIdValue).toBe("hr_doc_test");
    expect(surface.rows[0]?.cells.recordIdValue).toBe("hr_cmp_wad_test");
    expect(surface.rows[0]?.cells.documentTypeValue).toBe("work_permit");
    expect(surface.rows[0]?.trailingAction).toBeDefined();
    expect(hrComplianceEvidenceLinksSurfaceKey).toBe(
      "hr.workforce.compliance.evidence-links.list",
    );
  });

  it("omits trailing actions when write access is denied", () => {
    const surface = buildHrComplianceEvidenceLinksListSurface({
      canWrite: false,
      window: {
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
        rows: [
          {
            id: "hr_cmp_ev_readonly",
            recordKind: "filing",
            recordId: "hr_cmp_fil_test",
            recordLabel: "EPF-01 · EPF filing",
            employeeId: null,
            employeeNumber: null,
            employeeDisplayName: null,
            employeeDocumentId: "hr_doc_test",
            documentTitle: "Statutory filing pack",
            documentType: "statutory_filing",
            documentClassification: "internal",
            submissionState: "draft",
            notes: null,
            submittedAt: null,
            acknowledgedAt: null,
            createdAt: new Date("2026-05-01T12:00:00.000Z"),
          },
        ],
      },
    });

    expect(surface.rows[0]?.trailingAction).toBeUndefined();
  });
});
