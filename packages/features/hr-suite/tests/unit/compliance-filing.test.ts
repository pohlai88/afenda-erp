import { describe, expect, it } from "vitest";

import {
  isPendingLikeFilingStatus,
  resolveFilingConfirmedAt,
  resolveFilingSubmittedAt,
} from "@afenda/db";
import { deriveEffectiveFilingStatus } from "../../src/employee-management/compliance-regulatory-tracking/data/hr.workforce.compliance-filing.shared";
import { parseUpdateHrComplianceFilingForm } from "../../src/employee-management/compliance-regulatory-tracking/schemas/hr.workforce.compliance-filing.schema";
import { resolveFilingListBadgeTone } from "../../src/employee-management/compliance-regulatory-tracking/surface/hr.workforce.compliance-list.shared";

describe("HRM-CMP-009 mandatory filing status", () => {
  const now = new Date("2026-06-01T12:00:00.000Z");

  it("derives overdue from pending when filing deadline is in the past", () => {
    expect(
      deriveEffectiveFilingStatus({
        status: "pending",
        filingDeadline: new Date("2026-05-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("overdue");
  });

  it("preserves submitted and confirmed statuses", () => {
    expect(
      deriveEffectiveFilingStatus({
        status: "submitted",
        filingDeadline: new Date("2026-01-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("submitted");

    expect(
      deriveEffectiveFilingStatus({
        status: "confirmed",
        filingDeadline: new Date("2026-01-01T00:00:00.000Z"),
        now,
      }),
    ).toBe("confirmed");
  });

  it("maps overdue filing posture to critical list badge tone", () => {
    expect(resolveFilingListBadgeTone("overdue")).toBe("critical");
  });

  it("accepts Afenda entity ids in filing trailing form validation", () => {
    const formData = new FormData();
    formData.set("filingId", "hr_cmp_fil_a1b2c3d4e5f6789012345678");
    formData.set("status", "submitted");
    formData.set("filingDeadline", "2026-06-01T00:00");
    formData.set("reviewNotes", "");

    const parsed = parseUpdateHrComplianceFilingForm(formData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.filingId).toBe(
        "hr_cmp_fil_a1b2c3d4e5f6789012345678",
      );
    }
  });

  it("clears submission timestamps when filing status regresses to pending", () => {
    const existingSubmittedAt = new Date("2026-03-01T00:00:00.000Z");
    const existingConfirmedAt = new Date("2026-03-02T00:00:00.000Z");

    expect(
      resolveFilingSubmittedAt({
        status: "pending",
        existingSubmittedAt,
      }),
    ).toBeNull();
    expect(
      resolveFilingConfirmedAt({
        status: "submitted",
        existingConfirmedAt,
      }),
    ).toBeNull();
  });

  it("treats overdue as pending-like for obligation deadline sync", () => {
    expect(isPendingLikeFilingStatus("pending")).toBe(true);
    expect(isPendingLikeFilingStatus("overdue")).toBe(true);
    expect(isPendingLikeFilingStatus("submitted")).toBe(false);
  });
});
