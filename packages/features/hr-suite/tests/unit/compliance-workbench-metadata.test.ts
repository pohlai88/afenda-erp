import { describe, expect, it } from "vitest";

import {
  HR_COMPLIANCE_LIST_SEARCH_PARAM_MODEL_FIELDS,
  HR_COMPLIANCE_LIST_SEARCH_PARAMS_BY_KEY,
  HR_COMPLIANCE_LIST_SURFACE_KEYS,
  HR_COMPLIANCE_WORKBENCH_READ_ONLY_SURFACE_KEYS,
  hrComplianceAlertsSurfaceKey,
  hrComplianceAuditTrailSurfaceKey,
  hrComplianceRegulatoryCalendarSurfaceKey,
} from "../../src/metadata";
import { parseHrComplianceSearchParams } from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-search-params.parse.shared";

describe("hr compliance workbench metadata", () => {
  it("marks alerts, regulatory calendar, and audit trail as read-only Pattern C surfaces", () => {
    expect(HR_COMPLIANCE_WORKBENCH_READ_ONLY_SURFACE_KEYS.has(
      hrComplianceAlertsSurfaceKey,
    )).toBe(true);
    expect(HR_COMPLIANCE_WORKBENCH_READ_ONLY_SURFACE_KEYS.has(
      hrComplianceRegulatoryCalendarSurfaceKey,
    )).toBe(true);
    expect(HR_COMPLIANCE_WORKBENCH_READ_ONLY_SURFACE_KEYS.has(
      hrComplianceAuditTrailSurfaceKey,
    )).toBe(true);
    expect(HR_COMPLIANCE_WORKBENCH_READ_ONLY_SURFACE_KEYS.size).toBe(3);
  });

  it("maps every registry search param to a page-model field", () => {
    for (const surfaceKey of HR_COMPLIANCE_LIST_SURFACE_KEYS) {
      const paramKey = HR_COMPLIANCE_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      expect(HR_COMPLIANCE_LIST_SEARCH_PARAM_MODEL_FIELDS[paramKey]).toBeTruthy();
    }
  });

  it("parses list-specific search params from the metadata registry", () => {
    const paramEntries = HR_COMPLIANCE_LIST_SURFACE_KEYS.map((surfaceKey) => {
      const paramKey = HR_COMPLIANCE_LIST_SEARCH_PARAMS_BY_KEY[surfaceKey];
      return [paramKey, `${surfaceKey}-query`] as const;
    });

    expect(
      parseHrComplianceSearchParams(Object.fromEntries(paramEntries)),
    ).toEqual({
      alertsSearch: "hr.workforce.compliance.alerts.list-query",
      reviewQueueSearch: "hr.workforce.compliance.review-queue.list-query",
      obligationSearch: "hr.workforce.compliance.obligations.list-query",
      filingSearch: "hr.workforce.compliance.filings.list-query",
      regulatoryCalendarSearch:
        "hr.workforce.compliance.regulatory-calendar.list-query",
      policyAcknowledgementSearch:
        "hr.workforce.compliance.policy-acknowledgements.list-query",
      laborLawSearch: "hr.workforce.compliance.labor-law-requirements.list-query",
      statutorySearch:
        "hr.workforce.compliance.statutory-requirements.list-query",
      safetyTrainingSearch:
        "hr.workforce.compliance.safety-training-requirements.list-query",
      workplaceSafetySearch:
        "hr.workforce.compliance.workplace-safety-requirements.list-query",
      workEligibilitySearch: "hr.workforce.compliance.work-eligibility.list-query",
      workAuthDocumentSearch:
        "hr.workforce.compliance.work-auth-documents.list-query",
      exceptionSearch: "hr.workforce.compliance.exceptions.list-query",
      evidenceLinksSearch:
        "hr.workforce.compliance.evidence-links.list-query",
      auditTrailSearch: "hr.workforce.compliance.audit-trail.list-query",
    });
  });
});
