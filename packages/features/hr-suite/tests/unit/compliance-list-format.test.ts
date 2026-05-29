import { describe, expect, it } from "vitest";

import { formatComplianceEmployeeListCell } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-list.shared";

describe("formatComplianceEmployeeListCell", () => {
  it("returns em dash when display name is missing", () => {
    expect(
      formatComplianceEmployeeListCell({
        employeeNumber: "E-001",
        employeeDisplayName: null,
      }),
    ).toBe("—");
  });

  it("formats number-first employee cells", () => {
    expect(
      formatComplianceEmployeeListCell({
        employeeNumber: "E-001",
        employeeDisplayName: "Alex Rivera",
      }),
    ).toBe("E-001 · Alex Rivera");
  });

  it("formats name-first employee cells", () => {
    expect(
      formatComplianceEmployeeListCell({
        employeeNumber: "E-001",
        employeeDisplayName: "Alex Rivera",
        style: "name-first",
      }),
    ).toBe("Alex Rivera · E-001");
  });
});
