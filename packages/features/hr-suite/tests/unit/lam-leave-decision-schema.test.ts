import { describe, expect, it } from "vitest";

import { decideHrLeaveApplicationFormSchema } from "../../src/time-attendance/leave-attendance-management/hr.time.leave-decision.schema";

describe("LAM-015 rejection reason schema", () => {
  it("requires rejection reason on reject decision", () => {
    const parsed = decideHrLeaveApplicationFormSchema.safeParse({
      requestId: "req-1",
      decision: "reject",
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts reject with reason", () => {
    const parsed = decideHrLeaveApplicationFormSchema.safeParse({
      requestId: "req-1",
      decision: "reject",
      rejectionReason: "Peak staffing period",
    });

    expect(parsed.success).toBe(true);
  });
});
