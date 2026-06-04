import { describe, expect, it } from "vitest";

import {
  parseHrIndustryFrmSearchParams,
  toHrIndustryFrmPageModelInput,
} from "../../src/industry-specific/field-worker-remote-workforce-management/hr.industry.frm-search-params.parse.shared";

describe("field worker remote workforce search params", () => {
  it("parses list searches and report grouping", () => {
    const parsed = parseHrIndustryFrmSearchParams({
      frmAssignmentsSearch: " project alpha ",
      frmTravelComplianceSearch: " duty ",
      frmReportGroupBy: "client",
    });

    expect(parsed.assignmentsSearch).toBe("project alpha");
    expect(parsed.travelComplianceSearch).toBe("duty");
    expect(parsed.reportGroupBy).toBe("client");
  });

  it("defaults invalid report grouping to site", () => {
    const input = toHrIndustryFrmPageModelInput({
      organizationId: "org-frm",
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canExposeIntegrations: false,
      searchParams: new URLSearchParams("frmReportGroupBy=not-real"),
    });

    expect(input.reportGroupBy).toBe("site");
    expect(input.visibleEmployeeIds).toBeNull();
  });
});
