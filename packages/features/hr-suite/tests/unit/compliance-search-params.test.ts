import { describe, expect, it } from "vitest";

import {
  parseHrComplianceSearchParams,
  toHrCompliancePageModelInput,
} from "../../src/employee-management/compliance-regulatory-tracking/hr.workforce.compliance-search-params.parse.shared";

describe("parseHrComplianceSearchParams", () => {
  it("returns empty values when search params are missing", () => {
    expect(parseHrComplianceSearchParams(undefined)).toEqual({});
  });

  it("reads per-list search params", () => {
    expect(
      parseHrComplianceSearchParams({
        complianceObligationSearch: " policy ",
        complianceExceptionSearch: " visa ",
        complianceLaborLawSearch: " overtime ",
        complianceStatutorySearch: " epf ",
        compliancePolicyAcknowledgementSearch: " handbook ",
        complianceSafetyTrainingSearch: " forklift ",
        complianceWorkplaceSafetySearch: " induction ",
        complianceWorkEligibilitySearch: " permit ",
        complianceWorkAuthDocumentSearch: " passport ",
        complianceFilingSearch: " epf ",
        complianceRegulatoryCalendarSearch: " renewal ",
        complianceAlertsSearch: " overdue ",
        complianceReviewQueueSearch: " filing ",
        complianceEvidenceLinksSearch: " permit scan ",
        complianceAuditTrailSearch: " filing update ",
      }),
    ).toEqual({
      obligationSearch: "policy",
      exceptionSearch: "visa",
      laborLawSearch: "overtime",
      statutorySearch: "epf",
      policyAcknowledgementSearch: "handbook",
      safetyTrainingSearch: "forklift",
      workplaceSafetySearch: "induction",
      workEligibilitySearch: "permit",
      workAuthDocumentSearch: "passport",
      filingSearch: "epf",
      regulatoryCalendarSearch: "renewal",
      alertsSearch: "overdue",
      reviewQueueSearch: "filing",
      evidenceLinksSearch: "permit scan",
      auditTrailSearch: "filing update",
    });
  });

  it("falls back to legacy complianceSearch for each list", () => {
    expect(
      parseHrComplianceSearchParams({
        complianceSearch: " shared ",
      }),
    ).toEqual({
      obligationSearch: "shared",
      exceptionSearch: "shared",
      laborLawSearch: "shared",
      statutorySearch: "shared",
      policyAcknowledgementSearch: "shared",
      safetyTrainingSearch: "shared",
      workplaceSafetySearch: "shared",
      workEligibilitySearch: "shared",
      workAuthDocumentSearch: "shared",
      filingSearch: "shared",
      regulatoryCalendarSearch: "shared",
      alertsSearch: "shared",
      reviewQueueSearch: "shared",
      evidenceLinksSearch: "shared",
      auditTrailSearch: "shared",
    });
  });

  it("falls back to shared search param when list-specific params are omitted", () => {
    expect(
      parseHrComplianceSearchParams({
        search: " global ",
      }),
    ).toEqual({
      obligationSearch: "global",
      exceptionSearch: "global",
      laborLawSearch: "global",
      statutorySearch: "global",
      policyAcknowledgementSearch: "global",
      safetyTrainingSearch: "global",
      workplaceSafetySearch: "global",
      workEligibilitySearch: "global",
      workAuthDocumentSearch: "global",
      filingSearch: "global",
      regulatoryCalendarSearch: "global",
      alertsSearch: "global",
      reviewQueueSearch: "global",
      evidenceLinksSearch: "global",
      auditTrailSearch: "global",
    });
  });

  it("prefers complianceSearch over shared search", () => {
    expect(
      parseHrComplianceSearchParams({
        search: "generic",
        complianceSearch: "legacy",
      }),
    ).toEqual({
      obligationSearch: "legacy",
      exceptionSearch: "legacy",
      laborLawSearch: "legacy",
      statutorySearch: "legacy",
      policyAcknowledgementSearch: "legacy",
      safetyTrainingSearch: "legacy",
      workplaceSafetySearch: "legacy",
      workEligibilitySearch: "legacy",
      workAuthDocumentSearch: "legacy",
      filingSearch: "legacy",
      regulatoryCalendarSearch: "legacy",
      alertsSearch: "legacy",
      reviewQueueSearch: "legacy",
      evidenceLinksSearch: "legacy",
      auditTrailSearch: "legacy",
    });
  });

  it("prefers list-specific params over legacy search", () => {
    expect(
      parseHrComplianceSearchParams({
        complianceSearch: "legacy",
        complianceObligationSearch: "obligation-only",
      }),
    ).toEqual({
      obligationSearch: "obligation-only",
      exceptionSearch: "legacy",
      laborLawSearch: "legacy",
      statutorySearch: "legacy",
      policyAcknowledgementSearch: "legacy",
      safetyTrainingSearch: "legacy",
      workplaceSafetySearch: "legacy",
      workEligibilitySearch: "legacy",
      workAuthDocumentSearch: "legacy",
      filingSearch: "legacy",
      regulatoryCalendarSearch: "legacy",
      alertsSearch: "legacy",
      reviewQueueSearch: "legacy",
      evidenceLinksSearch: "legacy",
      auditTrailSearch: "legacy",
    });
  });

  it("builds a full page-model input from registry-driven App Router params", () => {
    expect(
      toHrCompliancePageModelInput({
        organizationId: "org-compliance",
        canWrite: true,
        canViewSensitive: false,
        searchParams: {
          complianceReviewQueueSearch: " pending ",
          complianceStatutorySearch: " levy ",
          complianceEvidenceLinksSearch: " document ",
          complianceAuditTrailSearch: " approved ",
        },
      }),
    ).toMatchObject({
      organizationId: "org-compliance",
      canWrite: true,
      canViewSensitive: false,
      reviewQueueSearch: "pending",
      statutorySearch: "levy",
      evidenceLinksSearch: "document",
      auditTrailSearch: "approved",
    });
  });
});
