import { describe, expect, it } from "vitest";

import {
  parseHrIndustryFhcSearchParams,
  toHrIndustryFhcPageModelInput,
} from "../../src/industry-specific/food-handler-certification-health-compliance/hr.industry.fhc-search-params.parse.shared";

describe("food handler certification health compliance search params", () => {
  it("parses list searches, status filters, and report grouping", () => {
    const parsed = parseHrIndustryFhcSearchParams({
      fhcEmployeeComplianceSearch: [" expired "],
      fhcHealthCertificationsSearch: " clinic ",
      fhcReportGroupBy: "department",
      fhcStatus: "expired",
    });

    expect(parsed.employeeComplianceSearch).toBe("expired");
    expect(parsed.healthCertificationsSearch).toBe("clinic");
    expect(parsed.reportGroupBy).toBe("department");
    expect(parsed.status).toBe("expired");
  });

  it("defaults invalid report grouping and status filters safely", () => {
    const input = toHrIndustryFhcPageModelInput({
      organizationId: "org-fhc",
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canExposeIntegrations: false,
      searchParams: new URLSearchParams(
        "fhcReportGroupBy=not-real&fhcStatus=not-real",
      ),
    });

    expect(input.organizationId).toBe("org-fhc");
    expect(input.reportGroupBy).toBe("outlet");
    expect(input.status).toBe("all");
    expect(input.visibleEmployeeIds).toBeNull();
  });
});
