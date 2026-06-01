import { describe, expect, it } from "vitest";

import {
  parseHrIndustryRwsSearchParams,
  toHrIndustryRwsPageModelInput,
} from "../../src/industry-specific/retail-seasonal-hourly-workforce-scheduling/data/hr.industry.rws-search-params.parse.shared";

describe("retail seasonal hourly workforce scheduling search params", () => {
  it("parses list searches, status filters, and report grouping", () => {
    const parsed = parseHrIndustryRwsSearchParams({
      rwsSchedulesSearch: [" holiday peak "],
      rwsAssignmentsSearch: " cashier ",
      rwsComplianceSearch: " minor ",
      rwsReportGroupBy: "budget_variance",
      rwsStatus: "over_budget",
    });

    expect(parsed.schedulesSearch).toBe("holiday peak");
    expect(parsed.assignmentsSearch).toBe("cashier");
    expect(parsed.complianceFindingsSearch).toBe("minor");
    expect(parsed.reportGroupBy).toBe("budget_variance");
    expect(parsed.status).toBe("over_budget");
  });

  it("defaults invalid report grouping and status filters safely", () => {
    const input = toHrIndustryRwsPageModelInput({
      organizationId: "org-rws",
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canReadLaborCost: false,
      canExposeIntegrations: false,
      searchParams: new URLSearchParams(
        "rwsReportGroupBy=not-real&rwsStatus=not-real",
      ),
    });

    expect(input.organizationId).toBe("org-rws");
    expect(input.reportGroupBy).toBe("store");
    expect(input.status).toBe("all");
    expect(input.visibleEmployeeIds).toBeNull();
    expect(input.canReadLaborCost).toBe(false);
  });
});
