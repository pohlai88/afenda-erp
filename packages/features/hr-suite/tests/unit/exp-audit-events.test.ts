import { describe, expect, it } from "vitest";

import { HRM_EXP_AUDIT } from "../../src/payroll-compensation/expenses-reimbursement/hr.payroll.exp.event";

describe("HRM-EXP-028 expense audit events", () => {
  it("maps lifecycle mutations to erp.hrm.expense audit strings", () => {
    expect(HRM_EXP_AUDIT.claim.submit).toBe("erp.hrm.expense.claim.submit");
    expect(HRM_EXP_AUDIT.claim.approve).toBe("erp.hrm.expense.claim.approve");
    expect(HRM_EXP_AUDIT.claim.reject).toBe("erp.hrm.expense.claim.reject");
    expect(HRM_EXP_AUDIT.claim.return).toBe("erp.hrm.expense.claim.return");
    expect(HRM_EXP_AUDIT.claim.clarificationRequest).toBe(
      "erp.hrm.expense.claim.clarification_request",
    );
    expect(HRM_EXP_AUDIT.exception.approve).toBe(
      "erp.hrm.expense.exception.approve",
    );
  });
});
