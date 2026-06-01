import { describe, expect, it } from "vitest";

import {
  parseHrIndustryGpgSearchParams,
  toHrIndustryGpgPageModelInput,
} from "../../src/industry-specific/government-classification-pay-grades/metadata";

describe("government classification pay grades search params", () => {
  it("parses list searches, status filters, and report grouping", () => {
    const parsed = parseHrIndustryGpgSearchParams({
      gpgClassificationAssignmentsSearch: [" analyst "],
      gpgSalaryTablesSearch: " GS-12 ",
      gpgReportGroupBy: "agency",
      gpgStatus: "active",
    });

    expect(parsed.classificationAssignmentsSearch).toBe("analyst");
    expect(parsed.salaryTablesSearch).toBe("GS-12");
    expect(parsed.reportGroupBy).toBe("agency");
    expect(parsed.status).toBe("active");
  });

  it("defaults invalid report grouping and status filters safely", () => {
    const input = toHrIndustryGpgPageModelInput({
      organizationId: "org-gpg",
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canExposeIntegrations: false,
      searchParams: new URLSearchParams(
        "gpgReportGroupBy=not-real&gpgStatus=not-real",
      ),
    });

    expect(input.organizationId).toBe("org-gpg");
    expect(input.reportGroupBy).toBe("classification");
    expect(input.status).toBe("all");
    expect(input.visibleEmployeeIds).toBeNull();
  });
});
