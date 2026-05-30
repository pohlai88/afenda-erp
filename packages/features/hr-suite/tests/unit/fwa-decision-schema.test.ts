import { describe, expect, it } from "vitest";

import { decideHrFwaRequestFormSchema } from "../../src/time-attendance/flexible-work-arrangement-tracking/schemas/hr.time.fwa-workflow.schema";

describe("FWA-012 decision reason schema", () => {
  it("requires rejection reason on reject decision", () => {
    const parsed = decideHrFwaRequestFormSchema.safeParse({
      requestId: "req-1",
      decision: "reject",
    });

    expect(parsed.success).toBe(false);
  });

  it("requires exception reason on exception_approve decision", () => {
    const parsed = decideHrFwaRequestFormSchema.safeParse({
      requestId: "req-1",
      decision: "exception_approve",
    });

    expect(parsed.success).toBe(false);
  });

  it("accepts reject with reason", () => {
    const parsed = decideHrFwaRequestFormSchema.safeParse({
      requestId: "req-1",
      decision: "reject",
      rejectionReason: "Business continuity requirement",
    });

    expect(parsed.success).toBe(true);
  });
});
