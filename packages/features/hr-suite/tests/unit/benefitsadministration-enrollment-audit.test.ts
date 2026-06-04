import { describe, expect, it } from "vitest";

import { hrPayrollBenefitsAuditActions } from "../../src/payroll-compensation/benefits-administration/hr.payroll.benefits.event";

describe("HRM-BEN-028 enrollment audit", () => {
  it("declares enrollment create audit action for enrollment mutations", () => {
    expect(hrPayrollBenefitsAuditActions.enrollment.created).toBe(
      "hr.benefits.enrollment.create",
    );
    expect(
      hrPayrollBenefitsAuditActions.coverage.adjustedForEmploymentChange,
    ).toBe("hr.benefits.coverage.employment_status.adjust");
    expect(hrPayrollBenefitsAuditActions.reports.exported).toBe(
      "hr.benefits.report.export",
    );
  });
});
