import { describe, expect, it } from "vitest";

import { PAYROLL_WORKFLOW_TRANSITIONS } from "../data/hr.payroll.processing-workflow.shared";

describe("HRM-PAY-021..023 payroll workflow transitions", () => {
  it("defines preview before approval path", () => {
    expect(PAYROLL_WORKFLOW_TRANSITIONS.validation).toContain("preview");
    expect(PAYROLL_WORKFLOW_TRANSITIONS.preview).toContain("pending_approval");
    expect(PAYROLL_WORKFLOW_TRANSITIONS.pending_approval).toContain("approved");
  });

  it("requires lock before close", () => {
    expect(PAYROLL_WORKFLOW_TRANSITIONS.approved).toContain("locked");
    expect(PAYROLL_WORKFLOW_TRANSITIONS.locked).toContain("closed");
  });
});
