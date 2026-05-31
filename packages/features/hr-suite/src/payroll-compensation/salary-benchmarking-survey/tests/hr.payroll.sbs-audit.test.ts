import { describe, expect, it } from "vitest";

import { hrPayrollSbsAuditActions } from "../events/hr.payroll.sbs-audit.event";

describe("hr.payroll.sbs audit events", () => {
  it("covers survey upload, mapping, analysis, recommendation, and report export", () => {
    const actions = Object.values(hrPayrollSbsAuditActions).flatMap((group) =>
      Object.values(group),
    );
    expect(actions).toContain("hr.sbs.survey.upload");
    expect(actions).toContain("hr.sbs.mapping.create");
    expect(actions).toContain("hr.sbs.analysis.run");
    expect(actions).toContain("hr.sbs.recommendation.generate");
    expect(actions).toContain("hr.sbs.report.export");
  });
});
