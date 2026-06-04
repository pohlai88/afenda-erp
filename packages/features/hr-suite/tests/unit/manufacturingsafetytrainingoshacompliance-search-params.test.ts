import { describe, expect, it } from "vitest";

import {
  parseHrIndustryMscSearchParams,
  toHrIndustryMscPageModelInput,
} from "../../src/industry-specific/manufacturing-safety-training-osha-compliance/hr.industry.msc-search-params.parse.shared";

describe("manufacturing safety training OSHA compliance search params", () => {
  it("parses list searches, status filters, and report grouping", () => {
    const parsed = parseHrIndustryMscSearchParams({
      mscEmployeeObligationsSearch: [" forklift "],
      mscIncidentsSearch: " exposure ",
      mscReportGroupBy: "incident_type",
      mscStatus: "overdue",
    });

    expect(parsed.employeeObligationsSearch).toBe("forklift");
    expect(parsed.incidentsSearch).toBe("exposure");
    expect(parsed.reportGroupBy).toBe("incident_type");
    expect(parsed.status).toBe("overdue");
  });

  it("defaults invalid report grouping and status filters safely", () => {
    const input = toHrIndustryMscPageModelInput({
      organizationId: "org-msc",
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canExposeIntegrations: false,
      searchParams: new URLSearchParams(
        "mscReportGroupBy=not-real&mscStatus=not-real",
      ),
    });

    expect(input.organizationId).toBe("org-msc");
    expect(input.reportGroupBy).toBe("site");
    expect(input.status).toBe("all");
    expect(input.visibleEmployeeIds).toBeNull();
  });
});
