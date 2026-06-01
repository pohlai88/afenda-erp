import { describe, expect, it } from "vitest";

import { mapWorkspaceItemsToApprovalQueueRows } from "../src/data/approvals.queue.mapper";
import { resolveApprovalQueueRowTrailingAction } from "../src/surface/approvals-queue-list-trailing.shared";

describe("approvals queue mapper", () => {
  it("maps route and escalation from work item metadata", () => {
    const rows = mapWorkspaceItemsToApprovalQueueRows([
      {
        id: "work-1",
        moduleId: "approvals",
        subject: "Capex request",
        owner: "Finance Controller",
        status: "escalated",
        priority: "high",
        due: "Jun 3",
        dueAt: "2026-06-03T00:00:00.000Z",
        sourceRecordId: "rec-1",
        metadata: { route: "capex", escalation: true },
      },
    ]);

    expect(rows[0]?.route).toBe("capex");
    expect(rows[0]?.escalated).toBe(true);
    expect(rows[0]?.sourceRecordHref).toBe("/approvals/records/rec-1");
    expect(rows[0]?.decisionComplete).toBe(false);
  });
});

describe("resolveApprovalQueueRowTrailingAction", () => {
  it("hides trailing actions for completed decisions", () => {
    const action = resolveApprovalQueueRowTrailingAction({
      decisionComplete: true,
      canDecide: true,
    });

    expect(action?.state).toBe("hidden");
  });

  it("blocks mutation without approvals.decide", () => {
    const action = resolveApprovalQueueRowTrailingAction({
      decisionComplete: false,
      canDecide: false,
    });

    expect(action?.state).toBe("disabled");
  });
});
