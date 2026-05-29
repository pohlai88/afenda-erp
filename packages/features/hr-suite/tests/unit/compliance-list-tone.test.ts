import { describe, expect, it } from "vitest";

import {
  resolveComplianceExceptionRowTone,
  resolveComplianceExceptionSeverityBadgeTone,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-list.shared";

describe("compliance list EUI tone helpers", () => {
  it("escalates high-severity open exceptions to critical row tone", () => {
    expect(
      resolveComplianceExceptionRowTone({
        severity: "high",
        status: "open",
      }),
    ).toBe("critical");
  });

  it("maps medium severity to attention badge tone", () => {
    expect(resolveComplianceExceptionSeverityBadgeTone("medium")).toBe(
      "attention",
    );
  });
});
