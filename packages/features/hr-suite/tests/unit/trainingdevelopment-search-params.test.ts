import { describe, expect, it } from "vitest";

import {
  parseHrTrainingSearchParams,
  toHrTrainingPageModelInput,
} from "../../src/talent-management/training-development/data/hr.talent.training-search-params.parse.shared";

describe("training development search params", () => {
  it("parses list searches and report grouping", () => {
    const parsed = parseHrTrainingSearchParams({
      trainingAssignmentsSearch: " overdue ",
      trainingCertificationsSearch: " forklift ",
      trainingReportGroupBy: "department",
    });

    expect(parsed.assignmentsSearch).toBe("overdue");
    expect(parsed.certificationsSearch).toBe("forklift");
    expect(parsed.reportGroupBy).toBe("department");
  });

  it("defaults invalid report grouping to department", () => {
    const input = toHrTrainingPageModelInput({
      organizationId: "org-trn",
      canWrite: false,
      canApprove: false,
      canReadAudit: false,
      canReadRestricted: false,
      canExposeIntegrations: false,
      searchParams: new URLSearchParams("trainingReportGroupBy=not-real"),
    });

    expect(input.reportGroupBy).toBe("department");
    expect(input.visibleEmployeeIds).toBeNull();
  });
});
