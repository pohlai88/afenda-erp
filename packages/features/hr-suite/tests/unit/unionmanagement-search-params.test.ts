import { describe, expect, it } from "vitest";

import {
  parseHrIndustryUcbSearchParams,
  toHrIndustryUcbPageModelInput,
} from "../../src/industry-specific/union-management/hr.industry.ucb-search-params.parse.shared";

describe("union management search params", () => {
  it("parses list searches, status filters, and report grouping", () => {
    const parsed = parseHrIndustryUcbSearchParams({
      ucbUnionsSearch: [" local 22 "],
      ucbGrievancesSearch: " overtime ",
      ucbIntegrationsSearch: " payroll ",
      ucbReportGroupBy: "bargaining_unit",
      ucbStatus: "escalated",
    });

    expect(parsed.unionsSearch).toBe("local 22");
    expect(parsed.grievancesSearch).toBe("overtime");
    expect(parsed.integrationExposuresSearch).toBe("payroll");
    expect(parsed.reportGroupBy).toBe("bargaining_unit");
    expect(parsed.status).toBe("escalated");
  });

  it("defaults invalid report grouping and status filters safely", () => {
    const input = toHrIndustryUcbPageModelInput({
      organizationId: "org-ucb",
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canManageGrievances: false,
      canReadLegalReferences: false,
      canExposePayroll: false,
      canExposeIntegrations: false,
      canExportReports: false,
      searchParams: new URLSearchParams(
        "ucbReportGroupBy=not-real&ucbStatus=not-real",
      ),
    });

    expect(input.organizationId).toBe("org-ucb");
    expect(input.reportGroupBy).toBe("union");
    expect(input.status).toBe("all");
    expect(input.visibleEmployeeIds).toBeNull();
    expect(input.canExposePayroll).toBe(false);
  });
});
