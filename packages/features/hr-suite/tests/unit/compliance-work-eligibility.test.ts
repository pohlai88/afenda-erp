import { describe, expect, it } from "vitest";

import {
  deriveEffectiveWorkEligibilityStatus,
  resolveWorkEligibilityVerifiedAt,
} from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-work-eligibility.shared";
import { resolveWorkEligibilityListBadgeTone } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-list.shared";

describe("HRM-CMP-004 work eligibility status", () => {
  const now = new Date("2026-06-01T12:00:00.000Z");

  it("derives expired when authorization date is in the past", () => {
    expect(
      deriveEffectiveWorkEligibilityStatus({
        status: "eligible",
        expiresAt: new Date("2026-05-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("expired");
  });

  it("preserves terminal ineligible status", () => {
    expect(
      deriveEffectiveWorkEligibilityStatus({
        status: "ineligible",
        expiresAt: new Date("2026-05-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("ineligible");
  });

  it("keeps pending verification when no expiry is set", () => {
    expect(
      deriveEffectiveWorkEligibilityStatus({
        status: "pending_verification",
        expiresAt: null,
        now,
      }),
    ).toBe("pending_verification");
  });

  it("derives expired when pending verification has a past expiry", () => {
    expect(
      deriveEffectiveWorkEligibilityStatus({
        status: "pending_verification",
        expiresAt: new Date("2026-05-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("expired");
  });

  it("clears verifiedAt when status is not authorized", () => {
    expect(
      resolveWorkEligibilityVerifiedAt({
        status: "ineligible",
      }),
    ).toBeNull();
  });

  it("sets verifiedAt when status becomes authorized", () => {
    const verifiedAt = resolveWorkEligibilityVerifiedAt({
      status: "eligible",
    });
    expect(verifiedAt).toBeInstanceOf(Date);
  });

  it("preserves explicit verifiedAt overrides", () => {
    const explicit = new Date("2026-01-01T00:00:00.000Z");
    expect(
      resolveWorkEligibilityVerifiedAt({
        status: "ineligible",
        verifiedAt: explicit,
      }),
    ).toEqual(explicit);
  });

  it("maps expired posture to critical list badge tone", () => {
    expect(resolveWorkEligibilityListBadgeTone("expired")).toBe("critical");
  });
});
