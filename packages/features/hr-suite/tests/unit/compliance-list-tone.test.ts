import { describe, expect, it } from "vitest";

import {
  resolveComplianceExceptionRowTone,
  resolveComplianceExceptionSeverityBadgeTone,
  resolveComplianceObligationRowTone,
  resolveEvidenceLinkListBadgeTone,
  resolveEvidenceLinkListRowTone,
  resolveEvidenceLinkListTrailingAction,
  resolveRequirementListRowTone,
  resolveWorkAuthDocumentListRowTone,
  resolveWorkAuthDocumentListTrailingAction,
  resolveWorkEligibilityListRowTone,
  resolveWorkEligibilityListTrailingAction,
  deriveCorrectiveActionDuePosture,
  resolveCorrectiveActionDueBadgeTone,
} from "../../src/employee-management/compliance-regulatory-tracking/hr.workforce.compliance-list.shared";

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

  it("escalates overdue in-progress corrective actions to critical row tone", () => {
    expect(
      resolveComplianceExceptionRowTone({
        severity: "low",
        status: "in_progress",
        correctiveActionDueDate: new Date("2020-01-01T00:00:00.000Z"),
        now: new Date("2026-01-01T00:00:00.000Z"),
      }),
    ).toBe("critical");
  });

  it("derives corrective due posture only for in-progress assigned rows", () => {
    expect(
      deriveCorrectiveActionDuePosture({
        status: "open",
        correctiveActionDueDate: new Date("2020-01-01T00:00:00.000Z"),
        now: new Date("2026-01-01T00:00:00.000Z"),
      }),
    ).toBeNull();
    expect(
      deriveCorrectiveActionDuePosture({
        status: "in_progress",
        correctiveActionDueDate: new Date("2020-01-01T00:00:00.000Z"),
        now: new Date("2026-01-01T00:00:00.000Z"),
      }),
    ).toBe("overdue");
  });

  it("maps corrective due posture to badge tone", () => {
    expect(resolveCorrectiveActionDueBadgeTone("overdue")).toBe("critical");
    expect(resolveCorrectiveActionDueBadgeTone("due_today")).toBe("attention");
    expect(resolveCorrectiveActionDueBadgeTone(null)).toBe("default");
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
      resolveWorkAuthDocumentListTrailingAction(true, "expiring", true)?.state,
    ).toBe("ready");
  });

  it("keeps work authorization trailing ready for expired renewal rows", () => {
    expect(
      resolveWorkAuthDocumentListTrailingAction(true, "expired", true)?.state,
    ).toBe("ready");
  });

  it("hides work authorization trailing for active verified or waived rows", () => {
    expect(
      resolveWorkAuthDocumentListTrailingAction(true, "verified", true)?.state,
    ).toBe("hidden");
    expect(
      resolveWorkAuthDocumentListTrailingAction(true, "waived", true)?.state,
    ).toBe("hidden");
  });

  it("omits work authorization trailing when write access is denied", () => {
    expect(
      resolveWorkAuthDocumentListTrailingAction(false, "missing"),
    ).toBeUndefined();
  });

  it("omits work authorization trailing when sensitive read is denied", () => {
    expect(
      resolveWorkAuthDocumentListTrailingAction(true, "expiring", false),
    ).toBeUndefined();
  });

  it("hides work eligibility trailing for eligible or not-applicable posture", () => {
    expect(
      resolveWorkEligibilityListTrailingAction(true, "eligible", true)?.state,
    ).toBe("hidden");
    expect(
      resolveWorkEligibilityListTrailingAction(true, "not_applicable", true)
        ?.state,
    ).toBe("hidden");
  });

  it("maps draft evidence submission to attention row tone", () => {
    expect(resolveEvidenceLinkListRowTone("draft")).toBe("attention");
    expect(resolveEvidenceLinkListBadgeTone("submitted")).toBe("default");
    expect(resolveEvidenceLinkListBadgeTone("acknowledged")).toBe("default");
  });

  it("omits evidence link trailing when write access is denied", () => {
    expect(resolveEvidenceLinkListTrailingAction(false)).toBeUndefined();
    expect(resolveEvidenceLinkListTrailingAction(true)?.state).toBe("ready");
  });
});
