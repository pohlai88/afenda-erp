import { describe, expect, it } from "vitest";

import { evaluateHrShiftSwapEligibility } from "./hr.time.sft-swap-eligibility.shared";

describe("SFT swap eligibility (HRM-SFT-020)", () => {
  const baseAssignment = {
    assignmentId: "asg_1",
    employeeId: "emp_1",
    templateId: "tpl_day",
    shiftDate: new Date("2026-06-01T00:00:00.000Z"),
    status: "scheduled",
  };

  it("blocks swap when policy disables swap requests", () => {
    const result = evaluateHrShiftSwapEligibility({
      swapRequestsEnabled: false,
      requesterEmployeeId: "emp_1",
      requesterAssignment: baseAssignment,
    });

    expect(result.eligible).toBe(false);
    expect(result.reasons[0]).toMatch(/disabled/i);
  });

  it("blocks swap when requester does not own the assignment", () => {
    const result = evaluateHrShiftSwapEligibility({
      swapRequestsEnabled: true,
      requesterEmployeeId: "emp_2",
      requesterAssignment: baseAssignment,
    });

    expect(result.eligible).toBe(false);
    expect(result.reasons.join(" ")).toMatch(/assigned to you/i);
  });

  it("blocks swap when a pending swap already exists", () => {
    const result = evaluateHrShiftSwapEligibility({
      swapRequestsEnabled: true,
      requesterEmployeeId: "emp_1",
      requesterAssignment: baseAssignment,
      pendingSwapOnRequesterAssignment: true,
    });

    expect(result.eligible).toBe(false);
    expect(result.reasons.join(" ")).toMatch(/pending swap/i);
  });

  it("allows eligible open swap when policy and assignment checks pass", () => {
    const result = evaluateHrShiftSwapEligibility({
      swapRequestsEnabled: true,
      requesterEmployeeId: "emp_1",
      requesterAssignment: baseAssignment,
      targetEmployeeId: "emp_3",
    });

    expect(result.eligible).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });
});
