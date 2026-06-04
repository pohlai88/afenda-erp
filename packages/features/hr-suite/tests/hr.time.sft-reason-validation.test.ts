import { describe, expect, it } from "vitest";

import { hrSftDecideScheduleChangeSchema } from "../src/time-attendance/shift-scheduling/hr.time.sft-schedule-change.schema";
import { hrSftDecideSwapRequestSchema } from "../src/time-attendance/shift-scheduling/hr.time.sft-swap.schema";

describe("SFT reason validation (HRM-SFT-023)", () => {
  it("requires rejection reason on swap reject", () => {
    const parsed = hrSftDecideSwapRequestSchema.safeParse({
      swapRequestId: "swp_1",
      decision: "reject",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some((issue) => issue.path[0] === "rejectionReason"),
      ).toBe(true);
    }
  });

  it("requires override reason on swap override", () => {
    const parsed = hrSftDecideSwapRequestSchema.safeParse({
      swapRequestId: "swp_1",
      decision: "override",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some((issue) => issue.path[0] === "overrideReason"),
      ).toBe(true);
    }
  });

  it("requires rejection reason on schedule change reject", () => {
    const parsed = hrSftDecideScheduleChangeSchema.safeParse({
      scheduleChangeRequestId: "chg_1",
      decision: "reject",
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some((issue) => issue.path[0] === "rejectionReason"),
      ).toBe(true);
    }
  });

  it("accepts approve decision without reason fields", () => {
    const parsed = hrSftDecideSwapRequestSchema.safeParse({
      swapRequestId: "swp_1",
      decision: "approve",
    });

    expect(parsed.success).toBe(true);
  });
});
