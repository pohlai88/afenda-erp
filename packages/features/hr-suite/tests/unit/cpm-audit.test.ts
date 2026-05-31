import { describe, expect, it } from "vitest";

import { hrPayrollCpmAuditActions } from "../../src/payroll-compensation/compensation-planning-modeling/events/hr.payroll.cpm.event";

describe("HRM-CPM-030 audit verbs", () => {
  it("declares cycle, recommendation, approval, payroll, and report verbs", () => {
    expect(hrPayrollCpmAuditActions.cycle.create).toBe("hr.cpm.cycle.create");
    expect(hrPayrollCpmAuditActions.cycle.update).toBe("hr.cpm.cycle.update");
    expect(hrPayrollCpmAuditActions.participant.bulkAssign).toBe(
      "hr.cpm.participant.bulk_assign",
    );
    expect(hrPayrollCpmAuditActions.recommendation.submit).toBe(
      "hr.cpm.recommendation.submit",
    );
    expect(hrPayrollCpmAuditActions.approval.route).toBe("hr.cpm.approval.route");
    expect(hrPayrollCpmAuditActions.payroll.integrate).toBe(
      "hr.cpm.payroll.integrate",
    );
    expect(hrPayrollCpmAuditActions.report.export).toBe("hr.cpm.report.export");
  });
});
