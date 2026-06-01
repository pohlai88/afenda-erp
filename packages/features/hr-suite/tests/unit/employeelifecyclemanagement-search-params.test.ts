import { describe, expect, it } from "vitest";

import { parseHrLifecycleSearchParams } from "../../src/employee-management/employee-lifecycle-management/data/hr.workforce.lifecycle-search-params.parse.shared";

describe("hr lifecycle search params", () => {
  it("returns empty object when search params are undefined", () => {
    expect(parseHrLifecycleSearchParams(undefined)).toEqual({});
  });

  it("parses list-specific search params from URL keys", () => {
    expect(
      parseHrLifecycleSearchParams({
        lifecyclePendingTransitionsSearch: "pending-query",
        lifecycleProbationDueSearch: "probation-query",
        lifecycleContractReviewsSearch: "contract-query",
        lifecycleOnboardingCasesSearch: "onboarding-query",
        lifecycleNoticePeriodSearch: "notice-query",
        lifecycleOffboardingCasesSearch: "offboarding-query",
        lifecycleOverviewSearch: "overview-query",
        lifecycleAuditTrailSearch: "audit-query",
        lifecycleEmploymentStatus: "probation",
      }),
    ).toEqual({
      pendingTransitionsSearch: "pending-query",
      probationDueSearch: "probation-query",
      contractReviewsSearch: "contract-query",
      onboardingCasesSearch: "onboarding-query",
      noticePeriodSearch: "notice-query",
      offboardingCasesSearch: "offboarding-query",
      overviewSearch: "overview-query",
      auditTrailSearch: "audit-query",
      employmentStatusFilter: "probation",
    });
  });
});
