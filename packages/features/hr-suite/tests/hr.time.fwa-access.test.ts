import { describe, expect, it } from "vitest";

import {
  hrTimeFwaComplianceReadPermission,
  hrTimeFwaPayrollReadPermission,
  hrTimeFwaReadPermission,
  hrTimeFwaWritePermission,
} from "../src/time-attendance/flexible-work-arrangement-tracking/hr.time.fwa.contract";

describe("FWA ERP permissions (HRM-FWA-031)", () => {
  it("declares read and write permission objects for governed surfaces", () => {
    expect(hrTimeFwaReadPermission).toEqual({
      module: "hr",
      object: "fwa",
      function: "read",
    });
    expect(hrTimeFwaWritePermission).toEqual({
      module: "hr",
      object: "fwa",
      function: "update",
    });
  });

  it("declares compliance and payroll read doors", () => {
    expect(hrTimeFwaComplianceReadPermission.object).toBe("compliance");
    expect(hrTimeFwaPayrollReadPermission.object).toBe("attendance");
  });
});
