import { describe, expect, it } from "vitest";

import { buildHrComplianceEvidenceLinksListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-evidence-links-list.surface";
import { buildHrComplianceExceptionsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-exceptions-list.surface";
import { buildHrComplianceFilingsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-filings-list.surface";
import { buildHrComplianceSafetyTrainingRequirementsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-safety-training-requirements-list.surface";
import { buildHrComplianceWorkAuthDocumentsListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-work-auth-documents-list.surface";
import { buildHrComplianceWorkEligibilityListSurface } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-work-eligibility-list.surface";

describe("compliance Pattern C trailing cell serialization", () => {
  it("serializes datetime-local prefill cells for trailing mutations", () => {
    const dueDate = new Date("2026-12-31T00:00:00.000Z");

    const filing = buildHrComplianceFilingsListSurface({
      window: {
        rows: [
          {
            id: "fil_1",
            obligationId: "obl_1",
            obligationCode: "EPF-01",
            obligationTitle: "EPF filing",
            complianceArea: "statutory",
            countryCode: "MY",
            legalEntityCode: null,
            workLocationCode: null,
            employmentType: null,
            workerCategory: null,
            departmentName: null,
            status: "pending",
            filingDeadline: dueDate,
            submittedAt: null,
            confirmedAt: null,
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(filing.rows[0]?.cells.filingDeadlineInput).toBeTruthy();
    expect(filing.rows[0]?.cells.trailingStatusValue).toBe("pending");
    expect(filing.rows[0]?.cells.effectiveStatusValue).toBeTruthy();
    expect(filing.rows[0]?.cells.employeeIdValue).toBe("");

    const training = buildHrComplianceSafetyTrainingRequirementsListSurface({
      window: {
        rows: [
          {
            id: "req_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            obligationId: "obl_2",
            obligationCode: "SAF-01",
            obligationTitle: "Fire safety",
            complianceArea: "safety",
            requirementKind: "training",
            status: "pending",
            dueDate,
            completedAt: null,
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(training.rows[0]?.cells.dueDateInput).toBeTruthy();
    expect(training.rows[0]?.cells.trailingStatusValue).toBe("pending");

    const eligibility = buildHrComplianceWorkEligibilityListSurface({
      canWrite: true,
      canViewSensitive: true,
      window: {
        rows: [
          {
            id: "we_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            status: "eligible",
            verifiedAt: null,
            expiresAt: dueDate,
            reviewNotes: null,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
    });

    expect(eligibility.rows[0]?.cells.expiresAtInput).toBeTruthy();

    const workAuth = buildHrComplianceWorkAuthDocumentsListSurface({
      canWrite: true,
      canViewSensitive: true,
      window: {
        rows: [
          {
            id: "wad_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            documentType: "work_permit",
            status: "pending_verification",
            documentNumber: null,
            issuedAt: dueDate,
            expiresAt: dueDate,
            verifiedAt: null,
            reviewNotes: null,
            linkedEvidenceCount: 1,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
    });

    expect(workAuth.rows[0]?.cells.documentNumberValue).toBe("");
    expect(workAuth.rows[0]?.cells.employeeIdValue).toBe("emp_1");
    expect(workAuth.rows[0]?.cells.effectiveStatusValue).not.toBe("missing");
    expect(workAuth.rows[0]?.cells.issuedAtInput).toBeTruthy();
    expect(workAuth.rows[0]?.cells.expiresAtInput).toBeTruthy();

    const exceptions = buildHrComplianceExceptionsListSurface({
      window: {
        rows: [
          {
            id: "exc_1",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            complianceArea: "safety",
            itemType: "gap",
            gapKind: "overdue",
            title: "Overdue requirement",
            severity: "high",
            status: "in_progress",
            correctiveActionOwnerEmployeeId: "emp_owner",
            correctiveActionOwnerEmployeeNumber: "E-200",
            correctiveActionOwnerDisplayName: "Jordan Lee",
            correctiveActionDescription: "Complete safety training",
            correctiveActionDueDate: dueDate,
            createdAt: dueDate,
          },
        ],
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
      },
      canWrite: true,
    });

    expect(exceptions.rows[0]?.cells.correctiveActionDueDateInput).toBeTruthy();
    expect(
      exceptions.rows[0]?.cells.correctiveActionOwnerEmployeeIdValue,
    ).toBe("emp_owner");
    expect(exceptions.rows[0]?.cells.correctiveActionDescriptionValue).toBe(
      "Complete safety training",
    );
    expect(exceptions.rows[0]?.cells.statusValue).toBe("in_progress");
    expect(exceptions.rows[0]?.cells.gapKindValue).toBe("overdue");
    expect(exceptions.rows[0]?.cells.employeeIdValue).toBe("emp_1");

    const evidenceLinks = buildHrComplianceEvidenceLinksListSurface({
      canWrite: true,
      canViewSensitive: true,
      window: {
        pageSize: 25,
        totalCount: 1,
        hasNextPage: false,
        rows: [
          {
            id: "ev_1",
            recordKind: "work_auth_document",
            recordId: "wad_1",
            recordLabel: "E-100 · work permit",
            employeeId: "emp_1",
            employeeNumber: "E-100",
            employeeDisplayName: "Alex Operator",
            employeeDocumentId: "doc_1",
            documentTitle: "Work permit scan",
            documentType: "work_permit_scan",
            documentClassification: "internal",
            submissionState: "draft",
            notes: "audit copy",
            submittedAt: null,
            acknowledgedAt: null,
            createdAt: dueDate,
          },
        ],
      },
    });

    expect(evidenceLinks.rows[0]?.cells.trailingSubmissionStateValue).toBe(
      "draft",
    );
    expect(evidenceLinks.rows[0]?.cells.notesValue).toBe("audit copy");
    expect(evidenceLinks.rows[0]?.cells.employeeIdValue).toBe("emp_1");
    expect(evidenceLinks.rows[0]?.cells.recordIdValue).toBe("wad_1");
    expect(evidenceLinks.rows[0]?.cells.documentTypeValue).toBe(
      "work_permit_scan",
    );
  });
});
