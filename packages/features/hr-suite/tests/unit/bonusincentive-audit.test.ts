import { describe, expect, it } from "vitest";

import { hrPayrollBonusAuditActions } from "../../src/payroll-compensation/bonus-incentive-management/events/hr.payroll.bonus.event";

describe("HRM-BON-030 bonus audit verbs", () => {
  it("declares lifecycle, payroll, accounting, and correction verbs", () => {
    expect(hrPayrollBonusAuditActions.payout.approved).toBe("hr.bonus.payout.approve");
    expect(hrPayrollBonusAuditActions.payout.rejected).toBe("hr.bonus.payout.reject");
    expect(hrPayrollBonusAuditActions.payout.locked).toBe("hr.bonus.payout.lock");
    expect(hrPayrollBonusAuditActions.payroll.integrated).toBe(
      "hr.bonus.payroll.integrate",
    );
    expect(hrPayrollBonusAuditActions.accounting.allocated).toBe(
      "hr.bonus.accounting.allocate",
    );
    expect(hrPayrollBonusAuditActions.correction.clawback).toBe(
      "hr.bonus.clawback.record",
    );
    expect(hrPayrollBonusAuditActions.report.exported).toBe(
      "hr.bonus.report.export",
    );
  });
});
