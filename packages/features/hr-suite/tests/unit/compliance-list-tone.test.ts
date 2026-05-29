import { describe, expect, it } from "vitest";

import {
  resolveComplianceExceptionRowTone,
  resolveComplianceExceptionSeverityBadgeTone,
  resolveComplianceObligationRowTone,
  resolveRequirementListRowTone,
  resolveWorkAuthDocumentListRowTone,
  resolveWorkAuthDocumentListTrailingAction,
  resolveWorkEligibilityListRowTone,
  resolveWorkEligibilityListTrailingAction,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-list.shared";

describe("compliance list EUI tone helpers", () => {
  it("maps archived obligations to attention row tone", () => {
    expect(resolveComplianceObligationRowTone("archived")).toBe("attention");
    expect(resolveComplianceObligationRowTone("active")).toBe("default");
  });

  it("maps overdue employee requirements to critical row tone", () => {
    expect(resolveRequirementListRowTone("overdue")).toBe("critical");
    expect(resolveRequirementListRowTone("compliant")).toBe("default");
  });

  it("maps expired work eligibility to critical row tone", () => {
    expect(resolveWorkEligibilityListRowTone("expired")).toBe("critical");
  });

  it("maps missing work authorization documents to attention row tone", () => {
    expect(resolveWorkAuthDocumentListRowTone("missing")).toBe("attention");
  });

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

  it("keeps work authorization trailing ready for expiring renewal rows", () => {
    expect(
      resolveWorkAuthDocumentListTrailingAction(true, "expiring")?.state,
    ).toBe("ready");
  });

  it("keeps work authorization trailing ready for expired renewal rows", () => {
    expect(
      resolveWorkAuthDocumentListTrailingAction(true, "expired")?.state,
    ).toBe("ready");
  });

  it("hides work authorization trailing for active verified or waived rows", () => {
    expect(
      resolveWorkAuthDocumentListTrailingAction(true, "verified")?.state,
    ).toBe("hidden");
    expect(
      resolveWorkAuthDocumentListTrailingAction(true, "waived")?.state,
    ).toBe("hidden");
  });

  it("omits work authorization trailing when write access is denied", () => {
    expect(
      resolveWorkAuthDocumentListTrailingAction(false, "missing"),
    ).toBeUndefined();
  });

  it("hides work eligibility trailing for eligible or not-applicable posture", () => {
    expect(
      resolveWorkEligibilityListTrailingAction(true, "eligible")?.state,
    ).toBe("hidden");
    expect(
      resolveWorkEligibilityListTrailingAction(true, "not_applicable")?.state,
    ).toBe("hidden");
  });
});
