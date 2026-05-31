import { describe, expect, it } from "vitest";

import {
  assertExpClaimStatusTransition,
  canTransitionExpClaimStatus,
} from "@afenda/db";

describe("HRM-EXP-021 claim status transitions", () => {
  it("allows submit and approval paths", () => {
    expect(canTransitionExpClaimStatus("draft", "submitted")).toBe(true);
    expect(canTransitionExpClaimStatus("submitted", "under_review")).toBe(true);
    expect(canTransitionExpClaimStatus("under_review", "approved")).toBe(true);
    expect(canTransitionExpClaimStatus("approved", "paid")).toBe(true);
  });

  it("allows reject, return, and clarification from actionable states", () => {
    expect(canTransitionExpClaimStatus("submitted", "rejected")).toBe(true);
    expect(canTransitionExpClaimStatus("under_review", "returned")).toBe(true);
    expect(
      canTransitionExpClaimStatus("submitted", "clarification_requested"),
    ).toBe(true);
  });

  it("crashes on invalid transitions", () => {
    expect(() =>
      assertExpClaimStatusTransition("rejected", "approved"),
    ).toThrow("invalid_exp_claim_status_transition:rejected->approved");
    expect(() =>
      assertExpClaimStatusTransition("paid", "draft"),
    ).toThrow("invalid_exp_claim_status_transition:paid->draft");
  });

  it("blocks terminal transitions", () => {
    expect(canTransitionExpClaimStatus("rejected", "submitted")).toBe(false);
    expect(canTransitionExpClaimStatus("paid", "cancelled")).toBe(false);
  });
});
