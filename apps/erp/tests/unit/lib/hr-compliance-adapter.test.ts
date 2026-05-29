import { describe, expect, it } from "vitest";

import {
  hrComplianceAlertsSearchParam,
  hrComplianceRoutePaths,
  hrComplianceRegulatoryCalendarSearchParam,
  hrComplianceUiCopy,
  parseHrComplianceSearchParams,
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
      }),
    ).toEqual({
      obligationSearch: undefined,
      exceptionSearch: undefined,
      laborLawSearch: undefined,
      policyAcknowledgementSearch: undefined,
      safetyTrainingSearch: undefined,
      workplaceSafetySearch: undefined,
      workEligibilitySearch: undefined,
      workAuthDocumentSearch: undefined,
      filingSearch: "epf",
      regulatoryCalendarSearch: "renewal",
      alertsSearch: "overdue",
    });
  });
});
