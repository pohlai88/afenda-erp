import { describe, expect, it } from "vitest";

import {
  requiresHrApprovalStage,
  resolveLeaveApprovalRouteFromChain,
} from "@afenda/db";

describe("LAM-012/013 leave approval routing", () => {
  it("routes long duration to manager then HR", () => {
    const route = resolveLeaveApprovalRouteFromChain({
      employee: {
        employeeId: "emp-1",
        departmentId: "dept-1",
        grade: "G5",
        managerEmployeeId: "mgr-1",
      },
      leaveType: "annual",
      durationDays: 6,
      policy: {
        requireHrApprovalWhenDaysGte: 5,
        requireHrApprovalLeaveTypes: [],
        managerChainMaxDepth: 3,
      },
      managerEmployeeIds: ["mgr-1"],
    });

    expect(route.initialStage).toBe("manager");
    expect(route.requiresHrStage).toBe(true);
    expect(route.routingFactors.grade).toBe("G5");
  });

  it("flags HR approval for configured leave types", () => {
    expect(
      requiresHrApprovalStage({
        leaveType: "sick",
        durationDays: 1,
        policy: {
          requireHrApprovalWhenDaysGte: null,
          requireHrApprovalLeaveTypes: ["sick"],
          managerChainMaxDepth: 3,
        },
      }),
    ).toBe(true);
  });
});
