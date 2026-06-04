import { describe, expect, it } from "vitest";

import { parseHrOffboardingSearchParams } from "../../src/employee-management/offboarding-exit-management/hr.workforce.offboarding-search-params.parse.shared";

describe("hr offboarding search params", () => {
  it("returns empty object when search params are undefined", () => {
    expect(parseHrOffboardingSearchParams(undefined)).toEqual({});
  });

  it("parses list-specific search params from URL keys", () => {
    expect(
      parseHrOffboardingSearchParams({
        offboardingCasesSearch: "cases-query",
        offboardingClearanceSearch: "clearance-query",
        offboardingApprovalsSearch: "approvals-query",
        offboardingAssetsSearch: "assets-query",
        offboardingSettlementSearch: "settlement-query",
        offboardingOverdueSearch: "overdue-query",
        offboardingAuditTrailSearch: "audit-query",
        offboardingExitTypeFilter: "resignation",
      }),
    ).toEqual({
      casesSearch: "cases-query",
      clearanceSearch: "clearance-query",
      approvalsSearch: "approvals-query",
      assetsSearch: "assets-query",
      settlementSearch: "settlement-query",
      overdueSearch: "overdue-query",
      auditTrailSearch: "audit-query",
      exitTypeFilter: "resignation",
    });
  });
});
