import { describe, expect, it } from "vitest";

import {
  hrComplianceRoutePaths,
  hrComplianceAlertsSearchParam,
  hrComplianceEvidenceLinksSearchParam,
  hrComplianceExceptionSearchParam,
  hrComplianceRegulatoryCalendarSearchParam,
  hrComplianceAuditTrailSearchParam,
  HR_COMPLIANCE_LIST_SURFACE_KEYS,
  hrComplianceUiCopy,
  parseHrComplianceSearchParams,
  toHrCompliancePageModelInput,
} from "@afenda/feature-hr-suite/metadata";

describe("HR compliance app adapter contract", () => {
  it("exposes page metadata copy for the app adapter", () => {
    expect(hrComplianceUiCopy.page.title).toBe("Compliance");
    expect(hrComplianceUiCopy.page.description).toContain("alerts");
    expect(hrComplianceUiCopy.page.description).toContain("filings");
  });

  it("routes compliance at the canonical execution path", () => {
    expect(hrComplianceRoutePaths.compliance).toBe("/hr/compliance");
  });

  it("parses list-specific search params for the workbench", () => {
    expect(
      parseHrComplianceSearchParams({
        [hrComplianceAlertsSearchParam]: "overdue",
        [hrComplianceRegulatoryCalendarSearchParam]: "renewal",
        complianceFilingSearch: "epf",
        [hrComplianceExceptionSearchParam]: "missing",
        [hrComplianceEvidenceLinksSearchParam]: "permit",
      }),
    ).toEqual({
      obligationSearch: undefined,
      exceptionSearch: "missing",
      laborLawSearch: undefined,
      policyAcknowledgementSearch: undefined,
      safetyTrainingSearch: undefined,
      workplaceSafetySearch: undefined,
      workEligibilitySearch: undefined,
      workAuthDocumentSearch: undefined,
      filingSearch: "epf",
      regulatoryCalendarSearch: "renewal",
      alertsSearch: "overdue",
      evidenceLinksSearch: "permit",
      auditTrailSearch: undefined,
    });
  });

  it("parses audit trail search param for the workbench", () => {
    expect(
      parseHrComplianceSearchParams({
        [hrComplianceAuditTrailSearchParam]: "corrective_action.assign",
      }),
    ).toMatchObject({
      auditTrailSearch: "corrective_action.assign",
    });
  });

  it("forwards legacy complianceSearch to every list param for the adapter", () => {
    expect(
      parseHrComplianceSearchParams({
        complianceSearch: "visa",
      }),
    ).toMatchObject({
      exceptionSearch: "visa",
      evidenceLinksSearch: "visa",
    });
  });

  it("builds page-model input from App Router searchParams via metadata registry", () => {
    expect(
      toHrCompliancePageModelInput({
        organizationId: "org_1",
        canWrite: true,
        canViewSensitive: true,
        searchParams: {
          [hrComplianceAlertsSearchParam]: "deadline",
        },
      }),
    ).toEqual({
      organizationId: "org_1",
      canWrite: true,
      canViewSensitive: true,
      alertsSearch: "deadline",
      obligationSearch: undefined,
      exceptionSearch: undefined,
      laborLawSearch: undefined,
      policyAcknowledgementSearch: undefined,
      safetyTrainingSearch: undefined,
      workplaceSafetySearch: undefined,
      workEligibilitySearch: undefined,
      workAuthDocumentSearch: undefined,
      filingSearch: undefined,
      regulatoryCalendarSearch: undefined,
      evidenceLinksSearch: undefined,
      auditTrailSearch: undefined,
    });
  });

  it("aligns streaming skeleton sections with governed list registry", () => {
    expect(HR_COMPLIANCE_LIST_SURFACE_KEYS).toHaveLength(14);
  });
});
