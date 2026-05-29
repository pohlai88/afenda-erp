import { describe, expect, it } from "vitest";

import {
  hrComplianceRoutePaths,
  hrEmployeeDetailRoutePath,
} from "../../src/employee-management/compliance-regulatory-tracking/contracts/hr.workforce.compliance-route.contract";

describe("hr compliance route contract", () => {
  it("exposes stable compliance workbench paths without locale prefix", () => {
    expect(hrComplianceRoutePaths.compliance).toBe("/hr/compliance");
    expect(hrComplianceRoutePaths.hub).toBe("/hr");
  });

  it("links employee rows to the HR module record detail route", () => {
    expect(hrEmployeeDetailRoutePath("emp_1")).toBe("/hr/records/emp_1");
  });
});
