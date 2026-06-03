import { describe, expect, it } from "vitest";
import {
  approveActionSandbox,
  createActionSandbox,
  discardActionSandbox,
  rejectActionSandbox,
} from "../../src/ai-sandbox.action.server";

const baseSandbox = () =>
  createActionSandbox({
    organizationId: "org_test",
    moduleId: "finance",
    actionType: "recovery-task",
    title: "Fix margin leakage",
    riskLevel: "high",
    summary: "Approve margin recovery actions.",
    affectedRecords: ["record_1"],
    creates: 1,
    sourceEvidence: [],
    requiredHumanChecks: ["Confirm with CFO."],
  });

describe("sandbox state machine", () => {
  it("creates a sandbox in pending state", () => {
    const s = baseSandbox();
    expect(s.status).toBe("pending");
    expect(s.organizationId).toBe("org_test");
    expect(s.moduleId).toBe("finance");
  });

  it("approves a pending sandbox", () => {
    const s = approveActionSandbox({ sandbox: baseSandbox() });
    expect(s.status).toBe("approved");
    expect(s.approvedAt).toBeTruthy();
  });

  it("rejects a pending sandbox with a reason", () => {
    const s = rejectActionSandbox({
      sandbox: baseSandbox(),
      reason: "Not enough evidence.",
    });
    expect(s.status).toBe("rejected");
    expect(s.rejectionReason).toBe("Not enough evidence.");
    expect(s.rejectedAt).toBeTruthy();
  });

  it("discards a pending sandbox", () => {
    const s = discardActionSandbox({ sandbox: baseSandbox() });
    expect(s.status).toBe("discarded");
  });

  it("cannot approve an already-approved sandbox", () => {
    const s = approveActionSandbox({ sandbox: baseSandbox() });
    expect(() => approveActionSandbox({ sandbox: s })).toThrow();
  });

  it("cannot reject an already-approved sandbox", () => {
    const s = approveActionSandbox({ sandbox: baseSandbox() });
    expect(() =>
      rejectActionSandbox({ sandbox: s, reason: "Too late." }),
    ).toThrow();
  });

  it("cannot discard an already-rejected sandbox", () => {
    const s = rejectActionSandbox({
      sandbox: baseSandbox(),
      reason: "No.",
    });
    expect(() => discardActionSandbox({ sandbox: s })).toThrow();
  });
});
