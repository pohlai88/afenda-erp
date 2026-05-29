import { describe, expect, it } from "vitest";

import { parseHrComplianceSearchParams } from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-search-params.parse.shared";

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
        complianceWorkEligibilitySearch: " permit ",
      }),
    ).toEqual({
      obligationSearch: "policy",
      exceptionSearch: "visa",
      laborLawSearch: "overtime",
      workEligibilitySearch: "permit",
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
      workEligibilitySearch: "shared",
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
      workEligibilitySearch: "legacy",
    });
  });
});
