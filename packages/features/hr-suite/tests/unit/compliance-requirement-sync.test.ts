import { describe, expect, it } from "vitest";

import { resolveTrackedRequirementDueDateSync } from "@afenda/db";

describe("resolveTrackedRequirementDueDateSync", () => {
  const obligationDueDate = new Date("2026-12-31T00:00:00.000Z");
  const operatorExpiry = new Date("2027-06-01T00:00:00.000Z");

  it("syncs obligation template due dates for pending requirements", () => {
    expect(
      resolveTrackedRequirementDueDateSync({
        trackedId: "req_1",
        trackedStatus: "pending",
        trackedDueDate: null,
        obligationDueDate,
        syncDueDateWhenNotPending: false,
      }),
    ).toEqual({
      id: "req_1",
      dueDate: obligationDueDate,
    });
  });

  it("preserves operator-set certification expiry after status leaves pending", () => {
    expect(
      resolveTrackedRequirementDueDateSync({
        trackedId: "req_2",
        trackedStatus: "compliant",
        trackedDueDate: operatorExpiry,
        obligationDueDate,
        syncDueDateWhenNotPending: false,
      }),
    ).toBeNull();
  });

  it("continues syncing non-pending rows when certification mode is disabled", () => {
    expect(
      resolveTrackedRequirementDueDateSync({
        trackedId: "req_3",
        trackedStatus: "compliant",
        trackedDueDate: operatorExpiry,
        obligationDueDate,
        syncDueDateWhenNotPending: true,
      }),
    ).toEqual({
      id: "req_3",
      dueDate: obligationDueDate,
    });
  });
});
