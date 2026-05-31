import { describe, expect, it } from "vitest";

import { HRM_OTM_PAYROLL_EXPORTABLE_STATUS } from "@afenda/db";

describe("OTM payroll export gate (HRM-OTM-024)", () => {
  it("only payroll_ready status is exportable to payroll", () => {
    expect(HRM_OTM_PAYROLL_EXPORTABLE_STATUS).toBe("payroll_ready");
    expect(["submitted", "approved", "paid"]).not.toContain(
      HRM_OTM_PAYROLL_EXPORTABLE_STATUS,
    );
  });
});
