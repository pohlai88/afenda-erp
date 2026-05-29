import {
  buildAutoReopenedComplianceExceptionValues,
  buildComplianceExceptionSourceReferenceId,
  classifyEmployeeRequirementExceptionGap,
  classifyFilingExceptionGap,
  classifyWorkAuthDocumentExceptionGap,
  classifyWorkEligibilityExceptionGap,
  HR_COMPLIANCE_EXCEPTION_AUTO_RESOLVED_NOTE,
  isAutoResolvedComplianceException,
  resolveComplianceExceptionSeverity,
} from "@afenda/db";
import { describe, expect, it } from "vitest";

describe("HRM-CMP-017 compliance exception gap classification", () => {
  const now = new Date("2026-05-30T12:00:00.000Z");

  it("builds stable source reference ids", () => {
    expect(
      buildComplianceExceptionSourceReferenceId({
        sourceKind: "employee_requirement",
        sourceId: "req_1",
        gapKind: "overdue",
      }),
    ).toBe("exception:employee_requirement:req_1:overdue");
  });

  it("classifies policy acknowledgement missing before overdue", () => {
    expect(
      classifyEmployeeRequirementExceptionGap({
        status: "pending",
        dueDate: new Date("2026-07-01T00:00:00.000Z"),
        requirementKind: "policy_acknowledgement",
        now,
      }),
    ).toBe("missing");
  });

  it("classifies overdue training requirements", () => {
    expect(
      classifyEmployeeRequirementExceptionGap({
        status: "pending",
        dueDate: new Date("2026-05-01T00:00:00.000Z"),
        requirementKind: "training",
        now,
      }),
    ).toBe("overdue");
  });

  it("classifies expired certification on compliant training rows", () => {
    expect(
      classifyEmployeeRequirementExceptionGap({
        status: "compliant",
        dueDate: new Date("2026-05-01T00:00:00.000Z"),
        requirementKind: "training",
        now,
      }),
    ).toBe("expired");
  });

  it("classifies overdue labor law requirements", () => {
    expect(
      classifyEmployeeRequirementExceptionGap({
        status: "pending",
        dueDate: new Date("2026-05-01T00:00:00.000Z"),
        requirementKind: "labor_law",
        now,
      }),
    ).toBe("overdue");
  });

  it("classifies stored expired employee requirement rows", () => {
    expect(
      classifyEmployeeRequirementExceptionGap({
        status: "expired",
        dueDate: null,
        requirementKind: "labor_law",
        now,
      }),
    ).toBe("expired");
  });

  it("classifies failed non-compliant requirements", () => {
    expect(
      classifyEmployeeRequirementExceptionGap({
        status: "non_compliant",
        dueDate: null,
        requirementKind: "labor_law",
        now,
      }),
    ).toBe("failed");
  });

  it("ignores at-risk-only posture without HRM-CMP-017 gap", () => {
    expect(
      classifyEmployeeRequirementExceptionGap({
        status: "pending",
        dueDate: new Date("2026-06-10T00:00:00.000Z"),
        requirementKind: "labor_law",
        now,
      }),
    ).toBeNull();
  });

  it("classifies overdue filings", () => {
    expect(
      classifyFilingExceptionGap({
        status: "pending",
        filingDeadline: new Date("2026-05-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("overdue");
  });

  it("classifies missing and expired work authorization documents", () => {
    expect(
      classifyWorkAuthDocumentExceptionGap({
        status: "missing",
        documentNumber: null,
        expiresAt: null,
        now,
      }),
    ).toBe("missing");

    expect(
      classifyWorkAuthDocumentExceptionGap({
        status: "verified",
        documentNumber: "P-100",
        expiresAt: new Date("2026-05-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("expired");
  });

  it("classifies rejected work authorization as failed", () => {
    expect(
      classifyWorkAuthDocumentExceptionGap({
        status: "rejected",
        documentNumber: "P-100",
        expiresAt: null,
        now,
      }),
    ).toBe("failed");
  });

  it("does not classify expiring work authorization as an exception gap", () => {
    expect(
      classifyWorkAuthDocumentExceptionGap({
        status: "verified",
        documentNumber: "P-100",
        expiresAt: new Date("2026-06-10T00:00:00.000Z"),
        now,
      }),
    ).toBeNull();
  });

  it("classifies expired and ineligible work eligibility", () => {
    expect(
      classifyWorkEligibilityExceptionGap({
        status: "eligible",
        expiresAt: new Date("2026-05-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("expired");

    expect(
      classifyWorkEligibilityExceptionGap({
        status: "ineligible",
        expiresAt: null,
        now,
      }),
    ).toBe("failed");
  });

  it("clears corrective workflow fields when reopening auto-resolved gaps", () => {
    expect(
      buildAutoReopenedComplianceExceptionValues({
        employeeId: "emp_1",
        title: "Overdue: LAB-01 · Weekly hours",
        complianceArea: "labor_law",
        itemType: "overdue",
        severity: "high",
        gapKind: "overdue",
      }),
    ).toEqual({
      status: "open",
      employeeId: "emp_1",
      title: "Overdue: LAB-01 · Weekly hours",
      complianceArea: "labor_law",
      itemType: "overdue",
      severity: "high",
      gapKind: "overdue",
      resolutionNote: null,
      resolvedAt: null,
      correctiveActionDescription: null,
      correctiveActionDueDate: null,
    });
  });

  it("detects auto-resolved exceptions by resolution note", () => {
    expect(
      isAutoResolvedComplianceException({
        resolutionNote: HR_COMPLIANCE_EXCEPTION_AUTO_RESOLVED_NOTE,
      }),
    ).toBe(true);
    expect(
      isAutoResolvedComplianceException({
        resolutionNote: "Resolved by operator",
      }),
    ).toBe(false);
  });

  it("maps severity from gap kind and compliance area", () => {
    expect(
      resolveComplianceExceptionSeverity({
        gapKind: "expired",
        complianceArea: "training",
      }),
    ).toBe("critical");

    expect(
      resolveComplianceExceptionSeverity({
        gapKind: "missing",
        complianceArea: "work_authorization",
      }),
    ).toBe("high");
  });
});
