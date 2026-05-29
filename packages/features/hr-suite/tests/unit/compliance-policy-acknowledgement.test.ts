import { describe, expect, it } from "vitest";

import {
  normalizeStoredRequirementStatusForMutation,
  parseEffectiveRequirementStatusSearchToken,
} from "@afenda/db";

import {
  deriveEffectivePolicyAcknowledgementStatus,
  isPolicyAcknowledgementMissing,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-status.shared";
import {
  resolvePolicyAcknowledgementListBadgeTone,
  resolvePolicyAcknowledgementListTrailingAction,
} from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-list.shared";

describe("HRM-CMP-008 policy acknowledgment status", () => {
  const now = new Date("2026-06-01T12:00:00.000Z");

  it("derives overdue from pending when acknowledgment due date is past", () => {
    expect(
      deriveEffectivePolicyAcknowledgementStatus({
        status: "pending",
        dueDate: new Date("2026-05-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("overdue");
  });

  it("derives at_risk within 14 days of acknowledgment due date", () => {
    expect(
      deriveEffectivePolicyAcknowledgementStatus({
        status: "pending",
        dueDate: new Date("2026-06-10T00:00:00.000Z"),
        now,
      }),
    ).toBe("at_risk");
  });

  it("preserves compliant acknowledgment status", () => {
    expect(
      deriveEffectivePolicyAcknowledgementStatus({
        status: "compliant",
        dueDate: new Date("2026-01-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("compliant");
  });

  it("maps missing overdue acknowledgment posture to critical badge tone", () => {
    expect(resolvePolicyAcknowledgementListBadgeTone("overdue")).toBe("critical");
  });

  it("flags missing acknowledgments when not compliant or waived", () => {
    expect(
      isPolicyAcknowledgementMissing({
        status: "pending",
        dueDate: new Date("2026-06-10T00:00:00.000Z"),
        now,
      }),
    ).toBe(true);
    expect(
      isPolicyAcknowledgementMissing({
        status: "compliant",
        dueDate: new Date("2026-01-01T00:00:00.000Z"),
        now,
      }),
    ).toBe(false);
  });

  it("hides trailing updates once acknowledgment is compliant or waived", () => {
    expect(
      resolvePolicyAcknowledgementListTrailingAction(true, "compliant")?.state,
    ).toBe("hidden");
    expect(
      resolvePolicyAcknowledgementListTrailingAction(true, "waived")?.state,
    ).toBe("hidden");
    expect(
      resolvePolicyAcknowledgementListTrailingAction(true, "overdue")?.state,
    ).toBe("ready");
  });

  it("parses derived posture and missing search tokens", () => {
    expect(parseEffectiveRequirementStatusSearchToken("overdue")).toBe("overdue");
    expect(parseEffectiveRequirementStatusSearchToken("at risk")).toBe("at_risk");
    expect(parseEffectiveRequirementStatusSearchToken("missing")).toBe("missing");
    expect(parseEffectiveRequirementStatusSearchToken("handbook")).toBeNull();
  });

  it("normalizes derived-only statuses to pending on mutation", () => {
    expect(normalizeStoredRequirementStatusForMutation("overdue")).toBe("pending");
    expect(normalizeStoredRequirementStatusForMutation("at_risk")).toBe("pending");
    expect(normalizeStoredRequirementStatusForMutation("compliant")).toBe("compliant");
  });
});
