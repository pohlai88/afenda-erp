import { describe, expect, it } from "vitest";

import { hrPayrollExpenseAuditActions } from "../../src/payroll-compensation/expenses-reimbursement/hr.payroll.expense.event";
import { resolveHrExpenseAuditAction } from "@afenda/db";

describe("HRM-EXP-028 expense audit actions", () => {
  it("maps integration audit verbs to persisted enum values", () => {
    expect(resolveHrExpenseAuditAction(hrPayrollExpenseAuditActions.payment.payrollStaged)).toBe(
      "payment_payroll_staged",
    );
    expect(resolveHrExpenseAuditAction(hrPayrollExpenseAuditActions.payment.apStaged)).toBe(
      "payment_ap_staged",
    );
    expect(
      resolveHrExpenseAuditAction(hrPayrollExpenseAuditActions.payment.referenceRecorded),
    ).toBe("payment_reference_recorded");
    expect(
      resolveHrExpenseAuditAction(hrPayrollExpenseAuditActions.accounting.allocated),
    ).toBe("accounting_allocated");
    expect(resolveHrExpenseAuditAction(hrPayrollExpenseAuditActions.report.exported)).toBe(
      "report_exported",
    );
  });
});
